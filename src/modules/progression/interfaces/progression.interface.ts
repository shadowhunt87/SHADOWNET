import { Rank } from '@prisma/client';

export interface UserProgression {
  userId: string;
  totalXp: number;
  currentLevel: number;
  reputation: Rank;
  nextLevelXp: number;
  xpToNextLevel: number;
  levelProgress: number; // 0-100%
  rankProgress: number; // 0-100%
  nextRank: Rank | null;
  xpToNextRank: number;
}

export interface XpReward {
  baseXp: number;
  bonusXp: number;
  totalXp: number;
  reasons: {
    type: 'completion' | 'speed' | 'stealth' | 'efficiency' | 'first_try';
    amount: number;
    description: string;
  }[];
}

export interface LevelUpResult {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  rankChanged: boolean;
  oldRank: Rank;
  newRank: Rank;
  rewards?: {
    sirCredits?: number;
    unlockedMissions?: string[];
    unlockedFeatures?: string[];
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'completion' | 'skill' | 'special' | 'achievement';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

export interface UserStats {
  userId: string;
  totalMissionsAttempted: number;
  totalMissionsCompleted: number;
  successRate: number;
  averageTraceLevel: number;
  fastestMissionTime: number;
  lowestTraceAchieved: number;
  totalCommandsExecuted: number;
  perfectMissions: number; // 0 trace
  badges: Badge[];
  favoriteNpc: string;
}