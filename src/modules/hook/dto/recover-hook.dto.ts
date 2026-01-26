import { IsOptional, IsBoolean } from 'class-validator';

export class RecoverHookDto {
  @IsOptional()
  @IsBoolean()
  usePremium?: boolean; // Premium users pueden recuperar más rápido
}