// src/modules/progression/calculators/xp-calculator.ts

import { Injectable } from '@nestjs/common';
import { Difficulty } from '@prisma/client';
import { XpReward } from '../interfaces/progression.interface';

@Injectable()
export class XpCalculator {
  // ✅ XP BASE REBALANCEADO - BOSS FIGHTS MEMORABLES
  private readonly BASE_XP: Record<Difficulty, number> = {
    TUTORIAL: 100,      // Tutorial básico
    EASY: 250,          // Primera infiltración
    MEDIUM: 450,        // Operaciones estándar
    HARD: 750,          // ⭐ BOSS FIGHTS - Memorable y épico
    EXPERT: 1200,       // Misiones premium/avanzadas
    LEGENDARY: 2000,    // ⭐⭐ Misiones finales épicas
  };

  /**
   * Calcula XP ganado por completar misión
   */
  calculateMissionXp(
    difficulty: Difficulty,
    completionTime: number, // segundos
    traceLevel: number,
    commandCount: number,
    isFirstAttempt: boolean,
  ): XpReward {
    const baseXp = this.BASE_XP[difficulty];
    const reasons: XpReward['reasons'] = [];
    let bonusXp = 0;

    // Bonus por velocidad (10-30% extra)
    const speedBonus = this.calculateSpeedBonus(completionTime, difficulty);
    if (speedBonus > 0) {
      bonusXp += speedBonus;
      reasons.push({
        type: 'speed',
        amount: speedBonus,
        description: `Speed bonus (${completionTime}s)`,
      });
    }

    // Bonus por sigilo (5-50% extra)
    const stealthBonus = this.calculateStealthBonus(traceLevel, baseXp);
    if (stealthBonus > 0) {
      bonusXp += stealthBonus;
      reasons.push({
        type: 'stealth',
        amount: stealthBonus,
        description: `Stealth bonus (${traceLevel}% trace)`,
      });
    }

    // Bonus por eficiencia (menos comandos usados)
    const efficiencyBonus = this.calculateEfficiencyBonus(commandCount, baseXp);
    if (efficiencyBonus > 0) {
      bonusXp += efficiencyBonus;
      reasons.push({
        type: 'efficiency',
        amount: efficiencyBonus,
        description: `Efficiency bonus (${commandCount} commands)`,
      });
    }

    // Bonus por primer intento (25% extra)
    if (isFirstAttempt) {
      const firstTryBonus = Math.floor(baseXp * 0.25);
      bonusXp += firstTryBonus;
      reasons.push({
        type: 'first_try',
        amount: firstTryBonus,
        description: 'First try bonus',
      });
    }

    return {
      baseXp,
      bonusXp,
      totalXp: baseXp + bonusXp,
      reasons,
    };
  }

  /**
   * Bonus por velocidad
   */
  private calculateSpeedBonus(time: number, difficulty: Difficulty): number {
    // Tiempos objetivo por dificultad (segundos)
    const targetTimes: Record<Difficulty, number> = {
      TUTORIAL: 120,
      EASY: 300,
      MEDIUM: 600,
      HARD: 900,      // Boss fights tienen más tiempo
      EXPERT: 1200,
      LEGENDARY: 1800,
    };

    const target = targetTimes[difficulty];
    
    if (time <= target * 0.5) {
      return Math.floor(this.BASE_XP[difficulty] * 0.3); // 30% bonus
    } else if (time <= target * 0.75) {
      return Math.floor(this.BASE_XP[difficulty] * 0.2); // 20% bonus
    } else if (time <= target) {
      return Math.floor(this.BASE_XP[difficulty] * 0.1); // 10% bonus
    }

    return 0;
  }

  /**
   * Bonus por sigilo (bajo trace level)
   */
  private calculateStealthBonus(traceLevel: number, baseXp: number): number {
    if (traceLevel === 0) {
      return Math.floor(baseXp * 0.5); // 50% bonus por perfecto
    } else if (traceLevel <= 10) {
      return Math.floor(baseXp * 0.3); // 30% bonus
    } else if (traceLevel <= 25) {
      return Math.floor(baseXp * 0.2); // 20% bonus
    } else if (traceLevel <= 50) {
      return Math.floor(baseXp * 0.1); // 10% bonus
    } else if (traceLevel <= 75) {
      return Math.floor(baseXp * 0.05); // 5% bonus
    }

    return 0;
  }

  /**
   * Bonus por eficiencia (menos comandos)
   */
  private calculateEfficiencyBonus(commandCount: number, baseXp: number): number {
    if (commandCount <= 5) {
      return Math.floor(baseXp * 0.2); // 20% bonus
    } else if (commandCount <= 10) {
      return Math.floor(baseXp * 0.1); // 10% bonus
    } else if (commandCount <= 15) {
      return Math.floor(baseXp * 0.05); // 5% bonus
    }

    return 0;
  }

  /**
   * Calcula nivel basado en XP total
   */
  calculateLevel(totalXp: number): number {
    return Math.floor(totalXp / 1000) + 1;
  }

  /**
   * Calcula XP necesario para próximo nivel
   */
  calculateXpToNextLevel(totalXp: number): number {
    const currentLevel = this.calculateLevel(totalXp);
    const nextLevelXp = currentLevel * 1000;
    return nextLevelXp - totalXp;
  }
}