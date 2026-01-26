/*
  Warnings:

  - You are about to drop the column `successDialog` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `successStory` on the `Mission` table. All the data in the column will be lost.
  - You are about to drop the column `variablesTemplate` on the `Mission` table. All the data in the column will be lost.
  - You are about to alter the column `traceLevel` on the `MissionAttempt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `ganchoHealth` on the `MissionAttempt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `hasCompletedTutorial` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `globalTrace` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Made the column `details` on table `ActivityLog` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `objectivesPool` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tracebackConfig` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `randomSeed` to the `MissionAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedObjectives` to the `MissionAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MissionProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `nickname` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "MissionAttempt" DROP CONSTRAINT "MissionAttempt_missionId_fkey";

-- DropForeignKey
ALTER TABLE "MissionAttempt" DROP CONSTRAINT "MissionAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "MissionProgress" DROP CONSTRAINT "MissionProgress_missionId_fkey";

-- DropForeignKey
ALTER TABLE "MissionProgress" DROP CONSTRAINT "MissionProgress_userId_fkey";

-- AlterTable
ALTER TABLE "ActivityLog" ALTER COLUMN "details" SET NOT NULL;

-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "successDialog",
DROP COLUMN "successStory",
DROP COLUMN "variablesTemplate",
ADD COLUMN     "isReplayable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxObjectives" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "minObjectives" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "objectivesPool" JSONB NOT NULL,
ADD COLUMN     "tracebackConfig" JSONB NOT NULL,
ALTER COLUMN "arc" DROP DEFAULT,
ALTER COLUMN "xpReward" DROP DEFAULT,
ALTER COLUMN "creditsReward" DROP DEFAULT,
ALTER COLUMN "allowedCommands" DROP DEFAULT,
ALTER COLUMN "estimatedTime" DROP DEFAULT,
ALTER COLUMN "tags" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MissionAttempt" ADD COLUMN     "randomSeed" TEXT NOT NULL,
ADD COLUMN     "selectedObjectives" JSONB NOT NULL,
ALTER COLUMN "traceLevel" SET DEFAULT 0,
ALTER COLUMN "traceLevel" SET DATA TYPE INTEGER,
ALTER COLUMN "ganchoHealth" SET DEFAULT 100,
ALTER COLUMN "ganchoHealth" SET DATA TYPE INTEGER,
ALTER COLUMN "objectivesCompleted" DROP DEFAULT,
ALTER COLUMN "commandHistory" DROP DEFAULT,
ALTER COLUMN "ghostMessagesSent" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MissionProgress" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "hasCompletedTutorial",
DROP COLUMN "password",
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "premiumUntil" TIMESTAMP(3),
ALTER COLUMN "nickname" SET NOT NULL,
ALTER COLUMN "globalTrace" SET DEFAULT 0,
ALTER COLUMN "globalTrace" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "VariableDefinition" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "format" TEXT,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VariableDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VariableDefinition_missionId_idx" ON "VariableDefinition"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "VariableDefinition_missionId_key_key" ON "VariableDefinition"("missionId", "key");

-- CreateIndex
CREATE INDEX "Mission_difficulty_idx" ON "Mission"("difficulty");

-- CreateIndex
CREATE INDEX "Mission_arc_idx" ON "Mission"("arc");

-- CreateIndex
CREATE INDEX "MissionAttempt_missionId_idx" ON "MissionAttempt"("missionId");

-- CreateIndex
CREATE INDEX "MissionProgress_userId_idx" ON "MissionProgress"("userId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_reputation_idx" ON "User"("reputation");

-- AddForeignKey
ALTER TABLE "VariableDefinition" ADD CONSTRAINT "VariableDefinition_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionAttempt" ADD CONSTRAINT "MissionAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionAttempt" ADD CONSTRAINT "MissionAttempt_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionProgress" ADD CONSTRAINT "MissionProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionProgress" ADD CONSTRAINT "MissionProgress_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
