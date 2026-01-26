export enum HookLevel {
  SAFE = 'SAFE',
  MONITORED = 'MONITORED',
  COMPROMISED = 'COMPROMISED',
  CRITICAL = 'CRITICAL',
  BURNED = 'BURNED',
}

export interface HookStatus {
  userId: string;
  currentHealth: number;
  maxHealth: number;
  level: HookLevel;
  lastDamageAt?: Date;
  totalDamageTaken: number;
  totalRecovered: number;
  canRecover: boolean;
  recoveryAvailableAt?: Date;
  warnings: string[];
}

export interface HookDamageEvent {
  userId: string;
  damage: number;
  reason: string;
  missionId?: string;
  attemptId?: string;
  timestamp: Date;
  newHealth: number;
}

export interface HookRecoveryResult {
  success: boolean;
  healthRecovered: number;
  newHealth: number;
  cooldownUntil?: Date;
  message: string;
}