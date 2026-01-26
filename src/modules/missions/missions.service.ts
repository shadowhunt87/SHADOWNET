// src/modules/missions/missions.service.ts

import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { VariablesService } from '../variables/variables.service';
import { NarrativeService } from '../narrative/narrative.service';
import { ProgressionService } from '../progression/progression.service';
import { CommandExecutorService } from './executors/command-executor.service';
import { ObjectiveSelectorService } from './selectors/objective-selector.service';
import { StartMissionDto } from './dto/start-mission.dto';
import { MissionState } from './interfaces/mission-result.interface';
import { AttemptStatus } from '@prisma/client';

@Injectable()
export class MissionsService {
  private readonly logger = new Logger(MissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly variablesService: VariablesService,
    private readonly narrativeService: NarrativeService,
    private readonly progressionService: ProgressionService,
    private readonly commandExecutor: CommandExecutorService,
    private readonly objectiveSelector: ObjectiveSelectorService,
  ) {}

  /**
   * Obtiene todas las misiones con progreso del usuario
   */
  async getAvailableMissions(userId: string) {
    const missions = await this.prisma.mission.findMany({
      orderBy: { nodeNumber: 'asc' },
    });

    const progressList = await this.prisma.missionProgress.findMany({
      where: { userId },
    });

    const progressMap = new Map(progressList.map((p) => [p.missionId, p]));

    return missions.map((mission) => {
      const progress = progressMap.get(mission.id);

      let status = 'LOCKED';
      let lockReason = null;

      // ✅ Verificar desbloqueamiento correctamente
      if (mission.requiredNodeNumber === null || mission.requiredNodeNumber === undefined) {
        // No requiere misión previa
        status = 'UNLOCKED';
      } else {
        // Buscar la misión que tiene el nodeNumber requerido
        const requiredMission = missions.find(
          (m) => m.nodeNumber === mission.requiredNodeNumber,
        );

        if (requiredMission) {
          const requiredProgress = progressMap.get(requiredMission.id);

          // ✅ CRÍTICO: Verificar que esté COMPLETADA
          if (requiredProgress?.isCompleted === true) {
            status = 'UNLOCKED';
          } else {
            lockReason = `Complete "${requiredMission.title}" first`;
          }
        } else {
          // Si no se encuentra la misión requerida, desbloquear (por seguridad)
          status = 'UNLOCKED';
        }
      }

      // Si el usuario ya la completó, marcar como COMPLETED
      if (progress?.isCompleted) {
        status = 'COMPLETED';
      } else if (progress?.isInProgress) {
        status = 'IN_PROGRESS';
      }

      return {
        id: mission.id,
        nodeNumber: mission.nodeNumber,
        title: mission.title,
        description: mission.description,
        difficulty: mission.difficulty,
        arc: mission.arc,
        npcId: mission.npcId,
        briefing: mission.briefing,
        xpReward: mission.xpReward,
        creditsReward: mission.creditsReward,
        isPremium: mission.isPremium,
        estimatedTime: mission.estimatedTime,
        tags: mission.tags,
        isReplayable: mission.isReplayable,
        status,
        lockReason,
        attempts: progress?.attempts || 0,
        isCompleted: progress?.isCompleted || false,
        completedAt: progress?.completedAt,
        bestTime: progress?.bestTime,
      };
    });
  }

