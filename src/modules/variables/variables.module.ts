import { Module } from '@nestjs/common';
import { VariablesService } from './variables.service';
import { IpGenerator } from './generators/ip.generator';
import { PasswordGenerator } from './generators/password.generator';
import { FilenameGenerator } from './generators/filename.generator';

@Module({
  providers: [
    VariablesService,
    IpGenerator,
    PasswordGenerator,
    FilenameGenerator,
  ],
  exports: [VariablesService],
})
export class VariablesModule {}