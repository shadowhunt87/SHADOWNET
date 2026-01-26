import { IsString } from 'class-validator';

export class ExecuteCommandDto {
  @IsString()
  command: string;
}