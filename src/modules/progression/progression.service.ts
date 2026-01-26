import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { XpCalculator } from './calculators/xp-calculator';
import { RankCalculator } from './calculators/rank-calculator';
import { 
  UserProgression, 
  XpReward, 
  LevelUpResult,
  UserStats,
} from './interfaces/progression.interface';
import { Difficulty } from '@prisma/client';

@Injectable()
export class ProgressionService {
  private readonly logger = new Logger(ProgressionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly xpCalculator: XpCalculator,
    private readonly rankCalculator: RankCalculator,
  ) {}

  /**
   * Obtiene la progresión completa del usuario
   */
  async getUserProgression(userId: string): Promise<UserProgression> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalXp: true,
        currentLevel: true,
        reputation: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const nextRank = this.rankCalculator.getNextRank(user.reputation);
    const xpToNextRank = this.rankCalculator.calculateXpToNextRank(user.totalXp, user.reputation);
    const rankProgress = this.rankCalculator.calculateRankProgress(user.totalXp, user.reputation);

    const nextLevelXp = user.currentLevel * 1000;
    const xpInCurrentLevel = user.totalXp - ((user.currentLevel - 1) * 1000);
    const levelProgress = Math.floor((xpInCurrentLevel / 1000) * 100);

    return {
      userId,
      totalXp: user.totalXp,
      currentLevel: user.currentLevel,
      reputation: user.reputation,
      nextLevelXp,
      xpToNextLevel: nextLevelXp - user.totalXp,
      levelProgress,
      rankProgress,
      nextRank,
      xpToNextRank,
    };
  }

  /**
   * Otorga XP y procesa level up / rank up
   */
  async awardXp(
    userId: string,
    xpReward: XpReward,
    missionId?: string,
  ): Promise<LevelUpResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalXp: true,
        currentLevel: true,
        reputation: true,
        sirCredits: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const oldLevel = user.currentLevel;
    const oldRank = user.reputation;

    const newTotalXp = user.totalXp + xpReward.totalXp;
    const newLevel = this.xpCalculator.calculateLevel(newTotalXp);
    const newRank = this.rankCalculator.calculateRank(newTotalXp);

    const leveledUp = newLevel > oldLevel;
    const rankChanged = newRank !== oldRank;

    // Calcular recompensas
    let creditsReward = 0;
    const unlockedFeatures: string[] = [];

    if (rankChanged) {
      const rankRewards = this.rankCalculator.getRankUpRewards(newRank);
      creditsReward += rankRewards.sirCredits;
      unlockedFeatures.push(...rankRewards.unlockedFeatures);
    }

    // Actualizar usuario
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalXp: newTotalXp,
        currentLevel: newLevel,
        reputation: newRank,
        sirCredits: { increment: creditsReward },
      },
    });

    // Log de actividad
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: leveledUp ? 'LEVEL_UP' : 'XP_GAINED',
        details: {
          xpGained: xpReward.totalXp,
          oldLevel,
          newLevel,
          oldRank,
          newRank,
          rankChanged,
          missionId,
          timestamp: new Date().toISOString(),
        },
      },
    });

    if (leveledUp) {
      this.logger.log(
        `🎉 User ${userId} leveled up! ${oldLevel} → ${newLevel} (+${xpReward.totalXp} XP)`
      );
    }

    if (rankChanged) {
      this.logger.log(
        `⭐ User ${userId} rank up! ${oldRank} → ${newRank} (+${creditsReward} SC)`
      );
    }

    return {
      leveledUp,
      oldLevel,
      newLevel,
      rankChanged,
      oldRank,
      newRank,
      rewards: rankChanged
        ? {
            sirCredits: creditsReward,
            unlockedFeatures,
          }
        : undefined,
    };
  }

  /**
   * Obtiene estadísticas del usuario
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const attempts = await this.prisma.missionAttempt.findMany({
      where: { userId },
      select: {
        status: true,
        traceLevel: true,
        commandCount: true,
        startedAt: true,
        finishedAt: true,
      },
    });

    const completedAttempts = attempts.filter(a => a.status === 'SUCCESS');
    const totalAttempted = attempts.length;
    const totalCompleted = completedAttempts.length;
    const successRate = totalAttempted > 0 
      ? Math.round((totalCompleted / totalAttempted) * 100) 
      : 0;

    const avgTrace = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + a.traceLevel, 0) / completedAttempts.length
      : 0;

    const perfectMissions = completedAttempts.filter(a => a.traceLevel === 0).length;

    const fastestTime = completedAttempts.reduce((min, a) => {
      if (!a.finishedAt) return min;
      const time = (a.finishedAt.getTime() - a.startedAt.getTime()) / 1000;
      return time < min ? time : min;
    }, Infinity);

    const lowestTrace = completedAttempts.reduce((min, a) => {
      return a.traceLevel < min ? a.traceLevel : min;
    }, 100);

    const totalCommands = attempts.reduce((sum, a) => sum + a.commandCount, 0);

    return {
      userId,
      totalMissionsAttempted: totalAttempted,
      totalMissionsCompleted: totalCompleted,
      successRate,
      averageTraceLevel: Math.round(avgTrace),
      fastestMissionTime: fastestTime === Infinity ? 0 : fastestTime,
      lowestTraceAchieved: lowestTrace,
      totalCommandsExecuted: totalCommands,
      perfectMissions,
      badges: [], // TODO: Implementar badges
      favoriteNpc: 'ZERO', // TODO: Calcular basado en interacciones
    };
  }

  /**
   * Calcula XP por completar misión
   */
  calculateMissionXp(
    difficulty: Difficulty,
    completionTime: number,
    traceLevel: number,
    commandCount: number,
    attempts: number,
  ): XpReward {
    return this.xpCalculator.calculateMissionXp(
      difficulty,
      completionTime,
      traceLevel,
      commandCount,
      attempts === 1,
    );
  }
}