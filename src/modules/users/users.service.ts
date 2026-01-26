import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ✅ NUEVO: Método para actualizar avatar
 async updateUserAvatar(userId: string, avatarFilename: string) {
  // 1. Obtener usuario actual
  const currentUser = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true, email: true, nickname: true },
  });

  if (!currentUser) {
    throw new NotFoundException('Usuario no encontrado');
  }

  // 2. NO borrar inmediatamente - marcar para limpieza futura
  // En su lugar, mantener ambos archivos temporalmente
  const timestamp = Date.now();
  const oldAvatar = currentUser.avatar;

  // 3. Actualizar en la base de datos CON timestamp único
  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      avatar: avatarFilename,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      nickname: true,
      email: true,
      avatar: true,
      totalXp: true,
      currentLevel: true,
      reputation: true,
      sirCredits: true,
      isPremium: true,
      globalTrace: true,
      ganchoStatus: true,
      playStyle: true,
      learningSpeed: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 4. Programar borrado del avatar antiguo después de 1 minuto
  if (oldAvatar && oldAvatar !== avatarFilename) {
    setTimeout(() => {
      const oldAvatarPath = path.join(
        process.cwd(),
        'uploads',
        'avatars',
        oldAvatar,
      );

      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
          console.log(`🗑️  Cleaned up old avatar: ${oldAvatar}`);
        } catch (error) {
          console.error(`❌ Error cleaning up old avatar: ${error}`);
        }
      }
    }, 60000); // 1 minuto
  }

  // 5. Retornar respuesta con timestamp único
  const response = {
    ...updatedUser,
    hackerNickname: updatedUser.nickname,
    username: updatedUser.nickname,
    currentRank: updatedUser.reputation,
    walletBalance: updatedUser.sirCredits,
    // ✅ URL con timestamp único que cambia con cada upload
    avatarUrl: `/uploads/avatars/${avatarFilename}?v=${timestamp}`,
    oldAvatar: oldAvatar, // Informar cuál era el avatar anterior
  };

  // 6. Crear log de actividad
  try {
    await this.prisma.activityLog.create({
      data: {
        userId: userId,
        action: 'AVATAR_UPDATED',
        details: {
          message: 'Avatar actualizado',
          oldAvatar: oldAvatar,
          newAvatar: avatarFilename,
          timestamp: timestamp,
        },
      },
    });
  } catch (logError) {
    console.error('❌ Error creating activity log:', logError);
  }

  return response;
}
  async getLeaderboard(limit: number = 10) {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        email: true,
        avatar: true,
        totalXp: true,
        currentLevel: true,
        reputation: true,
        progress: {
          select: {
            isCompleted: true,
            completedAt: true,
            mission: {
              select: {
                title: true,
              },
            },
          },
          where: {
            isCompleted: true,
          },
        },
      },
      orderBy: {
        totalXp: 'desc',
      },
      take: limit,
    });

    // ✅ MAPEAR LOS CAMPOS PARA QUE FLUTTER LOS ENTIENDA
    return users.map((user, index) => {
      // Construir URL completa del avatar
      let avatarUrl = '/uploads/avatars/default.png';
      if (user.avatar) {
        avatarUrl = `/uploads/avatars/${user.avatar}?v=${Date.now()}`;
      }

      return {
        position: index + 1,
        id: user.id,
        nickname: user.nickname,
        hackerNickname: user.nickname,
        username: user.nickname,
        email: user.email,
        avatar: user.avatar,
        avatarUrl: avatarUrl, // ✅ NUEVO: URL completa
        totalXp: user.totalXp,
        currentLevel: user.currentLevel,
        currentRank: user.reputation,
        reputation: user.reputation,
        completedMissions: user.progress.length,
      };
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        email: true,
        avatar: true,
        totalXp: true,
        currentLevel: true,
        reputation: true,
        sirCredits: true,
        globalTrace: true,
        playStyle: true,
        learningSpeed: true,
        isPremium: true,
        createdAt: true,
        progress: {
          select: {
            isCompleted: true,
            isInProgress: true,
            attempts: true,
            bestTime: true,
            bestTrace: true,
            ethicalScore: true,
            completedAt: true,
            mission: {
              select: {
                id: true,
                title: true,
                difficulty: true,
                nodeNumber: true,
                xpReward: true,
              },
            },
          },
        },
        achievements: {
          select: {
            unlockedAt: true,
            achievement: {
              select: {
                code: true,
                title: true,
                iconUrl: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Calcular estadísticas
    const completedMissions = user.progress.filter((p) => p.isCompleted);
    const totalAttempts = user.progress.reduce((sum, p) => sum + p.attempts, 0);
    const bestTime = Math.min(
      ...user.progress.map((p) => p.bestTime || Infinity),
    );
    const averageTrace =
      user.progress.length > 0
        ? user.progress.reduce((sum, p) => sum + (p.bestTrace || 0), 0) /
          user.progress.length
        : 0;
    const averageEthicalScore =
      user.progress.length > 0
        ? user.progress.reduce((sum, p) => sum + (p.ethicalScore || 0), 0) /
          user.progress.length
        : 100;

    // Construir URL completa del avatar
    let avatarUrl = '/uploads/avatars/default.png';
    if (user.avatar) {
      avatarUrl = `/uploads/avatars/${user.avatar}?v=${Date.now()}`;
    }

    // ✅ MAPEAR PARA FLUTTER
    return {
      id: user.id,
      nickname: user.nickname,
      hackerNickname: user.nickname,
      username: user.nickname,
      email: user.email,
      avatar: user.avatar,
      avatarUrl: avatarUrl, // ✅ NUEVO: URL completa
      totalXp: user.totalXp,
      currentLevel: user.currentLevel,
      currentRank: user.reputation,
      reputation: user.reputation,
      sirCredits: user.sirCredits,
      walletBalance: user.sirCredits, // Para compatibilidad
      globalTrace: user.globalTrace,
      playStyle: user.playStyle,
      learningSpeed: user.learningSpeed,
      isPremium: user.isPremium,
      createdAt: user.createdAt,
      stats: {
        completedMissions: completedMissions.length,
        totalAttempts: totalAttempts,
        bestTime: bestTime === Infinity ? 0 : bestTime,
        averageTrace: Math.round(averageTrace * 100) / 100,
        averageEthicalScore: Math.round(averageEthicalScore * 100) / 100,
        successRate:
          totalAttempts > 0
            ? Math.round((completedMissions.length / totalAttempts) * 100)
            : 0,
      },
      progress: user.progress,
      achievements: user.achievements.map((ua) => ({
        code: ua.achievement.code,
        title: ua.achievement.title,
        iconUrl: ua.achievement.iconUrl,
        unlockedAt: ua.unlockedAt,
      })),
    };
  }

  // ✅ Obtener logs de actividad del usuario
  async getActivityLogs(userId: string) {
    const logs = await this.prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        action: true,
        details: true,
        createdAt: true,
      },
    });

    // Mapear a formato esperado por Flutter
    return logs.map((log) => ({
      type: this.mapActionToType(log.action),
      message: this.extractMessage(log.details, log.action),
      xpGained: this.extractXpGained(log.details),
      createdAt: log.createdAt.toISOString(),
    }));
  }

  // ✅ Helper: Mapear acciones a tipos
  private mapActionToType(action: string): string {
    if (action.includes('MISSION')) return 'MISSION';
    if (action.includes('RANK')) return 'RANK_UP';
    if (action.includes('AVATAR')) return 'SYSTEM';
    if (action.includes('LOGIN')) return 'SYSTEM';
    if (action.includes('REGISTER')) return 'SYSTEM';
    return 'SYSTEM';
  }

  // ✅ Helper: Extraer mensaje del log
  private extractMessage(details: any, action: string): string {
    if (typeof details === 'object' && details !== null) {
      if (details.message) return details.message;
      if (details.details) return details.details;
    }
    
    // Formatear el action como mensaje legible
    return action
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // ✅ Helper: Extraer XP ganado
  private extractXpGained(details: any): number {
    if (typeof details === 'object' && details !== null) {
      if (typeof details.xpGained === 'number') return details.xpGained;
      if (typeof details.xp === 'number') return details.xp;
    }
    return 0;
  }

  // ✅ NUEVO: Obtener solo la URL del avatar
  async getAvatarUrl(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!user || !user.avatar) {
      return '/uploads/avatars/default.png';
    }

    return `/uploads/avatars/${user.avatar}?v=${Date.now()}`;
  }

  // ✅ NUEVO: Verificar si usuario existe
  async userExists(userId: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id: userId },
    });
    return count > 0;
  }
}