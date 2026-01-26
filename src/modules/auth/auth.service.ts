import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Rank } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registro de nuevo usuario
   */
  async register(dto: RegisterDto) {
    this.logger.log(`📝 Registro iniciado para: ${dto.email}`);

    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Verificar si el nickname ya existe (si se proporcionó)
      if (dto.nickname) {
        const existingNickname = await this.prisma.user.findUnique({
          where: { nickname: dto.nickname },
        });

        if (existingNickname) {
          throw new ConflictException('Nickname already taken');
        }
      }

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(dto.password, 12);

      // Crear usuario
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash: hashedPassword,
          nickname: dto.nickname || `Shadow_${Date.now()}`,
          avatar: 'default.png', // ✅ Avatar por defecto
          totalXp: 0,
          currentLevel: 1,
          reputation: Rank.SCRIPT_KIDDIE,
          sirCredits: 0,
          globalTrace: 0,
          ganchoStatus: 'SAFE',
          isPremium: false,
        },
      });

      // Inicializar progreso en todas las misiones
      await this.initializeUserProgress(user.id);

      // Log de actividad
      await this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          details: {
            message: 'New operative registered. Protocol Genesis available.',
            timestamp: new Date().toISOString(),
            email: user.email,
            nickname: user.nickname,
          },
        },
      });

      this.logger.log(
        `✅ Usuario registrado: ${user.email} | ${user.nickname} (${user.id})`,
      );

      // Generar token
      const token = this.generateToken(user.id, user.email);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar, // ✅ Incluir avatar
          totalXp: user.totalXp,
          currentLevel: user.currentLevel,
          reputation: user.reputation,
          sirCredits: user.sirCredits,
          globalTrace: user.globalTrace,
          ganchoStatus: user.ganchoStatus,
          isPremium: user.isPremium,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error en registro: ${error.message}`);
      throw error;
    }
  }

  /**
   * Login de usuario
   */
  async login(dto: LoginDto) {
    this.logger.log(`🔐 Login attempt for: ${dto.email}`);

    try {
      // Buscar usuario
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(
        dto.password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`✅ User authenticated: ${user.email}`);

      // Log de actividad
      await this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'USER_LOGIN',
          details: {
            timestamp: new Date().toISOString(),
            email: user.email,
          },
        },
      });

      // Generar token
      const token = this.generateToken(user.id, user.email);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar: user.avatar, // ✅ Incluir avatar
          totalXp: user.totalXp,
          currentLevel: user.currentLevel,
          reputation: user.reputation,
          sirCredits: user.sirCredits,
          globalTrace: user.globalTrace,
          ganchoStatus: user.ganchoStatus,
          isPremium: user.isPremium,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Error en login: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener perfil del usuario
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatar: true, // ✅ Incluir avatar
        totalXp: true,
        currentLevel: true,
        reputation: true,
        sirCredits: true,
        globalTrace: true,
        ganchoStatus: true,
        isPremium: true,
        premiumUntil: true,
        playStyle: true,
        learningSpeed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Actualizar perfil (nickname)
   */
  async updateProfile(userId: string, updateData: { nickname?: string }) {
    this.logger.log(`📝 Updating profile for user: ${userId}`);

    try {
      // Verificar si el nickname ya existe
      if (updateData.nickname) {
        const existingNickname = await this.prisma.user.findFirst({
          where: {
            nickname: updateData.nickname,
            NOT: { id: userId },
          },
        });

        if (existingNickname) {
          throw new ConflictException('Nickname already taken');
        }
      }

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          nickname: true,
          avatar: true,
          totalXp: true,
          currentLevel: true,
          reputation: true,
          sirCredits: true,
          globalTrace: true,
          ganchoStatus: true,
          isPremium: true,
        },
      });

      this.logger.log(`✅ Profile updated for user: ${userId}`);

      return {
        success: true,
        message: 'Profile updated successfully',
        user,
      };
    } catch (error) {
      this.logger.error(`❌ Error updating profile: ${error.message}`);
      throw error;
    }
  }

  /**
   * Actualizar avatar
   */
  async updateAvatar(userId: string, filename: string) {
    this.logger.log(`📸 Updating avatar for user: ${userId}`);

    try {
      // Obtener el usuario actual para eliminar el avatar anterior
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      // Eliminar el avatar anterior si no es el default
      if (
        currentUser &&
        currentUser.avatar &&
        currentUser.avatar !== 'default.png'
      ) {
        const oldAvatarPath = path.join(
          process.cwd(),
          'uploads',
          'avatars',
          currentUser.avatar,
        );
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
          this.logger.log(`🗑️  Old avatar deleted: ${currentUser.avatar}`);
        }
      }

      // Actualizar el avatar en la base de datos
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { avatar: filename },
        select: {
          id: true,
          email: true,
          nickname: true,
          avatar: true,
          totalXp: true,
          currentLevel: true,
          reputation: true,
          sirCredits: true,
          globalTrace: true,
          ganchoStatus: true,
          isPremium: true,
        },
      });

      // Log de actividad
      await this.prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'AVATAR_UPDATED',
          details: {
            message: 'Avatar updated successfully',
            timestamp: new Date().toISOString(),
            newAvatar: filename,
          },
        },
      });

      this.logger.log(`✅ Avatar updated for user: ${userId} -> ${filename}`);

      return {
        success: true,
        message: 'Avatar updated successfully',
        avatar: user.avatar,
        user,
      };
    } catch (error) {
      this.logger.error(`❌ Error updating avatar: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generar token JWT
   */
  private generateToken(userId: string, email: string): string {
    const payload = {
      sub: userId,
      email,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Inicializar progreso de misiones para nuevo usuario
   */
  private async initializeUserProgress(userId: string) {
    try {
      const missions = await this.prisma.mission.findMany({
        orderBy: { nodeNumber: 'asc' },
      });

      if (missions.length === 0) {
        this.logger.warn(
          '⚠️  No missions found in database. Skipping progress initialization.',
        );
        return;
      }

      const progressData = missions.map((mission) => ({
        userId,
        missionId: mission.id,
        isCompleted: false,
        isInProgress: false,
        attempts: 0,
      }));

      await this.prisma.missionProgress.createMany({
        data: progressData,
      });

      this.logger.log(
        `✅ Progress initialized for user: ${userId} (${missions.length} missions)`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error initializing user progress: ${error.message}`,
      );
      // No lanzar error para no bloquear el registro
    }
  }
}