import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AllExceptionsFilter } from './shared/filters/http-exception.filter';
import { VariablesModule } from '@modules/variables/variables.module';
import { HookModule } from '@modules/hook/hook.module';
import { NarrativeModule } from '@modules/narrative/narrative.module';
import { ProgressionModule } from '@modules/progression/progression.module';
import { MissionsModule } from '@modules/missions/missions.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    VariablesModule,
    HookModule,
    NarrativeModule,
    ProgressionModule,
    MissionsModule,
    UsersModule
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}