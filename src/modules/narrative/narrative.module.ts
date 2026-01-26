import { Module } from '@nestjs/common';
import { NarrativeService } from './narrative.service';
import { NarrativeController } from './narrative.controller';

@Module({
  controllers: [NarrativeController],
  providers: [NarrativeService],
  exports: [NarrativeService],
})
export class NarrativeModule {}