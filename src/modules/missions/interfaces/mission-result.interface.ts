  import { DialogueMessage } from '../../narrative/interfaces/npc.interface';

  export interface CommandResult {
    output: string;
    success: boolean;
    newTraceLevel: number;
    traceIncrement: number;
    objectiveCompleted?: string;
    objectiveDescription?: string;
    stageComplete?: boolean;
    nextStageName?: string;
    isMissionComplete?: boolean;
    isMissionFailed?: boolean;
    hookDamage?: number;
    characterMessage?: DialogueMessage;
    traceWarning?: DialogueMessage;
    fbiCapture?: DialogueMessage[];
    warning?: string;
    tutorialMessage?:DialogueMessage[];
  }

  export interface MissionState {
    attemptId: string;
    missionId: string;
    status: string;
    traceLevel: number;
    maxTraceLevel: number;
    hookHealth: number;
    commandCount: number;
    currentStage: number;
    totalStages: number;
    objectives: Record<string, any>;
    objectivesCompleted: string[];
    sessionVariables: Record<string, any>;
    allowedCommands: string[];
    startedAt: Date;
    
  }