  /**
   * Inicia una nueva misión con objetivos aleatorios
   */
  async startMission(userId: string, dto: StartMissionDto) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: dto.missionId },
    });

    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    // Verificar si hay un intento activo
    const activeAttempt = await this.prisma.missionAttempt.findFirst({
      where: {
        userId,
        missionId: dto.missionId,
        status: AttemptStatus.IN_PROGRESS,
      },
    });

    if (activeAttempt) {
      this.logger.log(`📌 Resuming active attempt: ${activeAttempt.id}`);
      return this.formatAttemptResponse(activeAttempt, mission);
    }

    const randomSeed = this.objectiveSelector.generateSeed(userId, dto.missionId);

    // ✅ LIMPIAR EL POOL
    let objectivesPool = mission.objectivesPool as any[];

    if (!Array.isArray(objectivesPool)) {
      throw new BadRequestException('Mission has invalid objectives pool');
    }

    objectivesPool = objectivesPool.filter(
      (obj) =>
        obj !== null &&
        obj !== undefined &&
        obj !== '' &&
        typeof obj === 'object' &&
        obj.code &&
        obj.description,
    );

    if (objectivesPool.length === 0) {
      throw new BadRequestException('Mission has no valid objectives in pool');
    }

    this.logger.log(`📋 Valid objectives in pool: ${objectivesPool.length}`);

    // ✅ SELECCIÓN DE OBJETIVOS
    let selectedObjectives;

    if (mission.nodeNumber === 0) {
      // TUTORIAL: Usar TODOS los objetivos en orden
      selectedObjectives = objectivesPool;
      this.logger.log(`🎓 TUTORIAL MODE: Using all ${selectedObjectives.length} objectives`);
    } else {
      // ✅ MISIONES NORMALES: Seleccionar según min/max
      selectedObjectives = this.objectiveSelector.selectObjectives(
        objectivesPool,
        mission.minObjectives,
        mission.maxObjectives,
        randomSeed,
        false, // ✅ isTutorial = false para misiones normales
      );

      this.logger.log(`✅ Selected ${selectedObjectives.length} objectives`);
    }

    // Filtrar de nuevo por seguridad
    selectedObjectives = selectedObjectives.filter(
      (obj) => obj !== null && obj !== undefined && typeof obj === 'object',
    );

    if (selectedObjectives.length === 0) {
      throw new BadRequestException('Failed to select valid objectives');
    }

    this.logger.log(`🎯 Final objectives count: ${selectedObjectives.length}`);

    // Generar variables de sesión
    this.logger.log(`🔧 Generating session variables...`);
    const sessionVariables = await this.variablesService.generateSessionVariables(
      dto.missionId,
      userId,
    );

    // Crear nuevo intento
    const attempt = await this.prisma.missionAttempt.create({
      data: {
        userId,
        missionId: dto.missionId,
        status: AttemptStatus.IN_PROGRESS,
        randomSeed,
        selectedObjectives,
        traceLevel: 0,
        ganchoHealth: 100,
        commandCount: 0,
        errorCount: 0,
        sessionVariables,
        objectivesCompleted: [],
        commandHistory: [],
        ghostMessagesSent: [],
      },
    });

    // Actualizar progreso
    await this.prisma.missionProgress.upsert({
      where: {
        userId_missionId: { userId, missionId: dto.missionId },
      },
      update: {
        isInProgress: true,
        attempts: { increment: 1 },
      },
      create: {
        userId,
        missionId: dto.missionId,
        isInProgress: true,
        isCompleted: false,
        attempts: 1,
      },
    });

    this.logger.log(
      `✅ Mission started: "${mission.title}" (User: ${userId}, Attempt: ${attempt.id}, Objectives: ${selectedObjectives.length})`,
    );

    return this.formatAttemptResponse(attempt, mission);
  }

  /**
   * Ejecuta un comando
   */
  async executeCommand(attemptId: string, command: string) {
    return this.commandExecutor.execute(attemptId, command);
  }

  /**
   * Obtiene el estado actual de un intento
   */
  async getAttemptState(attemptId: string, userId: string): Promise<MissionState> {
    const attempt = await this.prisma.missionAttempt.findUnique({
      where: { id: attemptId },
      include: { mission: true },
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    // ✅ USAR selectedObjectives en lugar de mission.objectives
    const objectives = attempt.selectedObjectives as any[];

    return {
      attemptId: attempt.id,
      missionId: attempt.missionId,
      status: attempt.status,
      traceLevel: attempt.traceLevel,
      maxTraceLevel: 100,
      hookHealth: attempt.ganchoHealth,
      commandCount: attempt.commandCount,
      currentStage: 1,
      totalStages: 1,
      objectives: objectives.reduce((acc, obj) => {
        acc[obj.code] = {
          description: obj.description,
          hint: obj.hint,
          completed: attempt.objectivesCompleted.includes(obj.code),
        };
        return acc;
      }, {}),
      objectivesCompleted: attempt.objectivesCompleted,
      sessionVariables: attempt.sessionVariables as Record<string, any>,
      allowedCommands: attempt.mission.allowedCommands,
      startedAt: attempt.startedAt,
    };
  }

  /**
   * Completa una misión
   */
  async completeMission(attemptId: string, userId: string) {
    const attempt = await this.prisma.missionAttempt.findUnique({
      where: { id: attemptId },
      include: { mission: true },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new BadRequestException('Invalid attempt');
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Mission is not active');
    }

    const completionTime = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000,
    );

    // Obtener progreso actual
    const progress = await this.prisma.missionProgress.findUnique({
      where: {
        userId_missionId: { userId, missionId: attempt.missionId },
      },
    });

    // Calcular XP
    const xpReward = this.progressionService.calculateMissionXp(
      attempt.mission.difficulty,
      completionTime,
      attempt.traceLevel,
      attempt.commandCount,
      progress?.attempts || 1,
    );

    // Otorgar XP
    const levelUpResult = await this.progressionService.awardXp(
      userId,
      xpReward,
      attempt.missionId,
    );

    // ✅ PASO 1: Actualizar el intento como SUCCESS
    await this.prisma.missionAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.SUCCESS,
        finishedAt: new Date(),
      },
    });

    // ✅ PASO 2: Actualizar progreso - MARCAR COMO COMPLETADA
    const currentBestTime = progress?.bestTime || Infinity;
    const newBestTime =
      completionTime < currentBestTime ? completionTime : currentBestTime;

    await this.prisma.missionProgress.update({
      where: {
        userId_missionId: { userId, missionId: attempt.missionId },
      },
      data: {
        isCompleted: true, // ✅ CRÍTICO
        isInProgress: false, // ✅ CRÍTICO
        completedAt: new Date(),
        bestTime: newBestTime,
      },
    });

    // ✅ PASO 3: Otorgar SirCredits
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        sirCredits: { increment: attempt.mission.creditsReward },
      },
    });

    // ✅ PASO 4: DESBLOQUEAR SIGUIENTE MISIÓN
    const nextMission = await this.prisma.mission.findFirst({
      where: {
        requiredNodeNumber: attempt.mission.nodeNumber,
      },
    });

    if (nextMission) {
      this.logger.log(
        `🔓 Found next mission: "${nextMission.title}" (Node ${nextMission.nodeNumber})`,
      );

      // Crear o actualizar progreso para la siguiente misión
      await this.prisma.missionProgress.upsert({
        where: {
          userId_missionId: { userId, missionId: nextMission.id },
        },
        update: {
          // No cambiar nada si ya existe
        },
        create: {
          userId,
          missionId: nextMission.id,
          isCompleted: false,
          isInProgress: false,
          attempts: 0,
        },
      });

      this.logger.log(
        `✅ Unlocked next mission: "${nextMission.title}" (Node ${nextMission.nodeNumber})`,
      );
    } else {
      this.logger.warn(
        `⚠️ No next mission found for nodeNumber: ${attempt.mission.nodeNumber}`,
      );
    }

    this.logger.log(
      `✅ Mission completed: "${attempt.mission.title}" (User: ${userId}, XP: +${xpReward.totalXp}, Time: ${completionTime}s)`,
    );

    return {
      success: true,
      xpReward,
      levelUpResult,
      creditsEarned: attempt.mission.creditsReward,
      completionTime,
      finalTraceLevel: attempt.traceLevel,
      nextMissionUnlocked: nextMission
        ? {
            id: nextMission.id,
            title: nextMission.title,
            nodeNumber: nextMission.nodeNumber,
          }
        : null,
      successDialogue: this.narrativeService.getMissionCompleteDialogue(
        attempt.mission.difficulty,
      ),
    };
  }

  /**
   * Abandona una misión
   */
  async abandonMission(attemptId: string, userId: string) {
    const attempt = await this.prisma.missionAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.userId !== userId) {
      throw new BadRequestException('Invalid attempt');
    }

    await this.prisma.missionAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.ABANDONED,
        finishedAt: new Date(),
      },
    });

    await this.prisma.missionProgress.update({
      where: {
        userId_missionId: { userId, missionId: attempt.missionId },
      },
      data: {
        isInProgress: false,
      },
    });

    this.logger.log(`⚠️ Mission abandoned: ${attempt.missionId} (User: ${userId})`);

    return {
      success: true,
      message: 'Mission abandoned',
    };
  }

  /**
   * Formatea la respuesta de inicio de misión para el frontend
   */
  private formatAttemptResponse(attempt: any, mission: any) {
    const selectedObjectives = attempt.selectedObjectives as any[];
    const introDialogue = this.narrativeService.parseDialogueFromJson(
      mission.introDialog,
    );

    // ✅ CONVERTIR ARRAY A OBJETO CON KEYS (para el frontend)
    const objectivesMap: Record<string, any> = {};
    selectedObjectives.forEach((obj) => {
      objectivesMap[obj.code] = {
        description: obj.description,
        hint: obj.hint || null,
        commands: obj.commands || [],
        completed: attempt.objectivesCompleted.includes(obj.code),
        category: obj.category || 'general',
      };
    });

    return {
      attemptId: attempt.id,
      mission: {
        id: mission.id,
        title: mission.title,
        nodeNumber: mission.nodeNumber,
        difficulty: mission.difficulty,
        briefing: mission.briefing,
        npcId: mission.npcId,
        isReplayable: mission.isReplayable,
      },
      objectives: objectivesMap, // ✅ OBJETO, NO ARRAY
      allowedCommands: mission.allowedCommands || [],
      state: {
        status: attempt.status,
        traceLevel: attempt.traceLevel,
        maxTraceLevel: 100,
        hookHealth: attempt.ganchoHealth,
        commandCount: attempt.commandCount,
      },
      introDialogue,
      sessionVariables: attempt.sessionVariables || {},
      randomSeed: attempt.randomSeed,
    };
  }
}