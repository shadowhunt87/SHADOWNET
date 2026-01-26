import { Controller, Get, Param } from '@nestjs/common';
import { NarrativeService } from './narrative.service';
import { Public } from '../../shared/decorators/public.decorator';

@Controller('narrative')
export class NarrativeController {
  constructor(private readonly narrativeService: NarrativeService) {}


  @Get('npcs')
  getAllNpcs() {
    return this.narrativeService.getAllNpcProfiles();
  }


  @Get('npcs/:id')
  getNpc(@Param('id') npcId: string) {
    return this.narrativeService.getNpcProfile(npcId as any);
  }
}