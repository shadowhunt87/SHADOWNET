import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class ApplyDamageDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  damage: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  missionId?: string;

  @IsOptional()
  @IsString()
  attemptId?: string;
}