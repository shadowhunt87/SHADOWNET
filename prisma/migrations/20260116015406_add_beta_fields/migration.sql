/*
  Warnings:

  - A unique constraint covering the columns `[codename]` on the table `Npc` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "endings" JSONB,
ADD COLUMN     "npcInteractions" JSONB,
ADD COLUMN     "outroDialogFailure" JSONB,
ADD COLUMN     "outroDialogSuccess" JSONB,
ADD COLUMN     "specialDialogue" JSONB,
ADD COLUMN     "timedEvents" JSONB;

-- AlterTable
ALTER TABLE "MissionProgress" ADD COLUMN     "bestTrace" INTEGER DEFAULT 100,
ADD COLUMN     "ethicalScore" INTEGER DEFAULT 100;

-- AlterTable
ALTER TABLE "Npc" ADD COLUMN     "colorTheme" TEXT,
ADD COLUMN     "personality" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "learningSpeed" TEXT DEFAULT 'medium',
ADD COLUMN     "playStyle" TEXT DEFAULT 'balanced';

-- CreateIndex
CREATE UNIQUE INDEX "Npc_codename_key" ON "Npc"("codename");
