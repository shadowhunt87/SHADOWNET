// src/modules/missions/executors/command-executor.service.ts
// VERSIÓN 2.0 - FILESYSTEM VIRTUAL + PERMISOS + OUTPUTS REALISTAS

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { NarrativeService } from '../../narrative/narrative.service';
import { HookService } from '../../hook/hook.service';
import { CommandParser, ParsedCommand } from './command-parser';
import { CommandResult } from '../interfaces/mission-result.interface';
import { AttemptStatus } from '@prisma/client';

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface VirtualFile {
  name: string;
  type: 'file' | 'directory';
  permissions: string;
  owner: string;
  group: string;
  size: number;
  modified: string;
  content?: string;
  children?: string[];
  requiresRoot?: boolean;
  hidden?: boolean;
}

interface VirtualFilesystem {
  [path: string]: VirtualFile;
}

interface SessionState {
  currentUser: string;
  currentDirectory: string;
  hostname: string;
  isRoot: boolean;
  canSudo: boolean;
  sudoPassword?: string;
  sudoAuthenticated: boolean;
  filesystem: VirtualFilesystem;
  discoveredHosts: string[];
  capturedData: string[];
  environmentVars: Record<string, string>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

@Injectable()
export class CommandExecutorService {
  private readonly logger = new Logger(CommandExecutorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly narrativeService: NarrativeService,
    private readonly hookService: HookService,
    private readonly parser: CommandParser,
  ) {}

