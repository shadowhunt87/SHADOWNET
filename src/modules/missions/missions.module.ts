import { Module } from '@nestjs/common';
import { MissionsController } from './missions.controller';
import { MissionsService } from './missions.service';
import { CommandExecutorService } from './executors/command-executor.service';
import { CommandParser } from './executors/command-parser';
import { VariablesModule } from '../variables/variables.module';
import { NarrativeModule } from '../narrative/narrative.module';
import { ProgressionModule } from '../progression/progression.module';
import { HookModule } from '../hook/hook.module';
import { ObjectiveSelectorService } from './selectors/objective-selector.service';

@Module({
  imports: [
    VariablesModule,
    NarrativeModule,
    ProgressionModule, HookModule],
  controllers: [MissionsController],
  providers: [
    MissionsService,
    CommandExecutorService,
    CommandParser,
    ObjectiveSelectorService],
  exports: [MissionsService],
})
export class MissionsModule {}