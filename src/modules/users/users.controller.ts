import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { avatarStorage, imageFileFilter } from '../../shared/utils/upload.util';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ NUEVO: Endpoint para subir avatar
  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: avatarStorage,
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo de avatar');
    }

    console.log(
      `📸 Avatar upload: ${file.filename} for user ${userId} (${file.size} bytes)`,
    );

    try {
      // Actualizar el avatar en la base de datos
      const updatedUser = await this.usersService.updateUserAvatar(
        userId,
        file.filename,
      );

      // Construir URL completa con cache busting
      const timestamp = Date.now();
      const avatarUrl = `/uploads/avatars/${file.filename}?v=${timestamp}`;

      return {
        success: true,
        message: 'Avatar actualizado correctamente',
        avatar: file.filename,
        avatarUrl: avatarUrl,
        user: updatedUser,
        timestamp: timestamp,
      };
    } catch (error) {
      console.error('❌ Error uploading avatar:', error);
      throw new BadRequestException(
        'Error al subir el avatar. Por favor, inténtalo de nuevo.',
      );
    }
  }

  @Get('leaderboard')
  async getLeaderboard(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usersService.getLeaderboard(limitNum);
  }

  @Get('profile/:userId')
  async getUserProfile(@Param('userId') userId: string) {
    const profile = await this.usersService.getUserProfile(userId);
    
    if (!profile) {
      throw new BadRequestException('Usuario no encontrado');
    }
    
    return profile;
  }

  @Get('me')
  async getCurrentUser(@GetUser('id') userId: string) {
    const profile = await this.usersService.getUserProfile(userId);
    
    if (!profile) {
      throw new BadRequestException('Usuario no encontrado');
    }
    
    return profile;
  }

  @Get('activity-logs')
  async getActivityLogs(@GetUser('id') userId: string) {
    return this.usersService.getActivityLogs(userId);
  }

  // ✅ NUEVO: Endpoint para obtener avatar específico
  @Get('avatar/:userId')
  async getUserAvatar(@Param('userId') userId: string) {
    // Usamos el servicio en lugar de this.prisma directamente
    const avatarUrl = await this.usersService.getAvatarUrl(userId);
    
    return {
      avatarUrl: avatarUrl,
      hasCustomAvatar: !avatarUrl.includes('default.png'),
      timestamp: Date.now(),
    };
  }
}