  async execute(attemptId: string, command: string): Promise<CommandResult> {
    const attempt = await this.prisma.missionAttempt.findUnique({
      where: { id: attemptId },
      include: { mission: true },
    });

    if (!attempt) {
      return this.fail('Attempt not found');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      return this.fail('Mission is not active', attempt.traceLevel);
    }

    const parsed = this.parser.parse(command);
    const allowedCommands = attempt.mission.allowedCommands as string[];

    if (!this.isCommandAllowed(parsed.baseCommand, allowedCommands)) {
      return this.handleUnauthorizedCommand(attemptId, command, attempt.traceLevel);
    }

    let sessionState = this.getSessionState(attempt);
    const result = await this.executeCommand(parsed, sessionState, attempt);
    await this.updateAttempt(attemptId, result, command, sessionState);

    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SESSION STATE
  // ═══════════════════════════════════════════════════════════════════════════════

  private getSessionState(attempt: any): SessionState {
    const sessionVars = attempt.sessionVariables as Record<string, any>;
    
    if (sessionVars._sessionState) {
      return sessionVars._sessionState as SessionState;
    }

    const username = sessionVars.username || 'shadow';
    
    return {
      currentUser: username,
      currentDirectory: `/home/${username}`,
      hostname: sessionVars.hostname || 'target',
      isRoot: false,
      canSudo: sessionVars.canSudo !== false,
      sudoPassword: sessionVars.sudoPassword || 'shadow123',
      sudoAuthenticated: false,
      filesystem: this.generateFilesystem(attempt.mission, sessionVars),
      discoveredHosts: [],
      capturedData: [],
      environmentVars: {
        PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        HOME: `/home/${username}`,
        USER: username,
        SHELL: '/bin/bash',
        PWD: `/home/${username}`,
      },
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // FILESYSTEM GENERATOR
  // ═══════════════════════════════════════════════════════════════════════════════

  private generateFilesystem(mission: any, sessionVars: Record<string, any>): VirtualFilesystem {
    const username = sessionVars.username || 'shadow';
    const targetIp = sessionVars.target_ip || '10.0.0.100';
    
    const fs: VirtualFilesystem = {
      '/': {
        name: '/', type: 'directory', permissions: 'drwxr-xr-x',
        owner: 'root', group: 'root', size: 4096, modified: '2024-01-15 10:00',
        children: ['bin', 'etc', 'home', 'opt', 'proc', 'root', 'tmp', 'var'],
      },
      '/etc': {
        name: 'etc', type: 'directory', permissions: 'drwxr-xr-x',
        owner: 'root', group: 'root', size: 4096, modified: '2024-01-15 10:00',
        children: ['passwd', 'shadow', 'hosts', 'hostname', 'ssh', 'crontab'],
      },
      '/etc/passwd': {
        name: 'passwd', type: 'file', permissions: '-rw-r--r--',
        owner: 'root', group: 'root', size: 1842, modified: '2024-01-10 08:30',
        content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
${username}:x:1000:1000:${username}:/home/${username}:/bin/bash
admin:x:1001:1001:Administrator:/home/admin:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin`,
      },
      '/etc/shadow': {
        name: 'shadow', type: 'file', permissions: '-rw-r-----',
        owner: 'root', group: 'shadow', size: 1256, modified: '2024-01-10 08:30',
        requiresRoot: true,
        content: `root:$6$xyz123$hashedpassword:19000:0:99999:7:::
${username}:$6$abc456$anotherhash:19500:0:99999:7:::
admin:$6$def789$adminhash:19400:0:99999:7:::`,
      },
      '/etc/hosts': {
        name: 'hosts', type: 'file', permissions: '-rw-r--r--',
        owner: 'root', group: 'root', size: 221, modified: '2024-01-05 12:00',
        content: `127.0.0.1       localhost
127.0.1.1       ${sessionVars.hostname || 'target'}
${targetIp}     target.local
192.168.1.1     gateway.local`,
      },
      '/etc/hostname': {
        name: 'hostname', type: 'file', permissions: '-rw-r--r--',
        owner: 'root', group: 'root', size: 12, modified: '2024-01-01 00:00',
        content: sessionVars.hostname || 'target',
      },
      '/home': {
        name: 'home', type: 'directory', permissions: 'drwxr-xr-x',
        owner: 'root', group: 'root', size: 4096, modified: '2024-01-15 10:00',
        children: [username, 'admin'],
      },
      [`/home/${username}`]: {
        name: username, type: 'directory', permissions: 'drwxr-xr-x',
        owner: username, group: username, size: 4096, modified: '2024-01-20 15:30',
        children: ['.bashrc', '.bash_history', 'notes.txt', 'tools'],
      },
      [`/home/${username}/.bashrc`]: {
        name: '.bashrc', type: 'file', permissions: '-rw-r--r--',
        owner: username, group: username, size: 3771, modified: '2024-01-01 00:00',
        hidden: true,
        content: `# ~/.bashrc
export PS1='\\u@\\h:\\w\\$ '
alias ll='ls -la'`,
      },
      [`/home/${username}/.bash_history`]: {
        name: '.bash_history', type: 'file', permissions: '-rw-------',
        owner: username, group: username, size: 512, modified: '2024-01-20 15:30',
        hidden: true,
        content: `cd /var/log
cat auth.log
nmap -sV localhost
ssh admin@192.168.1.50`,
      },
      [`/home/${username}/notes.txt`]: {
        name: 'notes.txt', type: 'file', permissions: '-rw-r--r--',
        owner: username, group: username, size: 256, modified: '2024-01-18 09:15',
        content: `=== NOTAS ===
- El admin usa contraseñas débiles
- Backup server: ${targetIp}
- Puerto alternativo: 8443`,
      },
      '/home/admin': {
        name: 'admin', type: 'directory', permissions: 'drwx------',
        owner: 'admin', group: 'admin', size: 4096, modified: '2024-01-19 11:00',
        requiresRoot: true,
        children: ['.bashrc', 'credentials.txt'],
      },
      '/home/admin/credentials.txt': {
        name: 'credentials.txt', type: 'file', permissions: '-rw-------',
        owner: 'admin', group: 'admin', size: 156, modified: '2024-01-19 11:00',
        requiresRoot: true,
        content: `=== CREDENCIALES ===
SSH Root: root / Tr0ub4dor&3
Database: admin / ${sessionVars.ssh_password || 'admin123'}`,
      },
      '/root': {
        name: 'root', type: 'directory', permissions: 'drwx------',
        owner: 'root', group: 'root', size: 4096, modified: '2024-01-15 10:00',
        requiresRoot: true,
        children: ['.bashrc', '.bash_history'],
      },
      '/root/.bash_history': {
        name: '.bash_history', type: 'file', permissions: '-rw-------',
        owner: 'root', group: 'root', size: 1024, modified: '2024-01-20 16:00',
        hidden: true, requiresRoot: true,
        content: `mysql -u root -p'secretpassword123'
tar -czf /backup/full_backup.tar.gz /var/www
cat /etc/shadow`,
      },
      '/tmp': {
        name: 'tmp', type: 'directory', permissions: 'drwxrwxrwt',
        owner: 'root', group: 'root', size: 4096, modified: '2024-01-20 17:00',
        children: [],
      },
      '/var': {
        name: 'var', type: 'directory', permissions: 'drwxr-xr-x',
        owner: 'root', group: 'root', size: 4096, modified: '2024-01-15 10:00',
        children: ['log', 'www', 'backups'],
      },
      '/var/log': {
        name: 'log', type: 'directory', permissions: 'drwxr-xr-x',
        owner: 'root', group: 'syslog', size: 4096, modified: '2024-01-20 17:30',
        children: ['syslog', 'auth.log'],
      },
      '/var/log/auth.log': {
        name: 'auth.log', type: 'file', permissions: '-rw-r-----',
        owner: 'syslog', group: 'adm', size: 45678, modified: '2024-01-20 17:30',
        content: `Jan 20 17:25:01 target sshd[1234]: Accepted password for admin from 192.168.1.50
Jan 20 17:28:15 target sudo: admin : TTY=pts/0 ; USER=root ; COMMAND=/bin/cat /etc/shadow`,
      },
      '/var/www': {
        name: 'www', type: 'directory', permissions: 'drwxr-xr-x',
        owner: 'root', group: 'root', size: 4096, modified: '2024-01-15 10:00',
        children: ['html'],
      },
      '/var/www/html': {
        name: 'html', type: 'directory', permissions: 'drwxr-xr-x',
        owner: 'www-data', group: 'www-data', size: 4096, modified: '2024-01-18 14:00',
        children: ['index.html', 'config.php'],
      },
      '/var/www/html/config.php': {
        name: 'config.php', type: 'file', permissions: '-rw-r--r--',
        owner: 'www-data', group: 'www-data', size: 512, modified: '2024-01-18 14:00',
        content: `<?php
define('DB_USER', 'webapp');
define('DB_PASS', 'w3b4pp_s3cr3t');
define('DEBUG', true);
?>`,
      },
      '/var/backups': {
        name: 'backups', type: 'directory', permissions: 'drwxr-xr-x',
        owner: 'root', group: 'root', size: 4096, modified: '2024-01-20 03:00',
        children: ['classified'],
      },
      '/var/backups/classified': {
        name: 'classified', type: 'directory', permissions: 'drwxr-x---',
        owner: 'root', group: 'admin', size: 4096, modified: '2024-01-20 03:00',
        children: ['proyecto_fenix.zip', 'README.txt'],
      },
      '/var/backups/classified/proyecto_fenix.zip': {
        name: 'proyecto_fenix.zip', type: 'file', permissions: '-rw-r-----',
        owner: 'root', group: 'admin', size: 2457600, modified: '2024-01-20 03:00',
        content: '[BINARY DATA - ZIP ARCHIVE - 2.3GB]',
      },
      '/var/backups/classified/README.txt': {
        name: 'README.txt', type: 'file', permissions: '-rw-r-----',
        owner: 'root', group: 'admin', size: 256, modified: '2024-01-20 03:00',
        content: `PROYECTO FÉNIX - CLASIFICADO
Contacto: director@blacksphere.local`,
      },
      '/proc': {
        name: 'proc', type: 'directory', permissions: 'dr-xr-xr-x',
        owner: 'root', group: 'root', size: 0, modified: '2024-01-20 17:00',
        children: ['version', 'cpuinfo'],
      },
      '/proc/version': {
        name: 'version', type: 'file', permissions: '-r--r--r--',
        owner: 'root', group: 'root', size: 128, modified: '2024-01-20 17:00',
        content: 'Linux version 5.15.0-91-generic (buildd@ubuntu) (gcc 11.4.0) #101-Ubuntu SMP',
      },
    };

    this.addMissionSpecificFiles(fs, mission, sessionVars);
    return fs;
  }
  // ═══ PROCESS MANAGEMENT ═══

  private simulateKill(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    const pid = parsed.args[0];
    if (!pid) {
      return { output: 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...', success: false };
    }

    if (!state.isRoot && pid === '1337') {
      return { output: 'kill: (1337) - Operation not permitted', success: false };
    }

    return { output: '', success: true };
  }

  private simulatePkill(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    const pattern = parsed.args[0];
    if (!pattern) {
      return { output: 'pkill: no matching criteria specified', success: false };
    }

    if (pattern.toLowerCase() === 'viper' || parsed.fullCommand.includes('viper')) {
      if (!state.isRoot) {
        return { output: 'pkill: killing pid 1337 failed: Operation not permitted', success: false };
      }
    }

    return { output: '', success: true };
  }

  // ═══ USER MANAGEMENT ═══

  private simulatePasswd(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    const targetUser = parsed.args[parsed.args.length - 1] || state.currentUser;
    const isLock = parsed.fullCommand.includes('-l');

    if (targetUser !== state.currentUser && !state.isRoot) {
      return { output: `passwd: Permission denied.`, success: false };
    }

    if (isLock && !state.isRoot) {
      return { output: 'passwd: Permission denied.', success: false };
    }

    if (isLock) {
      return { output: `passwd: password expiry information changed for ${targetUser}`, success: true };
    }

    return { output: `passwd: password updated successfully`, success: true };
  }

  private simulateUsermod(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    if (!state.isRoot) {
      return { output: 'usermod: Permission denied.', success: false };
    }

    const targetUser = parsed.args[parsed.args.length - 1];
    if (!targetUser) {
      return { output: 'usermod: user name required', success: false };
    }

    return { output: '', success: true };
  }

  private simulateUseradd(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    if (!state.isRoot) {
      return { output: 'useradd: Permission denied.', success: false };
    }

    const username = parsed.args[parsed.args.length - 1];
    if (!username) {
      return { output: 'useradd: user name required', success: false };
    }

    if (state.filesystem[`/home/${username}`]) {
      return { output: `useradd: user '${username}' already exists`, success: false };
    }

    state.filesystem[`/home/${username}`] = {
      name: username, type: 'directory', permissions: 'drwxr-xr-x',
      owner: username, group: username, size: 4096,
      modified: new Date().toISOString().split('T')[0],
      children: [],
    };

    return { output: '', success: true };
  }

  private addMissionSpecificFiles(fs: VirtualFilesystem, mission: any, sessionVars: Record<string, any>): void {
    const nodeNumber = mission.nodeNumber;
    const username = sessionVars.username || 'shadow';

    if (nodeNumber === 4) {
      fs['/tmp/capture.pcap'] = {
        name: 'capture.pcap', type: 'file', permissions: '-rw-r--r--',
        owner: username, group: 'users', size: 1048576, modified: '2024-01-20 17:45',
        content: `[PCAP DATA]
GET /api/login HTTP/1.1
Authorization: Basic am1hcnRpbmV6OlNlY3JldFBhc3MxMjM=
X-User: j.martinez@techcorp.local`,
      };
    }

    if (nodeNumber === 5) {
      fs['/tmp/hashes.txt'] = {
        name: 'hashes.txt', type: 'file', permissions: '-rw-r--r--',
        owner: username, group: 'users', size: 4096, modified: '2024-01-20 18:00',
        content: `$krb5tgs$23$*svc_sql$BLACKSPHERE.LOCAL$MSSQLSvc/db01*$a1b2c3d4...`,
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // COMMAND EXECUTION ENGINE
  // ═══════════════════════════════════════════════════════════════════════════════

  private async executeCommand(parsed: ParsedCommand, state: SessionState, attempt: any): Promise<CommandResult> {
    const mission = attempt.mission;
    const objectives = attempt.selectedObjectives as any[];
    const completed = attempt.objectivesCompleted as string[];
    const isTutorial = mission.nodeNumber === 0;

    let output: string;
    let traceImpact = 0;
    let commandSuccess = true;

    switch (parsed.baseCommand) {
      case 'whoami':
        output = state.currentUser;
        traceImpact = 2;
        break;

      case 'id':
        output = this.simulateId(state);
        traceImpact = 3;
        break;

      case 'hostname':
        output = state.hostname;
        traceImpact = 1;
        break;

      case 'uname':
        output = this.simulateUname(parsed);
        traceImpact = 2;
        break;

      case 'pwd':
        output = state.currentDirectory;
        traceImpact = 1;
        break;

      case 'cd':
        const cdResult = this.simulateCd(parsed, state);
        output = cdResult.output;
        commandSuccess = cdResult.success;
        traceImpact = 2;
        break;

      case 'ls':
        const lsResult = this.simulateLs(parsed, state);
        output = lsResult.output;
        commandSuccess = lsResult.success;
        traceImpact = 3;
        break;

      case 'cat':
      case 'less':
      case 'more':
        const catResult = this.simulateCat(parsed, state);
        output = catResult.output;
        commandSuccess = catResult.success;
        traceImpact = catResult.requiresRoot ? 8 : 4;
        break;

      case 'head':
        const headResult = this.simulateHead(parsed, state);
        output = headResult.output;
        commandSuccess = headResult.success;
        traceImpact = 3;
        break;

      case 'tail':
        const tailResult = this.simulateTail(parsed, state);
        output = tailResult.output;
        commandSuccess = tailResult.success;
        traceImpact = 3;
        break;

      case 'find':
        const findResult = this.simulateFind(parsed, state);
        output = findResult.output;
        commandSuccess = findResult.success;
        traceImpact = 10;
        break;

      case 'grep':
        const grepResult = this.simulateGrep(parsed, state);
        output = grepResult.output;
        commandSuccess = grepResult.success;
        traceImpact = 5;
        break;

      case 'cp':
        const cpResult = this.simulateCp(parsed, state);
        output = cpResult.output;
        commandSuccess = cpResult.success;
        traceImpact = 8;
        break;

      case 'rm':
        const rmResult = this.simulateRm(parsed, state);
        output = rmResult.output;
        commandSuccess = rmResult.success;
        traceImpact = rmResult.success ? -5 : 5;
        break;

      case 'echo':
        const echoResult = this.simulateEcho(parsed, state);
        output = echoResult.output;
        commandSuccess = echoResult.success;
        traceImpact = 2;
        break;

      case 'ifconfig':
      case 'ip':
        output = this.simulateIfconfig(state, attempt.sessionVariables);
        traceImpact = 5;
        break;

      case 'ping':
        const pingResult = this.simulatePing(parsed, state, attempt.sessionVariables);
        output = pingResult.output;
        commandSuccess = pingResult.success;
        traceImpact = 6;
        break;

      case 'nmap':
        const nmapResult = this.simulateNmap(parsed, state, attempt.sessionVariables);
        output = nmapResult.output;
        commandSuccess = nmapResult.success;
        traceImpact = this.calculateNmapTrace(parsed);
        break;

      case 'netstat':
      case 'ss':
        output = this.simulateNetstat(state, attempt.sessionVariables);
        traceImpact = 6;
        break;

      case 'tcpdump':
        const tcpdumpResult = this.simulateTcpdump(parsed, state);
        output = tcpdumpResult.output;
        commandSuccess = tcpdumpResult.success;
        traceImpact = 15;
        break;

      case 'ps':
        output = this.simulatePs(parsed, state);
        traceImpact = 4;
        break;

      case 'lsof':
        output = this.simulateLsof(parsed, attempt.sessionVariables);
        traceImpact = 8;
        break;

      case 'sudo':
        const sudoResult = await this.simulateSudo(parsed, state, attempt);
        output = sudoResult.output;
        commandSuccess = sudoResult.success;
        state = sudoResult.newState;
        traceImpact = sudoResult.traceImpact;
        break;

      case 'su':
        const suResult = this.simulateSu(parsed, state);
        output = suResult.output;
        commandSuccess = suResult.success;
        // El estado ya se actualiza dentro de simulateSu
        traceImpact = 20;
        break;

      case 'scp':
        const scpResult = this.simulateScp(parsed, state);
        output = scpResult.output;
        commandSuccess = scpResult.success;
        traceImpact = 25;
        break;

      case 'strings':
        const stringsResult = this.simulateStrings(parsed, state);
        output = stringsResult.output;
        commandSuccess = stringsResult.success;
        traceImpact = 3;
        break;

      case 'impacket-psexec':
      case 'impacket-wmiexec':
      case 'impacket-smbexec':
        const psexecResult = this.simulatePsexec(parsed, attempt.sessionVariables);
        output = psexecResult.output;
        commandSuccess = psexecResult.success;
        traceImpact = 35;
        break;

      case 'impacket-secretsdump':
        const secretsResult = this.simulateSecretsdump(attempt.sessionVariables);
        output = secretsResult.output;
        commandSuccess = secretsResult.success;
        traceImpact = 45;
        break;

      case 'impacket-GetUserSPNs':
        const spnResult = this.simulateGetUserSPNs(parsed, state, attempt.sessionVariables);
        output = spnResult.output;
        commandSuccess = spnResult.success;
        traceImpact = 18;
        break;

      case 'impacket-GetADUsers':
        const adUsersResult = this.simulateGetADUsers(attempt.sessionVariables);
        output = adUsersResult.output;
        traceImpact = 15;
        break;

      case 'crackmapexec':
      case 'cme':
        const cmeResult = this.simulateCrackmapexec(parsed, attempt.sessionVariables);
        output = cmeResult.output;
        commandSuccess = cmeResult.success;
        traceImpact = 12;
        break;

      case 'hashcat':
      case 'john':
        const crackResult = this.simulateHashcrack(parsed);
        output = crackResult.output;
        commandSuccess = crackResult.success;
        traceImpact = 0;
        break;

      case 'clear':
        output = '\x1Bc';
        traceImpact = 0;
        break;

      case 'help':
        output = this.simulateHelp(mission.allowedCommands as string[]);
        traceImpact = 0;
        break;

      case 'history':
        output = this.simulateHistory(attempt);
        traceImpact = 0;
        break;

     case 'kill':
        const killResult = this.simulateKill(parsed, state);
        output = killResult.output;
        commandSuccess = killResult.success;
        traceImpact = 12;
        break;

      case 'pkill':
      case 'killall':
        const pkillResult = this.simulatePkill(parsed, state);
        output = pkillResult.output;
        commandSuccess = pkillResult.success;
        traceImpact = 15;
        break;

      case 'passwd':
        const passwdResult = this.simulatePasswd(parsed, state);
        output = passwdResult.output;
        commandSuccess = passwdResult.success;
        traceImpact = 10;
        break;

      case 'usermod':
        const usermodResult = this.simulateUsermod(parsed, state);
        output = usermodResult.output;
        commandSuccess = usermodResult.success;
        traceImpact = 12;
        break;

      case 'useradd':
      case 'adduser':
        const useraddResult = this.simulateUseradd(parsed, state);
        output = useraddResult.output;
        commandSuccess = useraddResult.success;
        traceImpact = 15;
        break;

      // ═══ FIN DE LOS NUEVOS ═══

      default:
        output = `${parsed.baseCommand}: command not found`;
        commandSuccess = false;
        traceImpact = 5;
    }
    const newTrace = Math.min(100, Math.max(0, attempt.traceLevel + traceImpact));

    const matchedObjective = this.checkObjectiveCompletion(parsed, state, objectives, completed, commandSuccess);

    const result: CommandResult = {
      output,
      success: commandSuccess,
      newTraceLevel: newTrace,
      traceIncrement: traceImpact,
    };

    // Add prompt info
    (result as any).currentPrompt = this.buildPrompt(state);
    (result as any).currentDirectory = state.currentDirectory;
    (result as any).currentUser = state.currentUser;
    (result as any).isRoot = state.isRoot;

    if (isTutorial) {
      const activeObjective = objectives.find(o => !completed.includes(o.code));
      if (activeObjective) {
        if (matchedObjective) {
          result.objectiveCompleted = matchedObjective.code;
          result.objectiveDescription = matchedObjective.description;
          result.tutorialMessage = matchedObjective.tutorialDialogue?.onSuccess || [];
          const remaining = objectives.filter(o => !completed.includes(o.code) && o.code !== matchedObjective.code);
          if (remaining.length === 0) result.isMissionComplete = true;
        } else if (!commandSuccess) {
          result.tutorialMessage = activeObjective.tutorialDialogue?.onError || [];
        }
      }
    } else {
      if (matchedObjective) {
        result.objectiveCompleted = matchedObjective.code;
        result.objectiveDescription = matchedObjective.description;
        const remaining = objectives.filter(o => !completed.includes(o.code) && o.code !== matchedObjective.code);
        if (remaining.length === 0) result.isMissionComplete = true;
      }
    }

   // DESPUÉS:
      if (newTrace >= 70) {
        const warning = this.narrativeService.getTraceWarningDialogue(newTrace);
        if (warning) {
          result.traceWarning = warning;
        }
      }

    if (newTrace >= 100) {
      result.isMissionFailed = true;
      result.fbiCapture = this.narrativeService.getFbiCaptureDialogue('trace_maxed');
      result.hookDamage = 15;
    }
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // SIMULATORS
  // ═══════════════════════════════════════════════════════════════════════════════

  private simulateId(state: SessionState): string {
    if (state.isRoot) {
      return 'uid=0(root) gid=0(root) groups=0(root)';
    }
    return `uid=1000(${state.currentUser}) gid=1000(${state.currentUser}) groups=1000(${state.currentUser}),27(sudo)`;
  }

  private simulateUname(parsed: ParsedCommand): string {
    if (parsed.flags['a'] || parsed.fullCommand.includes('-a')) {
      return 'Linux target 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
    }
    return 'Linux';
  }

  private simulateCd(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    const target = parsed.args[0] || state.environmentVars.HOME;
    const resolvedPath = this.resolvePath(target, state.currentDirectory);
    const targetDir = state.filesystem[resolvedPath];

    if (!targetDir) {
      return { output: `bash: cd: ${target}: No such file or directory`, success: false };
    }
    if (targetDir.type !== 'directory') {
      return { output: `bash: cd: ${target}: Not a directory`, success: false };
    }
    if (targetDir.requiresRoot && !state.isRoot) {
      return { output: `bash: cd: ${target}: Permission denied`, success: false };
    }

    state.currentDirectory = resolvedPath;
    state.environmentVars.PWD = resolvedPath;
    return { output: '', success: true };
  }

  private simulateLs(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    const target = parsed.args[0] || state.currentDirectory;
    const resolvedPath = this.resolvePath(target, state.currentDirectory);
    const showAll = parsed.fullCommand.includes('-a') || parsed.fullCommand.includes('-la');
    const longFormat = parsed.fullCommand.includes('-l') || parsed.fullCommand.includes('-la');

    const dir = state.filesystem[resolvedPath];

    if (!dir) {
      return { output: `ls: cannot access '${target}': No such file or directory`, success: false };
    }
    if (dir.type !== 'directory') {
      if (longFormat) {
        return { output: `${dir.permissions} 1 ${dir.owner} ${dir.group} ${dir.size} ${dir.modified} ${dir.name}`, success: true };
      }
      return { output: dir.name, success: true };
    }
    if (dir.requiresRoot && !state.isRoot) {
      return { output: `ls: cannot open directory '${target}': Permission denied`, success: false };
    }

    const children = dir.children || [];
    let items = children.map(childName => {
      const childPath = resolvedPath === '/' ? `/${childName}` : `${resolvedPath}/${childName}`;
      return state.filesystem[childPath] || { name: childName, type: 'file', permissions: '-rw-r--r--', owner: 'root', group: 'root', size: 0, modified: '2024-01-01' };
    });

    if (!showAll) {
      items = items.filter(item => !item.hidden && !item.name.startsWith('.'));
    }

    if (items.length === 0) return { output: '', success: true };

    if (longFormat) {
      const lines = items.map(item => `${item.permissions} 1 ${item.owner.padEnd(8)} ${item.group.padEnd(8)} ${item.size.toString().padStart(8)} ${item.modified} ${item.name}`);
      return { output: `total ${items.length * 4}\n${lines.join('\n')}`, success: true };
    }

    return { output: items.map(i => i.name).join('  '), success: true };
  }

  private simulateCat(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean; requiresRoot: boolean } {
    if (parsed.args.length === 0) {
      return { output: 'cat: missing operand', success: false, requiresRoot: false };
    }

    const target = parsed.args[0];
    const resolvedPath = this.resolvePath(target, state.currentDirectory);
    const file = state.filesystem[resolvedPath];

    if (!file) {
      return { output: `cat: ${target}: No such file or directory`, success: false, requiresRoot: false };
    }
    if (file.type === 'directory') {
      return { output: `cat: ${target}: Is a directory`, success: false, requiresRoot: false };
    }
    if (file.requiresRoot && !state.isRoot) {
      return { output: `cat: ${target}: Permission denied`, success: false, requiresRoot: true };
    }

    return { output: file.content || '', success: true, requiresRoot: !!file.requiresRoot };
  }

  private simulateHead(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    const catResult = this.simulateCat(parsed, state);
    if (!catResult.success) return catResult;
    const lines = catResult.output.split('\n');
    const numLines = parseInt(parsed.flags['n'] as string) || 10;
    return { output: lines.slice(0, numLines).join('\n'), success: true };
  }

  private simulateTail(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    const catResult = this.simulateCat(parsed, state);
    if (!catResult.success) return catResult;
    const lines = catResult.output.split('\n');
    const numLines = parseInt(parsed.flags['n'] as string) || 10;
    return { output: lines.slice(-numLines).join('\n'), success: true };
  }

  private simulateFind(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    const searchPath = parsed.args[0] || state.currentDirectory;
    const namePattern = parsed.flags['name'] as string;
    const results: string[] = [];

    for (const [path, file] of Object.entries(state.filesystem)) {
      if (!path.startsWith(searchPath === '/' ? '/' : searchPath)) continue;
      if (namePattern) {
        const pattern = namePattern.replace(/\*/g, '.*').replace(/\?/g, '.');
        if (new RegExp(pattern).test(file.name)) results.push(path);
      } else {
        results.push(path);
      }
    }

    return { output: results.join('\n') || '', success: true };
  }

  private simulateGrep(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    if (parsed.args.length < 2) {
      return { output: 'Usage: grep PATTERN FILE', success: false };
    }

    const pattern = parsed.args[0];
    const target = parsed.args[1];
    const resolvedPath = this.resolvePath(target, state.currentDirectory);
    const file = state.filesystem[resolvedPath];

    if (!file || file.type === 'directory') {
      return { output: `grep: ${target}: No such file or directory`, success: false };
    }
    if (file.requiresRoot && !state.isRoot) {
      return { output: `grep: ${target}: Permission denied`, success: false };
    }

    const lines = (file.content || '').split('\n');
    const matches = lines.filter(line => line.toLowerCase().includes(pattern.toLowerCase()));
    return { output: matches.join('\n'), success: matches.length > 0 };
  }

  private simulateCp(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    if (parsed.args.length < 2) {
      return { output: 'cp: missing file operand', success: false };
    }

    const source = parsed.args[0];
    const dest = parsed.args[1];
    const sourcePath = this.resolvePath(source, state.currentDirectory);
    const destPath = this.resolvePath(dest, state.currentDirectory);
    const sourceFile = state.filesystem[sourcePath];

    if (!sourceFile) {
      return { output: `cp: cannot stat '${source}': No such file or directory`, success: false };
    }
    if (sourceFile.requiresRoot && !state.isRoot) {
      return { output: `cp: cannot open '${source}': Permission denied`, success: false };
    }

    const destDir = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
    if (!this.canWriteTo(destDir, state)) {
      return { output: `cp: cannot create '${dest}': Permission denied`, success: false };
    }

    state.filesystem[destPath] = { ...sourceFile, name: dest.split('/').pop()!, owner: state.currentUser, group: state.currentUser };
    return { output: '', success: true };
  }

  private simulateRm(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    if (parsed.args.length === 0) {
      return { output: 'rm: missing operand', success: false };
    }

    const target = parsed.args[0];
    const resolvedPath = this.resolvePath(target, state.currentDirectory);
    
    if (!state.filesystem[resolvedPath]) {
      return { output: `rm: cannot remove '${target}': No such file or directory`, success: false };
    }

    const parentDir = resolvedPath.substring(0, resolvedPath.lastIndexOf('/')) || '/';
    if (!this.canWriteTo(parentDir, state)) {
      return { output: `rm: cannot remove '${target}': Permission denied`, success: false };
    }

    delete state.filesystem[resolvedPath];
    return { output: '', success: true };
  }

  private simulateEcho(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    const text = parsed.args.join(' ');
    const fullCmd = parsed.fullCommand;

    if (fullCmd.includes('>')) {
      const parts = fullCmd.split('>');
      const fileName = parts[1].trim();
      const resolvedPath = this.resolvePath(fileName, state.currentDirectory);
      const dir = resolvedPath.substring(0, resolvedPath.lastIndexOf('/')) || '/';

      if (!this.canWriteTo(dir, state)) {
        return { output: `bash: ${fileName}: Permission denied`, success: false };
      }

      state.filesystem[resolvedPath] = {
        name: fileName.split('/').pop()!, type: 'file', permissions: '-rw-r--r--',
        owner: state.currentUser, group: state.currentUser, size: text.length,
        modified: new Date().toISOString().split('T')[0], content: text,
      };
      return { output: '', success: true };
    }

    return { output: text, success: true };
  }

  private simulateIfconfig(state: SessionState, sessionVars: Record<string, any>): string {
    const localIp = sessionVars.local_ip || '192.168.1.100';
    return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet ${localIp}  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 08:00:27:8e:8a:a8  txqueuelen 1000  (Ethernet)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0`;
  }

 private simulatePing(parsed: ParsedCommand, state: SessionState, sessionVars: Record<string, any>): { output: string; success: boolean } {
  const target = parsed.args[0];
  if (!target) {
    return { output: 'ping: usage error: Destination address required', success: false };
  }

  // ═══ VALIDAR TARGETS CONOCIDOS ═══
  const validTargets = [
    'localhost',
    '127.0.0.1',
    sessionVars.local_ip || '192.168.1.100',
    sessionVars.target_ip || '10.0.0.100',
    sessionVars.target_dc || '10.10.10.100',
    sessionVars.gateway_ip || '192.168.1.1',
    '192.168.1.1',
    '10.0.0.1',
    '10.0.0.50', // Servidor del Boss
  ];

  // Agregar hosts descubiertos como válidos
  const allValidTargets = [...validTargets, ...state.discoveredHosts];

  // Verificar si es un target válido o una IP con formato correcto en rango conocido
  const isValidTarget = allValidTargets.some(valid => 
    target === valid || 
    target.startsWith('192.168.') ||
    target.startsWith('10.0.0.') ||
    target.startsWith('10.10.10.')
  );

  // ═══ TARGET INVÁLIDO → ERROR DE CONEXIÓN ═══
  if (!isValidTarget) {
    const resolvedIp = target.match(/^\d+\.\d+\.\d+\.\d+$/) ? target : `0.0.0.${target}`;
    return {
      output: `PING ${target} (${resolvedIp}) 56(84) bytes of data.
^C
--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss, time 2045ms`,
      success: false
    };
  }

  // ═══ TARGET VÁLIDO → RESPUESTA NORMAL ═══
  const count = parseInt(parsed.flags['c'] as string) || 3;
  const targetIp = target === 'localhost' ? '127.0.0.1' : target;

  let lines = [`PING ${target} (${targetIp}) 56(84) bytes of data.`];
  for (let i = 0; i < count; i++) {
    const time = (Math.random() * 50 + 10).toFixed(2);
    lines.push(`64 bytes from ${targetIp}: icmp_seq=${i + 1} ttl=64 time=${time} ms`);
  }
  lines.push('');
  lines.push(`--- ${target} ping statistics ---`);
  lines.push(`${count} packets transmitted, ${count} received, 0% packet loss, time ${count * 1000}ms`);

  // Registrar host descubierto
  if (target !== 'localhost' && target !== '127.0.0.1' && !state.discoveredHosts.includes(targetIp)) {
    state.discoveredHosts.push(targetIp);
  }

  return { output: lines.join('\n'), success: true };
}

private simulateNmap(parsed: ParsedCommand, state: SessionState, sessionVars: Record<string, any>): { output: string; success: boolean } {
  const target = parsed.args[0];
  if (!target) {
    return { output: 'Nmap: No targets specified', success: false };
  }

  // ═══ VALIDAR TARGET ═══
  const validTargets = [
    'localhost', '127.0.0.1',
    sessionVars.local_ip || '192.168.1.100',
    sessionVars.target_ip || '10.0.0.100',
    sessionVars.target_dc || '10.10.10.100',
    '192.168.1.1', '10.0.0.1', '10.0.0.50',
    ...state.discoveredHosts,
  ];

  // Verificar si es IP válida o rango conocido
  const isValidIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?$/.test(target);
  const isKnownRange = target.startsWith('192.168.') || 
                       target.startsWith('10.0.0.') || 
                       target.startsWith('10.10.10.');
  const isValidTarget = validTargets.includes(target) || isKnownRange;

  if (!isValidIp && !isValidTarget) {
    return { 
      output: `Failed to resolve "${target}".`, 
      success: false 
    };
  }

  if (isValidIp && !isValidTarget && !isKnownRange) {
    return {
      output: `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`,
      success: false
    };
  }

  // ═══ TARGET VÁLIDO - CONTINUAR NORMAL ═══
  const isPingScan = parsed.fullCommand.includes('-sn');
  const isVersionScan = parsed.fullCommand.includes('-sV');
  const dcIp = sessionVars.target_dc || sessionVars.dc_ip || '10.10.10.100';

  let output = `Starting Nmap 7.94 ( https://nmap.org )\n`;

  if (isPingScan) {
    // Ping scan de red
    if (target.includes('/')) {
      output += `Nmap scan report for ${target}\n`;
      output += `Host is up (0.0010s latency).\n`;
      output += `Nmap done: 256 IP addresses (3 hosts up) scanned in 2.34 seconds`;
    } else {
      output += `Nmap scan report for ${target}\nHost is up.\n`;
      output += `Nmap done: 1 IP address (1 host up) scanned in 0.05 seconds`;
    }
  } else {
    output += `Nmap scan report for ${target}\nHost is up (0.00052s latency).\n\n`;
    output += `PORT      STATE  SERVICE\n`;

    if (target.includes('10.10.10') || target === dcIp) {
      output += `22/tcp    open   ssh\n88/tcp    open   kerberos\n135/tcp   open   msrpc\n389/tcp   open   ldap\n445/tcp   open   microsoft-ds\n3389/tcp  open   ms-wbt-server\n`;
    } else {
      output += `22/tcp    open   ssh\n80/tcp    open   http\n443/tcp   open   https\n3306/tcp  open   mysql\n`;
    }

    if (isVersionScan) {
      output += `\nService Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel`;
    }
    output += `\nNmap done: 1 IP address (1 host up) scanned in 15.67 seconds`;
  }

  // Registrar host descubierto
  if (!state.discoveredHosts.includes(target) && isValidIp) {
    state.discoveredHosts.push(target);
  }

  return { output, success: true };
}

  private calculateNmapTrace(parsed: ParsedCommand): number {
    let trace = 15;
    if (parsed.fullCommand.includes('-sV')) trace += 5;
    if (parsed.fullCommand.includes('-sC')) trace += 5;
    if (parsed.fullCommand.includes('-A')) trace += 15;
    if (parsed.fullCommand.includes('-sn')) trace = 8;
    return trace;
  }

  private simulateNetstat(state: SessionState, sessionVars: Record<string, any>): string {
    const localIp = sessionVars.local_ip || '192.168.1.100';
    return `Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 ${localIp}:8443        45.33.32.156:443        ESTABLISHED`;
  }

private simulateTcpdump(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
  // Requiere root o sudo
  if (!state.isRoot && !parsed.fullCommand.includes('sudo')) {
    return { output: 'tcpdump: eth0: You don\'t have permission to capture on that device\n(socket: Operation not permitted)', success: false };
  }

  // Verificar si especificó interfaz válida
  const interfaceMatch = parsed.fullCommand.match(/-i\s+(\S+)/);
  if (interfaceMatch) {
    const iface = interfaceMatch[1];
    const validInterfaces = ['eth0', 'lo', 'any', 'wlan0'];
    if (!validInterfaces.includes(iface)) {
      return { output: `tcpdump: ${iface}: No such device exists`, success: false };
    }
  }

  // Verificar puerto si se especificó
  const portMatch = parsed.fullCommand.match(/port\s+(\d+)/);
  const port = portMatch ? portMatch[1] : null;

  const count = parseInt(parsed.flags['c'] as string) || 10;
  let output = `tcpdump: listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes\n`;
  
  for (let i = 0; i < Math.min(count, 5); i++) {
    const srcPort = 40000 + Math.floor(Math.random() * 10000);
    const dstPort = port || '443';
    output += `17:30:0${i}.${Math.floor(Math.random() * 999999)} IP 192.168.50.42.${srcPort} > 45.33.32.156.${dstPort}: Flags [P.], seq ${i}:${i + 64}, ack 1, win 502, length 64\n`;
  }
  output += `\n${count} packets captured\n${count} packets received by filter\n0 packets dropped by kernel`;

  return { output, success: true };
}
  private simulatePs(parsed: ParsedCommand, state: SessionState): string {
    if (parsed.fullCommand.includes('aux')) {
      return `USER       PID %CPU %MEM COMMAND
root         1  0.0  0.1 /sbin/init
root       234  0.0  0.1 /usr/sbin/sshd
www-data   567  0.0  0.2 /usr/sbin/apache2
mysql      890  0.1  2.5 /usr/sbin/mysqld
${state.currentUser}   4521  0.5  0.3 ./sync-client`;
    }
    return `  PID TTY          TIME CMD
 1234 pts/0    00:00:00 bash`;
  }

  private simulateLsof(parsed: ParsedCommand, sessionVars: Record<string, any>): string {
    if (parsed.fullCommand.includes('8443')) {
      return `COMMAND     PID   USER   FD   TYPE NODE NAME
sync-clie  4521 jmartinez   3u  IPv4  TCP 192.168.50.42:8443->45.33.32.156:443`;
    }
    return `COMMAND   PID   USER   FD   TYPE NODE NAME
sshd      234   root    3u  IPv4  TCP *:22 (LISTEN)`;
  }

  private async simulateSudo(parsed: ParsedCommand, state: SessionState, attempt: any): Promise<{ output: string; success: boolean; newState: SessionState; traceImpact: number }> {
    if (!state.canSudo) {
      return { output: `${state.currentUser} is not in the sudoers file.`, success: false, newState: state, traceImpact: 25 };
    }

    const subCommand = parsed.args.join(' ');

    if (parsed.flags['l'] || subCommand === '-l') {
      const sudoPerms = attempt.sessionVariables.sudo_permissions || '/usr/bin/python';
      return {
        output: `User ${state.currentUser} may run:\n    (ALL : ALL) NOPASSWD: ${sudoPerms}`,
        success: true, newState: state, traceImpact: 8,
      };
    }

    if (subCommand === 'su' || subCommand === 'su -' || subCommand === '-i') {
      state.currentUser = 'root';
      state.isRoot = true;
      state.sudoAuthenticated = true;
      return { output: '', success: true, newState: state, traceImpact: 20 };
    }

    if (subCommand) {
      const tempRoot = state.isRoot;
      state.isRoot = true;
      const subParsed = this.parser.parse(subCommand);
      const result = await this.executeCommand(subParsed, state, attempt);
      state.isRoot = tempRoot;
      return { output: result.output, success: result.success, newState: state, traceImpact: 15 };
    }

    return { output: 'usage: sudo command', success: false, newState: state, traceImpact: 0 };
  }

private simulateSu(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
  const targetUser = parsed.args[0] || 'root';
  
  // su sin sudo requiere conocer la contraseña de root (que el usuario no tiene)
  if (targetUser === 'root' && !state.sudoAuthenticated) {
    return { output: 'su: Authentication failure', success: false };
  }
  
  // Si ya está autenticado con sudo o es root, puede cambiar
  if (state.sudoAuthenticated || state.isRoot) {
    state.currentUser = targetUser;
    state.isRoot = targetUser === 'root';
    return { output: '', success: true };
  }
  
  return { output: 'su: Authentication failure', success: false };
}

private simulateScp(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
  if (parsed.args.length < 2) {
    return { output: 'usage: scp [-346ABCOpqRrsTv] [-c cipher] [-F ssh_config] ... source ... target', success: false };
  }

  const source = parsed.args[0];
  const dest = parsed.args[1];

  // Verificar si source es archivo local que existe
  if (!source.includes(':') && !source.includes('@')) {
    const sourcePath = this.resolvePath(source, state.currentDirectory);
    const sourceFile = state.filesystem[sourcePath];
    
    if (!sourceFile) {
      return { output: `scp: ${source}: No such file or directory`, success: false };
    }
  }

  // Verificar formato de destino remoto
  if (!dest.includes('@') && !dest.includes(':')) {
    return { output: `scp: ${dest}: not a valid destination`, success: false };
  }

  const fileName = source.split('/').pop() || 'file';
  const size = Math.floor(Math.random() * 5000) + 100;
  return { 
    output: `${fileName}                    100%  ${size}KB    1.2MB/s   00:0${Math.floor(Math.random() * 5) + 1}`, 
    success: true 
  };
}
  private simulateStrings(parsed: ParsedCommand, state: SessionState): { output: string; success: boolean } {
    const target = parsed.args[0];
    if (!target) {
      return { output: 'strings: missing file operand', success: false };
    }
    const resolvedPath = this.resolvePath(target, state.currentDirectory);
    const file = state.filesystem[resolvedPath];
    if (!file) {
      return { output: `strings: ${target}: No such file or directory`, success: false };
    }
    return { output: file.content || '', success: true };
  }

  private simulatePsexec(parsed: ParsedCommand, sessionVars: Record<string, any>): { output: string; success: boolean } {
    if (!parsed.fullCommand.includes('@')) {
      return { output: 'usage: psexec.py target', success: false };
    }
    const dcIp = sessionVars.target_dc || '10.10.10.100';
    return {
      output: `Impacket v0.11.0\n[*] Requesting shares on ${dcIp}...\n[*] Found writable share ADMIN$\n[*] Uploading file...\n[*] Opening SVCManager...\n\nMicrosoft Windows [Version 10.0.17763]\n\nC:\\Windows\\system32>`,
      success: true,
    };
  }

  private simulateSecretsdump(sessionVars: Record<string, any>): { output: string; success: boolean } {
    const domain = sessionVars.domain || 'blacksphere.local';
    return {
      output: `Impacket v0.11.0\n[*] Dumping Domain Credentials (domain\\uid:rid:lmhash:nthash)\nAdministrator:500:aad3b435b51404ee:e19ccf75ee54e06b06a5907af13cef42:::\nkrbtgt:502:aad3b435b51404ee:a1d7c5ca89e5a1f5b3c6d8e0f2a4b6c8:::\nBS-Admin:1104:aad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c:::\nsvc_backup:1105:aad3b435b51404ee:2b576acbe6bcfda7294d6bd18041b8fe:::\nsvc_sql:1106:aad3b435b51404ee:c0a8b2f4e6d8a0c2e4f6a8b0c2d4e6f8:::\n[*] Cleaning up...`,
      success: true,
    };
  }

  private simulateGetUserSPNs(parsed: ParsedCommand, state: SessionState, sessionVars: Record<string, any>): { output: string; success: boolean } {
    const hasRequest = parsed.fullCommand.includes('-request');
    const domain = sessionVars.domain || 'blacksphere.local';
    let output = `Impacket v0.11.0\n\nServicePrincipalName          Name       PasswordLastSet\n---------------------------   ---------  -------------------\nMSSQLSvc/db01.${domain}:1433  svc_sql    2024-01-15`;

    if (hasRequest) {
      output += `\n\n$krb5tgs$23$*svc_sql$${domain.toUpperCase()}$...$a1b2c3d4e5f6...`;
      state.filesystem['/tmp/hashes.txt'] = {
        name: 'hashes.txt', type: 'file', permissions: '-rw-r--r--',
        owner: state.currentUser, group: state.currentUser, size: 512,
        modified: new Date().toISOString().split('T')[0],
        content: `$krb5tgs$23$*svc_sql$${domain.toUpperCase()}$MSSQLSvc/db01*$a1b2c3d4...`,
      };
    }

    return { output, success: true };
  }

  private simulateGetADUsers(sessionVars: Record<string, any>): { output: string; success: boolean } {
    const domain = sessionVars.domain || 'blacksphere.local';
    return {
      output: `Impacket v0.11.0\n\nName             Email                      PasswordLastSet\n---------------  -------------------------  -------------------\nAdministrator                               2024-01-01\nBS-Admin         admin@${domain}            2024-01-15\nsvc_backup       backup@${domain}           2024-01-10\nsvc_sql          sql@${domain}              2024-01-15\nj.martinez       j.martinez@${domain}       2024-01-05`,
      success: true,
    };
  }

 private simulateCrackmapexec(parsed: ParsedCommand, sessionVars: Record<string, any>): { output: string; success: boolean } {
  // Formato: crackmapexec smb IP -u USER -p PASS
  if (parsed.args.length < 2) {
    return { output: 'usage: crackmapexec [-h] {smb,ssh,winrm,mssql,ldap,ftp,rdp} ...', success: false };
  }

  const protocol = parsed.args[0]; // smb, ssh, etc
  const target = parsed.args[1];
  
  if (!['smb', 'ssh', 'winrm', 'ldap', 'mssql'].includes(protocol)) {
    return { output: `crackmapexec: error: argument {smb,ssh,winrm,mssql,ldap}: invalid choice: '${protocol}'`, success: false };
  }

  // Validar IP
  const isValidIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(target);
  if (!isValidIp) {
    return { output: `Failed to resolve: ${target}`, success: false };
  }

  const domain = sessionVars.domain || 'BLACKSPHERE';
  const dcIp = sessionVars.target_dc || '10.10.10.100';
  
  let output = `SMB  ${target}  445  DC01  [*] Windows Server 2019 Build 17763 x64\n`;

  // Verificar si tiene credenciales
  const hasUser = parsed.fullCommand.includes('-u');
  const hasPass = parsed.fullCommand.includes('-p');

  if (hasUser && hasPass) {
    // Extraer usuario del comando
    const userMatch = parsed.fullCommand.match(/-u\s+(\S+)/);
    const passMatch = parsed.fullCommand.match(/-p\s+["']?([^"'\s]+)["']?/);
    
    const user = userMatch ? userMatch[1] : 'unknown';
    const pass = passMatch ? passMatch[1] : '';

    // Validar credenciales conocidas
    const validCreds: Record<string, string> = {
      'svc_backup': 'Backup2024!',
      'svc_sql': 'SqlServer2024!',
      'admin': 'admin123',
    };

    if (validCreds[user] === pass) {
      output += `SMB  ${target}  445  DC01  [+] ${domain}\\${user}:${pass}`;
      
      if (parsed.fullCommand.includes('--shares')) {
        output += `\nSMB  ${target}  445  DC01  Share           Permissions     Remark`;
        output += `\nSMB  ${target}  445  DC01  -----           -----------     ------`;
        output += `\nSMB  ${target}  445  DC01  ADMIN$                          Remote Admin`;
        output += `\nSMB  ${target}  445  DC01  C$                              Default share`;
        output += `\nSMB  ${target}  445  DC01  SYSVOL          READ            Logon server share`;
        output += `\nSMB  ${target}  445  DC01  Backup_Data     READ            `;
      }
    } else {
      output += `SMB  ${target}  445  DC01  [-] ${domain}\\${user}:${pass} STATUS_LOGON_FAILURE`;
      return { output, success: false };
    }
  } else {
    output += `SMB  ${target}  445  DC01  [*] No credentials provided`;
  }

  return { output, success: true };
}

  private simulateHashcrack(parsed: ParsedCommand): { output: string; success: boolean } {
    return {
      output: `hashcat v6.2.6\n\n$krb5tgs$23$*svc_sql$BLACKSPHERE.LOCAL$...:SqlServer2024!\n\nSession: hashcat\nStatus: Cracked\nRecovered: 1/1 (100.00%)`,
      success: true,
    };
  }

  private simulateHelp(allowedCommands: string[]): string {
    return `Available commands:\n${allowedCommands.join(', ')}\n\nTip: Be careful with trace level!`;
  }

  private simulateHistory(attempt: any): string {
    const history = attempt.commandHistory as any[];
    if (!history?.length) return '';
    return history.map((h, i) => `  ${i + 1}  ${h.command}`).join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // OBJECTIVE VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════════

  private checkObjectiveCompletion(parsed: ParsedCommand, state: SessionState, objectives: any[], completed: string[], commandSuccess: boolean): any | null {
    if (!commandSuccess) return null;

    for (const obj of objectives) {
      if (completed.includes(obj.code)) continue;
      if (this.objectiveMatchesByIntention(obj, parsed, state)) return obj;
    }
    return null;
  }

  private objectiveMatchesByIntention(obj: any, parsed: ParsedCommand, state: SessionState): boolean {
    const code = obj.code || '';
    const commands = obj.commands || [];

    // Identity
    if (code === 'VERIFY_IDENTITY' && (parsed.baseCommand === 'whoami' || parsed.baseCommand === 'id')) return true;
    if (code === 'CHECK_PERMISSIONS' && parsed.baseCommand === 'id') return true;

    // Exploration
    if ((code === 'EXPLORE_SYSTEM' || code === 'LIST_FILES') && parsed.baseCommand === 'ls') return true;
    if ((code === 'CHECK_LOCATION' || code === 'CHECK_DIRECTORY') && parsed.baseCommand === 'pwd') return true;
    if (code === 'NAVIGATE_HOME' && parsed.baseCommand === 'cd') return true;

    // System info
    if (code === 'CHECK_SYSTEM_INFO' && parsed.baseCommand === 'uname') return true;
    if (code === 'CHECK_PROCESSES' && parsed.baseCommand === 'ps') return true;

    // Network
    if (code === 'CHECK_CONNECTIVITY' && parsed.baseCommand === 'ping') return true;
    if ((code === 'CHECK_LOCAL_IP' || code === 'CHECK_INTERFACES') && (parsed.baseCommand === 'ifconfig' || parsed.baseCommand === 'ip')) return true;
    if ((code === 'DISCOVER_NETWORK' || code === 'VERIFY_NETWORK_RANGE') && parsed.baseCommand === 'nmap' && parsed.fullCommand.includes('-sn')) return true;
    if ((code === 'SCAN_TARGET' || code === 'SCAN_DC_PORTS') && parsed.baseCommand === 'nmap') return true;
    if (code === 'ANALYZE_CONNECTIONS' && (parsed.baseCommand === 'netstat' || parsed.baseCommand === 'ss')) return true;

    // Files
    if ((code === 'FIND_CONFIG' || code === 'SEARCH_PROJECT') && parsed.baseCommand === 'find') return true;
    if ((code === 'READ_CONFIG' || code === 'VERIFY_FILE') && ['cat', 'less', 'more', 'head', 'tail'].includes(parsed.baseCommand)) return true;
    if (code === 'COPY_FILE' && parsed.baseCommand === 'cp') return true;
    if (code === 'NAVIGATE_TO_VAR' && parsed.baseCommand === 'cd' && parsed.fullCommand.includes('var')) return true;

    // Privilege escalation
    if (code === 'CHECK_SUDO_PERMISSIONS' && parsed.baseCommand === 'sudo' && parsed.fullCommand.includes('-l')) return true;
    if (code === 'FIND_SUID_BINARIES' && parsed.baseCommand === 'find' && parsed.fullCommand.includes('perm')) return true;
    if (code === 'EXPLOIT_SUDO_PYTHON' && parsed.baseCommand === 'sudo' && parsed.fullCommand.includes('python')) return true;
    if (code === 'VERIFY_ROOT_ACCESS' && (parsed.baseCommand === 'whoami' || parsed.baseCommand === 'id') && state.isRoot) return true;

    // Interception
    if (code === 'CAPTURE_TRAFFIC' && (parsed.baseCommand === 'tcpdump' || parsed.baseCommand === 'tshark')) return true;
    if (code === 'EXTRACT_STRINGS' && parsed.baseCommand === 'strings') return true;
    if (code === 'IDENTIFY_PROCESS' && (parsed.baseCommand === 'lsof' || parsed.baseCommand === 'fuser')) return true;
    if (code === 'DOCUMENT_EVIDENCE' && parsed.baseCommand === 'echo' && parsed.fullCommand.includes('>')) return true;

    // Exfiltration
    if ((code === 'EXFILTRATE' || code === 'REPORT_TO_BOSS') && parsed.baseCommand === 'scp') return true;
    if (code === 'CLEAN_TRACES' && parsed.baseCommand === 'rm') return true;

    // AD
    if ((code === 'UNDERSTAND_AD' || code === 'READ_BRIEFING') && parsed.baseCommand === 'cat') return true;
    if (code === 'TEST_CREDENTIALS' && (parsed.baseCommand === 'crackmapexec' || parsed.baseCommand === 'cme')) return true;
    if (code === 'ENUMERATE_SMB_SHARES' && parsed.fullCommand.includes('--shares')) return true;
    if (code === 'ENUMERATE_DOMAIN_USERS' && parsed.baseCommand === 'impacket-GetADUsers') return true;
    if (code === 'KERBEROAST_ATTACK' && parsed.baseCommand === 'impacket-GetUserSPNs' && parsed.fullCommand.includes('-request')) return true;
    if (code === 'CRACK_KERBEROS_HASH' && (parsed.baseCommand === 'hashcat' || parsed.baseCommand === 'john')) return true;
    if (code === 'PSEXEC_DC' && parsed.baseCommand.includes('impacket-') && parsed.baseCommand.includes('exec')) return true;
    if (code === 'DUMP_ALL_SECRETS' && parsed.baseCommand === 'impacket-secretsdump') return true;

    // Fallback
    for (const cmd of commands) {
      if (parsed.baseCommand === cmd.split(' ')[0].toLowerCase()) return true;
    }

    return false;
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════════

  private resolvePath(path: string, currentDir: string, state?: SessionState): string {
      if (!path) return currentDir;
      if (path.startsWith('/')) return this.normalizePath(path);
      if (path.startsWith('~')) {
        const username = state?.currentUser || 'shadow';
        return this.normalizePath(path.replace('~', `/home/${username}`));
      }
    if (path === '.') return currentDir;
    if (path === '..') {
      const parts = currentDir.split('/').filter(p => p);
      parts.pop();
      return '/' + parts.join('/') || '/';
    }
    return this.normalizePath(currentDir === '/' ? `/${path}` : `${currentDir}/${path}`);
  }

  private normalizePath(path: string): string {
    const parts = path.split('/').filter(p => p && p !== '.');
    const result: string[] = [];
    for (const part of parts) {
      if (part === '..') result.pop();
      else result.push(part);
    }
    return '/' + result.join('/');
  }

  private canWriteTo(path: string, state: SessionState): boolean {
    if (state.isRoot) return true;
    return path.startsWith('/tmp') || path.startsWith(`/home/${state.currentUser}`);
  }

  private buildPrompt(state: SessionState): string {
    const dir = state.currentDirectory === `/home/${state.currentUser}` ? '~' : state.currentDirectory;
    const symbol = state.isRoot ? '#' : '$';
    return `${state.currentUser}@${state.hostname}:${dir}${symbol}`;
  }

  private isCommandAllowed(baseCommand: string, allowedCommands: string[]): boolean {
    return allowedCommands.some(allowed => baseCommand === allowed.split(' ')[0].toLowerCase());
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // STATE UPDATE
  // ═══════════════════════════════════════════════════════════════════════════════

  private async updateAttempt(attemptId: string, result: CommandResult, command: string, sessionState: SessionState) {
    const attempt = await this.prisma.missionAttempt.findUnique({ where: { id: attemptId } });
    if (!attempt) return;

    const history = (attempt.commandHistory as any[]) || [];
    history.push({
      command, success: result.success, traceImpact: result.traceIncrement,
      timestamp: new Date().toISOString(), objective: result.objectiveCompleted || null,
      directory: sessionState.currentDirectory, user: sessionState.currentUser,
    });

    const sessionVars = attempt.sessionVariables as Record<string, any>;
    sessionVars._sessionState = sessionState;

    const data: any = {
      traceLevel: result.newTraceLevel,
      commandCount: attempt.commandCount + 1,
      commandHistory: history,
      sessionVariables: sessionVars,
    };

    if (result.objectiveCompleted) {
      data.objectivesCompleted = [...attempt.objectivesCompleted, result.objectiveCompleted];
    }

    await this.prisma.missionAttempt.update({ where: { id: attemptId }, data });

    if (result.hookDamage) {
      await this.hookService.applyDamage(attempt.userId, { damage: result.hookDamage, reason: 'Security trace', attemptId });
    }
  }

  private fail(msg: string, trace = 0): CommandResult {
    return { output: `❌ ERROR: ${msg}`, success: false, newTraceLevel: trace, traceIncrement: 0 };
  }

  private async handleUnauthorizedCommand(attemptId: string, command: string, trace: number): Promise<CommandResult> {
    const newTrace = Math.min(100, trace + 20);
    return {
      output: `bash: ${command.split(' ')[0]}: command not found`,
      success: false, newTraceLevel: newTrace, traceIncrement: 20,
      isMissionFailed: newTrace >= 100,
    };
  }
}