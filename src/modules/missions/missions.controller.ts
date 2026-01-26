// backend/src/modules/missions/missions.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MissionsService } from './missions.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { StartMissionDto } from './dto/start-mission.dto';
import { ExecuteCommandDto } from './dto/execute-command.dto';

@Controller('missions')
@UseGuards(JwtAuthGuard)
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  /**
   * GET /missions - Obtiene todas las misiones disponibles
   */
  @Get()
  async getAvailableMissions(@GetUser('id') userId: string) {
    return this.missionsService.getAvailableMissions(userId);
  }

  /**
   * POST /missions/start - Inicia una nueva misión
   */
  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  async startMission(
    @GetUser('id') userId: string,
    @Body() dto: StartMissionDto,
  ) {
    return this.missionsService.startMission(userId, dto);
  }

  /**
   * POST /missions/:attemptId/command - Ejecuta un comando
   */
  @Post(':attemptId/command')
  @HttpCode(HttpStatus.OK)
  async executeCommand(
    @Param('attemptId') attemptId: string,
    @Body() dto: ExecuteCommandDto,
  ) {
    return this.missionsService.executeCommand(attemptId, dto.command);
  }

  /**
   * GET /missions/:attemptId - Obtiene el estado de un intento
   */
  @Get(':attemptId')
  async getAttemptState(
    @Param('attemptId') attemptId: string,
    @GetUser('id') userId: string,
  ) {
    return this.missionsService.getAttemptState(attemptId, userId);
  }

  /**
   * POST /missions/:attemptId/complete - Completa una misión
   */
  @Post(':attemptId/complete')
  @HttpCode(HttpStatus.OK)
  async completeMission(
    @Param('attemptId') attemptId: string,
    @GetUser('id') userId: string,
  ) {
    return this.missionsService.completeMission(attemptId, userId);
  }

  /**
   * POST /missions/:attemptId/abandon - Abandona una misión
   */
  @Post(':attemptId/abandon')
  @HttpCode(HttpStatus.OK)
  async abandonMission(
    @Param('attemptId') attemptId: string,
    @GetUser('id') userId: string,
  ) {
    return this.missionsService.abandonMission(attemptId, userId);
  }
}