/*
  Warnings:

  - Added the required column `introDialog` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `npcId` to the `Mission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `successDialog` to the `Mission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mission" ADD COLUMN     "estimatedTime" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "introDialog" JSONB NOT NULL,
ADD COLUMN     "npcId" TEXT NOT NULL,
ADD COLUMN     "successDialog" JSONB NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
