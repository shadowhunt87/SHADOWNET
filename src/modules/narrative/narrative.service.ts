import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { NpcId, Mood, DialogueMessage, NpcProfile } from './interfaces/npc.interface';
import { NPC_PROFILES } from './npcs/npc-profiles';
import { DIALOGUE_TEMPLATES } from './npcs/dialogue-templates';

@Injectable()
export class NarrativeService {
  private readonly logger = new Logger(NarrativeService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el perfil de un NPC
   */
  getNpcProfile(npcId: NpcId): NpcProfile {
    return NPC_PROFILES[npcId];
  }

  /**
   * Obtiene todos los perfiles de NPCs
   */
  getAllNpcProfiles(): NpcProfile[] {
    return Object.values(NPC_PROFILES);
  }

  /**
   * Genera diálogo para inicio de misión
   */
  getMissionStartDialogue(missionId: string): DialogueMessage[] {
    // Por ahora retornar el diálogo guardado en la misión
    // TODO: Expandir para generar diálogos dinámicos
    return [];
  }

  /**
   * Genera diálogo para objetivo completado
   */
  getObjectiveCompleteDialogue(objectiveId: string): DialogueMessage | null {
    const templates = DIALOGUE_TEMPLATES.objective_complete;
    const template = templates[Math.floor(Math.random() * templates.length)];
    const text = template.texts[Math.floor(Math.random() * template.texts.length)];

    return {
      character: template.npcId,
      text,
      mood: template.mood,
      timestamp: new Date(),
    };
  }

  /**
   * Genera diálogo para misión completada
   */
  getMissionCompleteDialogue(difficulty: string): DialogueMessage[] {
    const key = `mission_complete_${difficulty.toLowerCase()}`;
    const templates = DIALOGUE_TEMPLATES[key] || DIALOGUE_TEMPLATES.mission_complete_easy;

    return templates.flatMap(template => 
      template.texts.map(text => ({
        character: template.npcId,
        text,
        mood: template.mood,
        timestamp: new Date(),
      }))
    );
  }

  /**
   * Genera diálogo para misión fallida
   */
  getMissionFailDialogue(): DialogueMessage {
    const templates = DIALOGUE_TEMPLATES.mission_fail;
    const template = templates[Math.floor(Math.random() * templates.length)];
    const text = template.texts[Math.floor(Math.random() * template.texts.length)];

    return {
      character: template.npcId,
      text,
      mood: template.mood,
      timestamp: new Date(),
    };
  }

  /**
   * Genera advertencia de trace
   */
  getTraceWarningDialogue(traceLevel: number): DialogueMessage | null {
    let key: string;

    if (traceLevel >= 90) {
      key = 'trace_warning_critical';
    } else if (traceLevel >= 70) {
      key = 'trace_warning_high';
    } else {
      return null; // No hay advertencia
    }

    const templates = DIALOGUE_TEMPLATES[key];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const text = template.texts[Math.floor(Math.random() * template.texts.length)];

    return {
      character: template.npcId,
      text,
      mood: template.mood,
      timestamp: new Date(),
    };
  }

  /**
   * Genera advertencia de Hook crítico
   */
  getHookWarningDialogue(hookHealth: number): DialogueMessage | null {
    if (hookHealth <= 0) {
      const templates = DIALOGUE_TEMPLATES.hook_burned;
      const template = templates[0];
      const text = template.texts.join(' ');

      return {
        character: template.npcId,
        text,
        mood: template.mood,
        timestamp: new Date(),
      };
    }

    if (hookHealth <= 25) {
      const templates = DIALOGUE_TEMPLATES.hook_critical;
      const template = templates[0];
      const text = template.texts[Math.floor(Math.random() * template.texts.length)];

      return {
        character: template.npcId,
        text,
        mood: template.mood,
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Aparición aleatoria de Ghost (5% de probabilidad)
   */
  getGhostRandomDialogue(): DialogueMessage | null {
    const chance = Math.random();
    
    if (chance > 0.05) {
      return null; // 95% de probabilidad de no aparecer
    }

    const templates = DIALOGUE_TEMPLATES.ghost_random;
    const template = templates[0];
    const text = template.texts[Math.floor(Math.random() * template.texts.length)];

    this.logger.log('👻 Ghost appeared with a message');

    return {
      character: template.npcId,
      text,
      mood: template.mood,
      timestamp: new Date(),
    };
  }

  /**
   * Convierte diálogos de JSON a DialogueMessage[]
   */
  parseDialogueFromJson(dialogueJson: any): DialogueMessage[] {
    if (!Array.isArray(dialogueJson)) {
      return [];
    }

    return dialogueJson.map(d => ({
      character: d.character as NpcId,
      text: d.text,
      mood: d.mood as Mood,
      timestamp: new Date(),
    }));
  }

  /**
   * Registra diálogo enviado en el intento
   */
  async logDialogueSent(attemptId: string, npcId: NpcId, text: string) {
    const attempt = await this.prisma.missionAttempt.findUnique({
      where: { id: attemptId },
      select: { ghostMessagesSent: true },
    });

    if (!attempt) return;

    const messages = [...attempt.ghostMessagesSent, `${npcId}:${text}`];

    await this.prisma.missionAttempt.update({
      where: { id: attemptId },
      data: { ghostMessagesSent: messages },
    });
  }

  /**
   * Genera diálogo de captura del FBI
   */
  getFbiCaptureDialogue(failureReason: 'trace_maxed' | 'hook_burned' | 'timeout' | 'critical_error'): DialogueMessage[] {
    const key = `fbi_capture_${failureReason}`;
    const templates = DIALOGUE_TEMPLATES[key];
    
    if (!templates) {
      this.logger.warn(`No FBI dialogue found for: ${failureReason}`);
      return this.getGenericFbiCaptureDialogue();
    }

    const template = templates[0];
    
    return template.texts.map(text => ({
      character: template.npcId,
      text,
      mood: template.mood,
      timestamp: new Date(),
    }));
  }

  /**
   * Genera advertencia del FBI (cerca de ser capturado)
   */
  getFbiWarningDialogue(isFirstWarning: boolean): DialogueMessage[] {
    const key = isFirstWarning ? 'fbi_warning_first_time' : 'fbi_near_capture';
    const templates = DIALOGUE_TEMPLATES[key];
    const template = templates[0];

    this.logger.warn(`🔵 FBI Warning issued: ${isFirstWarning ? 'FIRST' : 'NEAR CAPTURE'}`);

    return template.texts.map(text => ({
      character: template.npcId,
      text,
      mood: template.mood,
      timestamp: new Date(),
    }));
  }

  /**
   * Diálogo genérico de captura (fallback)
   */
  private getGenericFbiCaptureDialogue(): DialogueMessage[] {
    return [
      {
        character: NpcId.STIRLING,
        text: '🔵 FBI CYBER CRIMES DIVISION',
        mood: Mood.COLD,
        timestamp: new Date(),
      },
      {
        character: NpcId.STIRLING,
        text: 'Tu actividad ilícita ha sido detectada y rastreada.',
        mood: Mood.COLD,
        timestamp: new Date(),
      },
      {
        character: NpcId.STIRLING,
        text: 'Conexión terminada. Acceso bloqueado.',
        mood: Mood.COLD,
        timestamp: new Date(),
      },
      {
        character: NpcId.STIRLING,
        text: '- Agente Stirling, FBI Cyber Crimes',
        mood: Mood.COLD,
        timestamp: new Date(),
      },
    ];
  }

  /**
   * Determina si debe aparecer advertencia del FBI
   */
  shouldShowFbiWarning(traceLevel: number, previousWarnings: number): boolean {
    // Primera advertencia a 85% de trace
    if (traceLevel >= 85 && previousWarnings === 0) {
      return true;
    }

    // Segunda advertencia a 95% de trace
    if (traceLevel >= 95 && previousWarnings === 1) {
      return true;
    }

    return false;
  }
}