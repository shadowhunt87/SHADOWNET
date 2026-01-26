import { Module } from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { ProgressionController } from './progression.controller';
import { XpCalculator } from './calculators/xp-calculator';
import { RankCalculator } from './calculators/rank-calculator';

@Module({
  controllers: [ProgressionController],
  providers: [
    ProgressionService,
    XpCalculator,
    RankCalculator,
  ],
  exports: [ProgressionService],
})
export class ProgressionModule {}