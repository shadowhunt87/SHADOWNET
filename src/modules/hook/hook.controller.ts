import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { HookService } from './hook.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { GetUser } from '../../shared/decorators/get-user.decorator';
import { ApplyDamageDto } from './dto/apply-damage.dto';
import { RecoverHookDto } from './dto/recover-hook.dto';

@Controller('hook')
@UseGuards(JwtAuthGuard)
export class HookController {
  constructor(private readonly hookService: HookService) {}

  @Get('status')
  async getStatus(@GetUser('id') userId: string) {
    return this.hookService.getHookStatus(userId);
  }

  @Post('damage')
  @HttpCode(HttpStatus.OK)
  async applyDamage(@GetUser('id') userId: string, @Body() dto: ApplyDamageDto) {
    return this.hookService.applyDamage(userId, dto);
  }

  @Post('recover')
  @HttpCode(HttpStatus.OK)
  async recover(@GetUser('id') userId: string, @Body() dto?: RecoverHookDto) {
    return this.hookService.recoverHook(userId, dto);
  }

  @Get('history')
  async getHistory(@GetUser('id') userId: string) {
    return this.hookService.getHookHistory(userId);
  }
}