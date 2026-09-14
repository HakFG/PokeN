-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "xpAwarded" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "completionBonusAwarded" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "characterSpriteUrl" TEXT;
