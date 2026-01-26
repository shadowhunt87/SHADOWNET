import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { IpGenerator } from './generators/ip.generator';
import { PasswordGenerator } from './generators/password.generator';
import { FilenameGenerator } from './generators/filename.generator';
import { SessionVariables } from './interfaces/session-variables.interface';

@Injectable()
export class VariablesService {
  private readonly logger = new Logger(VariablesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ipGenerator: IpGenerator,
    private readonly passwordGenerator: PasswordGenerator,
    private readonly filenameGenerator: FilenameGenerator,
  ) {}

  /**
   * Genera todas las variables de sesión para un intento de misión
   */
async generateSessionVariables(
  missionId: string,
  userId: string,
): Promise<Record<string, any>> {
  const mission = await this.prisma.mission.findUnique({
    where: { id: missionId },
    select: {
      id: true,
      nodeNumber: true,
      // ❌ REMOVER: variablesTemplate: true,
    },
  });

  if (!mission) {
    throw new Error('Mission not found');
  }

  // ✅ SOLUCIÓN TEMPORAL: Generar variables hardcodeadas por misión
  const variables = this.getDefaultVariablesForMission(mission.nodeNumber);

  this.logger.log(
    `Generated session variables for mission ${mission.nodeNumber}: ${JSON.stringify(variables)}`
  );

  return variables;
}

/**
 * Genera variables por defecto según el número de misión
 */
private getDefaultVariablesForMission(nodeNumber: number): Record<string, any> {
  const baseVariables = {
    username: 'shadow_hunter',
    hostname: 'sirtech-node-00',
    os: 'Linux 5.15.0-kali SirTech 4.0',
    local_ip: this.generateRandomIP('192.168.1'),
  };

  switch (nodeNumber) {
    case 0: // Protocolo Génesis
      return baseVariables;

    case 1: // Sombra Digital
      return {
        ...baseVariables,
        target_ip: this.generateRandomIP('10.0.0'),
        network_range: '10.0.0.0/24',
        gateway: '10.0.0.1',
      };

    case 2: // Credenciales de Cristal
      return {
        ...baseVariables,
        target_ip: this.generateRandomIP('10.0.0'),
        ssh_user: 'admin',
        ssh_password: this.generateWeakPassword(),
      };

    case 3: // Fuga de Datos
      return {
        ...baseVariables,
        target_ip: this.generateRandomIP('172.16.5'),
        file_path: '/var/backups/classified/proyecto_fenix.zip',
        search_dir: '/var/backups',
        file_size: '2.3GB',
      };

    case 4: // Intercepción Silenciosa
      return {
        ...baseVariables,
        interface: 'eth0',
        captured_packets: Math.floor(Math.random() * 4000) + 1000,
      };

    case 5: // El Punto de Quiebre
      return {
        ...baseVariables,
        current_user: 'hacker',
        sudo_permissions: '/usr/bin/python',
        suid_binary: 'python',
      };

    default:
      return baseVariables;
  }
}

/**
 * Genera IP aleatoria en un rango
 */
private generateRandomIP(prefix: string): string {
  const lastOctet = Math.floor(Math.random() * 200) + 10;
  return `${prefix}.${lastOctet}`;
}

/**
 * Genera contraseña débil aleatoria
 */
private generateWeakPassword(): string {
  const weakPasswords = [
    'admin123',
    'password',
    '123456',
    'qwerty123',
    'letmein',
    'welcome1',
  ];
  return weakPasswords[Math.floor(Math.random() * weakPasswords.length)];
}

  /**
   * Genera una variable individual basada en su configuración
   */
  private generateVariable(key: string, config: any): any {
    // Si es un valor estático, retornarlo directamente
    if (typeof config !== 'string') {
      return config;
    }

    const configStr = config as string;

    // IP aleatoria en rango: "random:192.168.1.10-192.168.1.50"
    if (configStr.startsWith('random:') && configStr.includes('.')) {
      return this.ipGenerator.generateFromRange(configStr);
    }

    // Generador de contraseñas: "generate:weak" | "generate:medium" | "generate:strong"
    if (configStr.startsWith('generate:')) {
      const type = configStr.split(':')[1] as 'weak' | 'medium' | 'strong';
      return this.passwordGenerator.generate(type);
    }

    // Generador de archivos: "generate:file" | "generate:path"
    if (configStr === 'generate:file') {
      return this.filenameGenerator.generate();
    }

    if (configStr === 'generate:path') {
      return this.filenameGenerator.generatePath();
    }

    // Valor estático
    return config;
  }

  /**
   * Valida que todas las variables requeridas estén presentes
   */
  validateVariables(variables: SessionVariables, required: string[]): boolean {
    for (const key of required) {
      if (!(key in variables)) {
        this.logger.warn(`Missing required variable: ${key}`);
        return false;
      }
    }
    return true;
  }

  /**
   * Obtiene las variables de una sesión activa
   */
  async getSessionVariables(attemptId: string): Promise<SessionVariables> {
    const attempt = await this.prisma.missionAttempt.findUnique({
      where: { id: attemptId },
      select: { sessionVariables: true },
    });

    if (!attempt) {
      throw new Error('Attempt not found');
    }

    return attempt.sessionVariables as SessionVariables;
  }
}