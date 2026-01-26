import { Injectable } from '@nestjs/common';
import { Rank } from '@prisma/client';

@Injectable()
export class RankCalculator {
  private readonly RANK_THRESHOLDS: Record<Rank, number> = {
    [Rank.SCRIPT_KIDDIE]: 0,
    [Rank.GREY_HAT]: 2500,
    [Rank.BLACK_OPS]: 7500,
    [Rank.CYBER_PHANTOM]: 15000,
    [Rank.SYSADMIN_GOD]: 30000,
  };

  private readonly RANK_ORDER: Rank[] = [
    Rank.SCRIPT_KIDDIE,
    Rank.GREY_HAT,
    Rank.BLACK_OPS,
    Rank.CYBER_PHANTOM,
    Rank.SYSADMIN_GOD,
  ];

  /**
   * Calcula rango basado en XP total
   */
  calculateRank(totalXp: number): Rank {
    for (let i = this.RANK_ORDER.length - 1; i >= 0; i--) {
      const rank = this.RANK_ORDER[i];
      if (totalXp >= this.RANK_THRESHOLDS[rank]) {
        return rank;
      }
    }
    return Rank.SCRIPT_KIDDIE;
  }

  /**
   * Obtiene el siguiente rango
   */
  getNextRank(currentRank: Rank): Rank | null {
    const currentIndex = this.RANK_ORDER.indexOf(currentRank);
    if (currentIndex === -1 || currentIndex === this.RANK_ORDER.length - 1) {
      return null; // Ya está en el rango máximo
    }
    return this.RANK_ORDER[currentIndex + 1];
  }

  /**
   * Calcula XP necesario para siguiente rango
   */
  calculateXpToNextRank(totalXp: number, currentRank: Rank): number {
    const nextRank = this.getNextRank(currentRank);
    
    if (!nextRank) {
      return 0; // Ya está en máximo rango
    }

    const nextRankThreshold = this.RANK_THRESHOLDS[nextRank];
    return nextRankThreshold - totalXp;
  }

  /**
   * Calcula progreso hacia siguiente rango (0-100%)
   */
  calculateRankProgress(totalXp: number, currentRank: Rank): number {
    const nextRank = this.getNextRank(currentRank);
    
    if (!nextRank) {
      return 100; // Ya está en máximo
    }

    const currentThreshold = this.RANK_THRESHOLDS[currentRank];
    const nextThreshold = this.RANK_THRESHOLDS[nextRank];
    const xpInCurrentRank = totalXp - currentThreshold;
    const xpNeededForNextRank = nextThreshold - currentThreshold;

    return Math.floor((xpInCurrentRank / xpNeededForNextRank) * 100);
  }

  /**
   * Obtiene recompensas por subir de rango
   */
  getRankUpRewards(newRank: Rank): {
    sirCredits: number;
    unlockedFeatures: string[];
  } {
    const rewards: Record<Rank, { sirCredits: number; unlockedFeatures: string[] }> = {
      [Rank.SCRIPT_KIDDIE]: {
        sirCredits: 0,
        unlockedFeatures: [],
      },
      [Rank.GREY_HAT]: {
        sirCredits: 100,
        unlockedFeatures: ['Advanced missions unlocked', 'Custom profiles'],
      },
      [Rank.BLACK_OPS]: {
        sirCredits: 250,
        unlockedFeatures: ['Premium missions preview', 'Leaderboard access'],
      },
      [Rank.CYBER_PHANTOM]: {
        sirCredits: 500,
        unlockedFeatures: ['Expert missions', 'Custom commands'],
      },
      [Rank.SYSADMIN_GOD]: {
        sirCredits: 1000,
        unlockedFeatures: ['Legendary missions', 'All features unlocked', 'Special badge'],
      },
    };

    return rewards[newRank];
  }
}