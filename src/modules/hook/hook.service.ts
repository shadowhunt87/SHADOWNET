import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { 
  HookStatus, 
  HookLevel, 
  HookDamageEvent, 
  HookRecoveryResult 
} from './interfaces/hook-status.interface';
import { ApplyDamageDto } from './dto/apply-damage.dto';
import { RecoverHookDto } from './dto/recover-hook.dto';

@Injectable()
export class HookService {
  private readonly logger = new Logger(HookService.name);
  
  private readonly MAX_HEALTH = 100;
  private readonly RECOVERY_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos
  private readonly RECOVERY_AMOUNT = 10;
  private readonly PREMIUM_RECOVERY_MULTIPLIER = 2;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene el estado actual del Hook
   */
  async getHookStatus(userId: string): Promise<HookStatus> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ganchoStatus: true,
        globalTrace: true,
        isPremium: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const currentHealth = this.MAX_HEALTH - user.globalTrace;
    const level = this.calculateHookLevel(currentHealth);

    // Calcular si puede recuperar
    const lastDamageAt = user.updatedAt;
    const now = new Date();
    const timeSinceLastDamage = now.getTime() - lastDamageAt.getTime();
    const canRecover = timeSinceLastDamage >= this.RECOVERY_COOLDOWN_MS;
    const recoveryAvailableAt = canRecover 
      ? undefined 
      : new Date(lastDamageAt.getTime() + this.RECOVERY_COOLDOWN_MS);

    const warnings = this.generateWarnings(level, currentHealth);

