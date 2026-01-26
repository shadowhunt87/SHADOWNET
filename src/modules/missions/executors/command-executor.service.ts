import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { NarrativeService } from '../../narrative/narrative.service';
import { HookService } from '../../hook/hook.service';
import { CommandParser } from './command-parser';
import { CommandResult } from '../interfaces/mission-result.interface';
import { AttemptStatus } from '@prisma/client';

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

    if (!this.parser.isAllowed(command, allowedCommands)) {
      return this.handleUnauthorizedCommand(
        attemptId,
        command,
        attempt.traceLevel,
      );
    }

    const result = await this.executeLogic(parsed, attempt);
    await this.updateAttempt(attemptId, result, command);

    return result;
  }

  // ════════════════════════════════════════
  // CORE GAME LOGIC
  // ════════════════════════════════════════
  private async executeLogic(
    parsed: any,
    attempt: any,
  ): Promise<CommandResult> {
    const mission = attempt.mission;
    const sessionVars = attempt.sessionVariables as Record<string, any>;
    const objectives = attempt.selectedObjectives as any[];
    const completed = attempt.objectivesCompleted as string[];

    const isTutorial = mission.nodeNumber === 0;
    const output = this.simulateCommand(parsed, sessionVars, mission);

    // ═════ TUTORIAL MODE (STATIC) ═════
    if (isTutorial) {
      const active = objectives.find(o => !completed.includes(o.code));

      if (!active) {
        return {
          output: '✅ Tutorial completed.',
          success: true,
          newTraceLevel: attempt.traceLevel,
          traceIncrement: 0,
          isMissionComplete: true,
        };
      }

      const matches = this.checkObjectiveMatch(
        active,
        parsed,
        sessionVars,
      );

      if (!matches) {
        return {
          output,
          success: false,
          newTraceLevel: attempt.traceLevel,
          traceIncrement: 0,
          tutorialMessage: active.tutorialDialogue?.onError || [],
        };
      }

      return {
        output,
        success: true,
        newTraceLevel: attempt.traceLevel,
        traceIncrement: 0,
        objectiveCompleted: active.code,
        objectiveDescription: active.description,
        tutorialMessage: active.tutorialDialogue?.onSuccess || [],
        isMissionComplete:
          objectives.filter(o => !completed.includes(o.code) && o.code !== active.code).length === 0,
      };
    }

    // ═════ NORMAL MISSIONS (DYNAMIC) ═════
    const matched = objectives.find(
      o =>
        !completed.includes(o.code) &&
        this.checkObjectiveMatch(o, parsed, sessionVars),
    );

    const traceImpact = matched?.traceImpact ?? 5;
    const newTrace = Math.min(100, attempt.traceLevel + traceImpact);

    const result: CommandResult = {
      output,
      success: !!matched,
      newTraceLevel: newTrace,
      traceIncrement: traceImpact,
    };

    if (matched) {
      result.objectiveCompleted = matched.code;
      result.objectiveDescription = matched.description;

      const remaining = objectives.filter(
        o => !completed.includes(o.code) && o.code !== matched.code,
      );

      if (remaining.length === 0) {
        result.isMissionComplete = true;
      }
    }

      if (newTrace >= 70) {
        const traceWarning =
          this.narrativeService.getTraceWarningDialogue(newTrace);

        if (traceWarning) {
          result.traceWarning = traceWarning;
        }
      }

    if (newTrace >= 100) {
      result.isMissionFailed = true;
      result.fbiCapture =
        this.narrativeService.getFbiCaptureDialogue('trace_maxed');
      result.hookDamage = 15;
    }

    return result;
  }

  // ════════════════════════════════════════
  // STATE UPDATE (NO STATUS CHANGES)
  // ════════════════════════════════════════
  private async updateAttempt(
    attemptId: string,
    result: CommandResult,
    command: string,
  ) {
    const attempt = await this.prisma.missionAttempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) return;

    const history = (attempt.commandHistory as any[]) || [];

    history.push({
      command,
      success: result.success,
      traceImpact: result.traceIncrement,
      timestamp: new Date().toISOString(),
      objective: result.objectiveCompleted || null,
    });

    const data: any = {
      traceLevel: result.newTraceLevel,
      commandCount: attempt.commandCount + 1,
      commandHistory: history,
    };

    if (result.objectiveCompleted) {
      data.objectivesCompleted = [
        ...attempt.objectivesCompleted,
        result.objectiveCompleted,
      ];
    }

    await this.prisma.missionAttempt.update({
      where: { id: attemptId },
      data,
    });

    if (result.hookDamage) {
      await this.hookService.applyDamage(attempt.userId, {
        damage: result.hookDamage,
        reason: 'Security trace',
        attemptId,
      });
    }
  }

  // ════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════
  private checkObjectiveMatch(
    objective: any,
    parsed: any,
    vars: Record<string, any>,
  ): boolean {
    return (objective.commands || []).some((tpl: string) => {
      const resolved = this.parser.replaceVariables(tpl, vars);
      const parsedTpl = this.parser.parse(resolved);
      return parsedTpl.baseCommand === parsed.baseCommand;
    });
  }

  private simulateCommand(parsed: any, vars: any, mission: any): string {
    switch (parsed.baseCommand) {
      case 'whoami':
        return vars.username || 'shadow_hunter';
      case 'hostname':
        return vars.hostname || 'sirtech-node';
      case 'help':
        return `Available commands: ${mission.allowedCommands.join(', ')}`;
      default:
        return `${parsed.baseCommand}: command executed`;
    }
  }

  private fail(msg: string, trace = 0): CommandResult {
    return {
      output: `❌ ERROR: ${msg}`,
      success: false,
      newTraceLevel: trace,
      traceIncrement: 0,
    };
  }

  private async handleUnauthorizedCommand(
    attemptId: string,
    command: string,
    trace: number,
  ): Promise<CommandResult> {
    const newTrace = Math.min(100, trace + 20);

    return {
      output: `❌ Unauthorized command: ${command}`,
      success: false,
      newTraceLevel: newTrace,
      traceIncrement: 20,
      isMissionFailed: newTrace >= 100,
    };
  }
}
