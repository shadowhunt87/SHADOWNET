// src/modules/missions/selectors/objective-selector.service.ts

import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ObjectiveSelectorService {
  private readonly logger = new Logger(ObjectiveSelectorService.name);

  /**
   * Selecciona objetivos del pool
   * - Tutorial (nodeNumber 0): Devuelve TODOS los objetivos
   * - Misiones normales: Selecciona entre min y max aleatoriamente
   */
  selectObjectives(
    objectivesPool: any[],
    minObjectives: number,
    maxObjectives: number,
    seed?: string,
    isTutorial: boolean = false,
  ): any[] {
    // Validación básica
    if (!objectivesPool || objectivesPool.length === 0) {
      this.logger.warn('Empty objectives pool provided');
      return [];
    }

    // ✅ CASO ESPECIAL: Tutorial usa TODOS los objetivos
    if (isTutorial) {
      this.logger.log(`🎓 Tutorial mode: Using all ${objectivesPool.length} objectives`);
      return objectivesPool;
    }

    // ✅ Crear función random (con seed o sin seed)
    const random = seed ? this.seededRandom(seed) : Math.random;

    // ✅ Calcular cuántos objetivos seleccionar
    // Asegurar que no excedemos el tamaño del pool
    const effectiveMax = Math.min(maxObjectives, objectivesPool.length);
    const effectiveMin = Math.min(minObjectives, effectiveMax);

    // ✅ Si min === max, usar ese número exacto (sin randomización)
    const count = effectiveMin === effectiveMax
      ? effectiveMax
      : Math.floor(random() * (effectiveMax - effectiveMin + 1) + effectiveMin);

    this.logger.log(
      `🎲 Selecting ${count} objectives (min: ${effectiveMin}, max: ${effectiveMax}, pool: ${objectivesPool.length})`,
    );

    // ✅ Barajar el pool
    const shuffled = this.shuffle([...objectivesPool], random);

    // ✅ Tomar los primeros N objetivos
    const selected = shuffled.slice(0, count);

    // ✅ Log de los objetivos seleccionados
    const selectedCodes = selected.map(obj => obj.code).join(', ');
    this.logger.log(`✅ Selected objectives: [${selectedCodes}]`);

    return selected;
  }

  /**
   * Barajado de Fisher-Yates
   * Mezcla aleatoriamente un array
   */
  private shuffle(array: any[], random: () => number = Math.random): any[] {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  /**
   * Generador de números aleatorios con seed
   * Permite reproducir la misma secuencia de números con el mismo seed
   */
  private seededRandom(seed: string): () => number {
    // Convertir el string seed en un hash numérico
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Linear Congruential Generator (LCG)
    // Fórmula: X(n+1) = (a * X(n) + c) mod m
    return () => {
      hash = (hash * 9301 + 49297) % 233280;
      return hash / 233280;
    };
  }

  /**
   * Genera un seed único para un intento
   * Formato: userId-missionId-timestamp
   */
  generateSeed(userId: string, missionId: string): string {
    const timestamp = Date.now();
    return `${userId}-${missionId}-${timestamp}`;
  }

  /**
   * Verifica si un objetivo está disponible según condiciones
   * (Útil para objetivos condicionales u ocultos)
   */
  isObjectiveAvailable(
    objective: any,
    completedObjectives: string[],
  ): boolean {
    // Si el objetivo tiene una condición de desbloqueo
    if (objective.unlocksOn) {
      return completedObjectives.includes(objective.unlocksOn);
    }

    // Si es un objetivo oculto por defecto
    if (objective.isHidden && !objective.unlocksOn) {
      return false;
    }

    // Por defecto, está disponible
    return true;
  }

  /**
   * Filtra objetivos según disponibilidad
   * Útil para objetivos que se desbloquean dinámicamente
   */
  filterAvailableObjectives(
    objectivesPool: any[],
    completedObjectives: string[],
  ): any[] {
    return objectivesPool.filter(obj =>
      this.isObjectiveAvailable(obj, completedObjectives),
    );
  }

  /**
   * Ordena objetivos por dificultad/secuencia
   * Útil para el modo tutorial
   */
  sortObjectivesBySequence(objectives: any[]): any[] {
    // Si tienen un campo 'sequence' o 'order', usarlo
    return objectives.sort((a, b) => {
      const seqA = a.sequence ?? a.order ?? 0;
      const seqB = b.sequence ?? b.order ?? 0;
      return seqA - seqB;
    });
  }

  /**
   * Agrupa objetivos por categoría
   * Útil para análisis y reportes
   */
  groupObjectivesByCategory(objectives: any[]): Map<string, any[]> {
    const grouped = new Map<string, any[]>();

    objectives.forEach(obj => {
      const category = obj.category || 'general';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(obj);
    });

    return grouped;
  }

  /**
   * Calcula estadísticas de objetivos
   * Útil para balanceo de misiones
   */
  calculateObjectiveStats(objectives: any[]): {
    totalTraceImpact: number;
    averageTraceImpact: number;
    categories: string[];
    difficulty: string;
  } {
    const totalTraceImpact = objectives.reduce(
      (sum, obj) => sum + (obj.traceImpact || 0),
      0,
    );

    const averageTraceImpact = objectives.length > 0
      ? totalTraceImpact / objectives.length
      : 0;

    const categories = [
      ...new Set(objectives.map(obj => obj.category || 'general')),
    ];

    // Determinar dificultad basada en trace promedio
    let difficulty = 'EASY';
    if (averageTraceImpact > 20) difficulty = 'HARD';
    else if (averageTraceImpact > 10) difficulty = 'MEDIUM';

    return {
      totalTraceImpact,
      averageTraceImpact,
      categories,
      difficulty,
    };
  }
}