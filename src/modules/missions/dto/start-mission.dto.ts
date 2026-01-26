import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class StartMissionDto {
  @IsString()
  missionId: string;

  @IsOptional()
  @IsBoolean()
  hasStealthUpgrade?: boolean; // Premium: reduce trace
}