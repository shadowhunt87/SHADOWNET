export enum NpcId {
  BOSS = 'BOSS',
  ZERO = 'ZERO',
  SALLY = 'SALLY',
  VIPER = 'VIPER',
  GHOST = 'GHOST',
  STIRLING = 'STIRLING', // ✅ AGREGAR
  SYSTEM = 'SYSTEM',
}

export enum Mood {
  NEUTRAL = 'neutral',
  PLEASED = 'pleased',
  FOCUSED = 'focused',
  URGENT = 'urgent',
  IMPRESSED = 'impressed',
  COLD = 'cold',
  SERIOUS = 'serious',
  CHALLENGING = 'challenging',
  PROUD = 'proud',
  THREATENING = 'threatening',
  MYSTERIOUS = 'mysterious',
  TRIUMPHANT = 'triumphant', // ✅ AGREGAR (para Stirling)
  MOCKING = 'mocking',       // ✅ AGREGAR (para Stirling)
}

export interface NpcProfile {
  id: NpcId;
  name: string;
  role: string;
  personality: string;
  color: string;
  avatar?: string;
}

export interface DialogueMessage {
  character: NpcId;
  text: string;
  mood: Mood;
  timestamp?: Date;
}

export interface DialogueTrigger {
  event: 'mission_start' | 'objective_complete' | 'mission_complete' | 'mission_fail' | 'trace_warning' | 'hook_critical' | 'caught_by_fbi'; // ✅ AGREGAR evento
  npcId: NpcId;
  conditions?: {
    traceLevel?: { min?: number; max?: number };
    hookHealth?: { min?: number; max?: number };
    objectiveId?: string;
    failureReason?: 'trace_maxed' | 'hook_burned' | 'timeout' | 'critical_error';
  };
}