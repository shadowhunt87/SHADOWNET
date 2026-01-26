import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { GetUser } from '../../shared/decorators/get-user.decorator';

@Controller('progression')
@UseGuards(JwtAuthGuard)
export class ProgressionController {
  constructor(private readonly progressionService: ProgressionService) {}

  @Get()
  async getProgression(@GetUser('id') userId: string) {
    return this.progressionService.getUserProgression(userId);
  }

  @Get('stats')
  async getStats(@GetUser('id') userId: string) {
    return this.progressionService.getUserStats(userId);
  }
}