    return {
      userId,
      currentHealth: Math.max(0, currentHealth),
      maxHealth: this.MAX_HEALTH,
      level,
      lastDamageAt,
      totalDamageTaken: user.globalTrace,
      totalRecovered: 0, // TODO: Trackear esto en DB
      canRecover,
      recoveryAvailableAt,
      warnings,
    };
  }

  /**
   * Aplica daño al Hook
   */
  async applyDamage(userId: string, dto: ApplyDamageDto): Promise<HookDamageEvent> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { globalTrace: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const newTrace = Math.min(this.MAX_HEALTH, user.globalTrace + dto.damage);
    const newHealth = this.MAX_HEALTH - newTrace;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        globalTrace: newTrace,
        ganchoStatus: this.calculateHookLevel(newHealth),
      },
    });

    // Log del evento
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'HOOK_DAMAGE',
        details: {
          damage: dto.damage,
          reason: dto.reason,
          newHealth,
          missionId: dto.missionId,
          attemptId: dto.attemptId,
          timestamp: new Date().toISOString(),
        },
      },
    });

    this.logger.warn(
      `🎣 Hook damaged for user ${userId}: -${dto.damage}HP (${newHealth}/${this.MAX_HEALTH}) - ${dto.reason}`
    );

    const event: HookDamageEvent = {
      userId,
      damage: dto.damage,
      reason: dto.reason,
      missionId: dto.missionId,
      attemptId: dto.attemptId,
      timestamp: new Date(),
      newHealth: Math.max(0, newHealth),
    };

    // Si el Hook está quemado, registrar evento crítico
    if (newHealth <= 0) {
      await this.handleBurnedHook(userId);
    }

    return event;
  }

  /**
   * Recupera salud del Hook
   */
  async recoverHook(userId: string, dto?: RecoverHookDto): Promise<HookRecoveryResult> {
    const status = await this.getHookStatus(userId);

    // Verificar si puede recuperar
    if (!status.canRecover) {
      const waitTime = Math.ceil((status.recoveryAvailableAt!.getTime() - Date.now()) / 1000 / 60);
      return {
        success: false,
        healthRecovered: 0,
        newHealth: status.currentHealth,
        cooldownUntil: status.recoveryAvailableAt,
        message: `Recovery on cooldown. Wait ${waitTime} minutes.`,
      };
    }

    // Verificar si ya está en máximo
    if (status.currentHealth >= this.MAX_HEALTH) {
      return {
        success: false,
        healthRecovered: 0,
        newHealth: status.currentHealth,
        message: 'Hook is already at maximum health.',
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, globalTrace: true },
    });

    // Calcular recuperación
    let recoveryAmount = this.RECOVERY_AMOUNT;
    if (dto?.usePremium && user?.isPremium) {
      recoveryAmount *= this.PREMIUM_RECOVERY_MULTIPLIER;
    }

    const newTrace = Math.max(0, user!.globalTrace - recoveryAmount);
    const newHealth = this.MAX_HEALTH - newTrace;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        globalTrace: newTrace,
        ganchoStatus: this.calculateHookLevel(newHealth),
      },
    });

    // Log del evento
    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'HOOK_RECOVERY',
        details: {
          recovered: recoveryAmount,
          newHealth,
          isPremium: user?.isPremium,
          timestamp: new Date().toISOString(),
        },
      },
    });

    this.logger.log(
      `🎣 Hook recovered for user ${userId}: +${recoveryAmount}HP (${newHealth}/${this.MAX_HEALTH})`
    );

    return {
      success: true,
      healthRecovered: recoveryAmount,
      newHealth,
      cooldownUntil: new Date(Date.now() + this.RECOVERY_COOLDOWN_MS),
      message: user?.isPremium 
        ? `Premium recovery: +${recoveryAmount}HP` 
        : `Standard recovery: +${recoveryAmount}HP`,
    };
  }

  /**
   * Obtiene el historial de eventos del Hook
   */
  async getHookHistory(userId: string, limit: number = 20) {
    const logs = await this.prisma.activityLog.findMany({
      where: {
        userId,
        action: {
          in: ['HOOK_DAMAGE', 'HOOK_RECOVERY', 'HOOK_BURNED'],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map(log => ({
      action: log.action,
      details: log.details,
      timestamp: log.createdAt,
    }));
  }

  /**
   * Calcula el nivel del Hook basado en la salud
   */
  private calculateHookLevel(health: number): HookLevel {
    if (health >= 75) return HookLevel.SAFE;
    if (health >= 50) return HookLevel.MONITORED;
    if (health >= 25) return HookLevel.COMPROMISED;
    if (health > 0) return HookLevel.CRITICAL;
    return HookLevel.BURNED;
  }

  /**
   * Genera advertencias basadas en el estado
   */
  private generateWarnings(level: HookLevel, health: number): string[] {
    const warnings: string[] = [];

    switch (level) {
      case HookLevel.BURNED:
        warnings.push('🔴 IDENTITY BURNED - Access to servers blocked');
        warnings.push('Contact admin or wait 24h for automatic recovery');
        break;
      case HookLevel.CRITICAL:
        warnings.push('🔴 CRITICAL - One mistake and your identity is burned');
        warnings.push('Avoid high-risk operations');
        break;
      case HookLevel.COMPROMISED:
        warnings.push('🟡 COMPROMISED - Systems are tracking you');
        warnings.push('Reduce trace level before attempting high-risk missions');
        break;
      case HookLevel.MONITORED:
        warnings.push('🟡 MONITORED - Be careful with your actions');
        break;
      case HookLevel.SAFE:
        warnings.push('🟢 SAFE - Identity secure');
        break;
    }

    if (health < 30) {
      warnings.push(`⚠️ Only ${health}HP remaining`);
    }

    return warnings;
  }

  /**
   * Maneja el evento de Hook quemado
   */
  private async handleBurnedHook(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ganchoStatus: HookLevel.BURNED,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'HOOK_BURNED',
        details: {
          message: 'Identity burned. Access to servers blocked.',
          timestamp: new Date().toISOString(),
          autoRecoveryAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    });

    this.logger.error(`🔥 Hook BURNED for user ${userId} - Identity compromised`);
  }

  /**
   * Resetea el Hook (solo admin o auto-recovery después de 24h)
   */
  async resetHook(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        globalTrace: 0,
        ganchoStatus: HookLevel.SAFE,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        userId,
        action: 'HOOK_RESET',
        details: {
          message: 'Hook reset to 100HP',
          timestamp: new Date().toISOString(),
        },
      },
    });

    this.logger.log(`🔄 Hook reset for user ${userId}`);
  }
}