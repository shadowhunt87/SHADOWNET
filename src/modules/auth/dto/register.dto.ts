import { IsEmail, IsString, MinLength, IsOptional, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Nickname must be at least 3 characters long' })
  @MaxLength(20, { message: 'Nickname must not exceed 20 characters' })
  nickname?: string;
}