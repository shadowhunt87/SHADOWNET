import { NpcId, Mood } from '../interfaces/npc.interface';

interface DialogueTemplate {
  npcId: NpcId;
  mood: Mood;
  texts: string[];
}

export const DIALOGUE_TEMPLATES: Record<string, DialogueTemplate[]> = {
  // ═════════════════════════════════════════════════════════
  // INICIO DE MISIÓN
  // ═════════════════════════════════════════════════════════
  mission_start_tutorial: [
    {
      npcId: NpcId.BOSS,
      mood: Mood.COLD,
      texts: [
        'Shadow Hunter... Los sistemas están bloqueados.',
        'Verifica tu firma. Zero se encargará de tu entrenamiento.',
        'No me falles.',
      ],
    },
    {
      npcId: NpcId.ZERO,
      mood: Mood.NEUTRAL,
      texts: [
        'Bienvenido al protocolo. Vamos paso a paso.',
        'Primera lección: siempre verifica tu identidad antes de operar.',
        'Usa los comandos básicos. Familiarízate con el sistema.',
      ],
    },
  ],

  mission_start_easy: [
    {
      npcId: NpcId.ZERO,
      mood: Mood.FOCUSED,
      texts: [
        'Primera regla: mapea el terreno antes de atacar.',
        'Trabaja rápido, trabaja limpio.',
        'No levantes alarmas innecesarias.',
      ],
    },
  ],

  mission_start_medium: [
    {
      npcId: NpcId.SALLY,
      mood: Mood.URGENT,
      texts: [
        'El objetivo está comprometido. Tiempo limitado.',
        'Necesito esos datos. Sin errores.',
        'Mantén tu firma limpia. No podemos perder el Gancho.',
      ],
    },
  ],

  mission_start_hard: [
    {
      npcId: NpcId.BOSS,
      mood: Mood.CHALLENGING,
      texts: [
        'Usuario limitado. Llega a root.',
        'Este es tu examen. Demuéstrame tu valor.',
        'Sin excusas. Quiero resultados.',
      ],
    },
  ],

  // ═════════════════════════════════════════════════════════
  // OBJETIVO COMPLETADO
  // ═════════════════════════════════════════════════════════
  objective_complete: [
    {
      npcId: NpcId.ZERO,
      mood: Mood.PLEASED,
      texts: [
        'Buen trabajo. Continúa.',
        'Objetivo cumplido. Siguiente paso.',
        'Sigue así. Vas bien.',
      ],
    },
    {
      npcId: NpcId.SALLY,
      mood: Mood.IMPRESSED,
      texts: [
        'Datos recibidos. Excelente ejecución.',
        'Limpio y eficiente. Así me gusta.',
        'Trabajo profesional. Sigue.',
      ],
    },
  ],

  // ═════════════════════════════════════════════════════════
  // MISIÓN COMPLETADA
  // ═════════════════════════════════════════════════════════
  mission_complete_tutorial: [
    {
      npcId: NpcId.BOSS,
      mood: Mood.NEUTRAL,
      texts: [
        'Identidad confirmada. Enlazando con Zero...',
        'Protocolo Génesis completado.',
      ],
    },
  ],

  mission_complete_easy: [
    {
      npcId: NpcId.ZERO,
      mood: Mood.PLEASED,
      texts: [
        'Red mapeada. Buen trabajo.',
        'Traceback mínimo. Sally tomó nota.',
      ],
    },
  ],

  mission_complete_hard: [
    {
      npcId: NpcId.BOSS,
      mood: Mood.IMPRESSED,
      texts: [
        'UID=0. Eres el sistema ahora.',
        'Impresionante. ARCO I completado.',
      ],
    },
    {
      npcId: NpcId.ZERO,
      mood: Mood.PROUD,
      texts: [
        'Sabía que lo lograrías.',
        'Bienvenido a la Red Oscura.',
      ],
    },
  ],

  // ═════════════════════════════════════════════════════════
  // MISIÓN FALLIDA
  // ═════════════════════════════════════════════════════════
  mission_fail: [
    {
      npcId: NpcId.BOSS,
      mood: Mood.COLD,
      texts: [
        'Fallaste. Conexión terminada.',
        'Esperaba más de ti.',
        'Inténtalo de nuevo cuando estés listo.',
      ],
    },
    {
      npcId: NpcId.ZERO,
      mood: Mood.SERIOUS,
      texts: [
        'Analiza tus errores. Aprende.',
        'El traceback fue demasiado alto.',
        'Revisa el briefing. Inténtalo nuevamente.',
      ],
    },
  ],

  // ═════════════════════════════════════════════════════════
  // ADVERTENCIAS DE TRACE
  // ═════════════════════════════════════════════════════════
  trace_warning_high: [
    {
      npcId: NpcId.SALLY,
      mood: Mood.URGENT,
      texts: [
        '⚠️ Trace level alto. Trabaja más limpio.',
        'Los sistemas te están rastreando. Cuidado.',
        'Reduce tu huella o aborta la misión.',
      ],
    },
  ],

  trace_warning_critical: [
    {
      npcId: NpcId.BOSS,
      mood: Mood.THREATENING,
      texts: [
        '🔴 CRÍTICO. Un error más y estás quemado.',
        'Termina rápido o desconéctate AHORA.',
      ],
    },
    {
      npcId: NpcId.SALLY,
      mood: Mood.URGENT,
      texts: [
        '🔴 ALERTA MÁXIMA. El gancho está en peligro.',
        'Aborta o ejecuta con precisión absoluta.',
      ],
    },
    
  ],

  // ═════════════════════════════════════════════════════════
  // HOOK CRÍTICO
  // ═════════════════════════════════════════════════════════
  hook_critical: [
    {
      npcId: NpcId.BOSS,
      mood: Mood.COLD,
      texts: [
        '🔴 Tu identidad está comprometida.',
        'Evita operaciones de alto riesgo hasta recuperarte.',
        'El siguiente fallo te quemará permanentemente.',
      ],
    },
  ],

  hook_burned: [
    {
      npcId: NpcId.BOSS,
      mood: Mood.COLD,
      texts: [
        '🔥 IDENTIDAD QUEMADA.',
        'Acceso a servidores bloqueado.',
        'Contacta a administración o espera 24h para recuperación automática.',
      ],
    },
  ],

  // ═════════════════════════════════════════════════════════
  // GHOST (Apariciones aleatorias)
  // ═════════════════════════════════════════════════════════
  ghost_random: [
    {
      npcId: NpcId.GHOST,
      mood: Mood.MYSTERIOUS,
      texts: [
        '👻 Los que escuchan... sobreviven.',
        '👻 El traceback no es tu único enemigo.',
        '👻 Sally sabe más de lo que dice.',
        '👻 El Boss nunca olvida un error.',
        '👻 Viper está observando...',
      ],
    },
  ],
  // ═════════════════════════════════════════════════════════
  // AGENTE STIRLING (FBI) - CAPTURA
  // ═════════════════════════════════════════════════════════
  fbi_capture_trace_maxed: [
    {
      npcId: NpcId.STIRLING,
      mood: Mood.TRIUMPHANT,
      texts: [
        '🔵 FBI CYBER CRIMES DIVISION',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Pensaste que nunca te encontraríamos, ¿verdad?',
        'Fuiste descuidado. El rastro digital me trajo directamente hasta aquí.',
        'Cada comando que ejecutaste dejó una huella.',
        'Cada paquete interceptado, cada puerto escaneado... todo quedó registrado.',
        'Tu dirección IP ha sido rastreada.',
        'Tu identidad digital está ahora en nuestros registros.',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Agente Stirling - FBI Cyber Crimes',
        'Conexión terminada. Acceso bloqueado.',
      ],
    },
  ],

  fbi_capture_hook_burned: [
    {
      npcId: NpcId.STIRLING,
      mood: Mood.COLD,
      texts: [
        '🔵 FBI CYBER CRIMES DIVISION',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Hemos estado monitoreando tu actividad durante semanas.',
        'Tu "gancho" comprometido nos dio acceso total a tus operaciones.',
        'Cada servidor que tocaste, cada sistema que infiltraste...',
        'Todo está documentado. Todo será usado en tu contra.',
        'Deberías haber sido más cuidadoso con tu identidad digital.',
        'Ahora es demasiado tarde.',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Agente Stirling - FBI Cyber Crimes',
        'Caso cerrado.',
      ],
    },
  ],

  fbi_capture_timeout: [
    {
      npcId: NpcId.STIRLING,
      mood: Mood.MOCKING,
      texts: [
        '🔵 FBI CYBER CRIMES DIVISION',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '¿Te quedaste sin tiempo?',
        'Nuestros sistemas de detección son más rápidos de lo que pensabas.',
        'Mientras perdías el tiempo, nosotros triangulábamos tu posición.',
        'El reloj nunca estuvo de tu lado.',
        'Las alertas se activaron hace 10 minutos.',
        'Teníamos tu ubicación hace 5.',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Agente Stirling - FBI Cyber Crimes',
        'Demasiado lento, demasiado tarde.',
      ],
    },
  ],

  fbi_capture_critical_error: [
    {
      npcId: NpcId.STIRLING,
      mood: Mood.TRIUMPHANT,
      texts: [
        '🔵 FBI CYBER CRIMES DIVISION',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Un error crítico. Exactamente lo que estaba esperando.',
        'Tu comando final dejó una firma única en nuestros honeypots.',
        'Los sistemas trampa funcionaron perfectamente.',
        'Llevamos días preparando esta operación.',
        'Cada error tuyo fue un paso más cerca de tu captura.',
        'Gracias por facilitarnos el trabajo.',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        'Agente Stirling - FBI Cyber Crimes',
        'Operación completada con éxito.',
      ],
    },
  ],

  fbi_warning_first_time: [
    {
      npcId: NpcId.STIRLING,
      mood: Mood.SERIOUS,
      texts: [
        '🔵 [SISTEMA DE ALERTA]',
        'Actividad sospechosa detectada en esta dirección IP.',
        'Primera advertencia.',
        'Cualquier actividad adicional será investigada.',
        '- FBI Cyber Crimes Division',
      ],
    },
  ],

  fbi_near_capture: [
    {
      npcId: NpcId.STIRLING,
      mood: Mood.THREATENING,
      texts: [
        '🔵 [RASTREO ACTIVO]',
        'Hemos identificado patrones de actividad ilícita.',
        'Nuestros sistemas están triangulando tu ubicación.',
        'Recomiendo que cierres esta sesión inmediatamente.',
        'La próxima conexión podría ser la última.',
        '- Agente Stirling',
      ],
    },
  ],
};