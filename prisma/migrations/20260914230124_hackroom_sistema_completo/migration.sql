-- CreateEnum
CREATE TYPE "HackDifficulty" AS ENUM ('EASY', 'NORMAL', 'HARD', 'BRUTAL');

-- AlterTable
ALTER TABLE "HackRoom" ADD COLUMN     "baseRomName" TEXT,
ADD COLUMN     "difficulty" "HackDifficulty",
ADD COLUMN     "regionName" TEXT;

-- AlterTable
ALTER TABLE "OwnedPokemon" ADD COLUMN     "caughtLocation" TEXT,
ADD COLUMN     "fakeSpeciesId" TEXT;

-- CreateTable
CREATE TABLE "HackRoomScreenshot" (
    "id" TEXT NOT NULL,
    "hackRoomId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HackRoomScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FakeSpecies" (
    "id" TEXT NOT NULL,
    "hackRoomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "types" TEXT[],
    "spriteUrl" TEXT,
    "description" TEXT,
    "stats" JSONB,
    "evolvesFromId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FakeSpecies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymLeader" (
    "id" TEXT NOT NULL,
    "hackRoomId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "types" TEXT[],
    "spriteUrl" TEXT,
    "defeatedAt" TIMESTAMP(3),
    "xpAwarded" BOOLEAN NOT NULL DEFAULT false,
    "badgeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GymLeader_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HackRoomScreenshot_hackRoomId_idx" ON "HackRoomScreenshot"("hackRoomId");

-- CreateIndex
CREATE INDEX "FakeSpecies_hackRoomId_idx" ON "FakeSpecies"("hackRoomId");

-- CreateIndex
CREATE INDEX "FakeSpecies_evolvesFromId_idx" ON "FakeSpecies"("evolvesFromId");

-- CreateIndex
CREATE UNIQUE INDEX "FakeSpecies_hackRoomId_name_key" ON "FakeSpecies"("hackRoomId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "GymLeader_badgeId_key" ON "GymLeader"("badgeId");

-- CreateIndex
CREATE INDEX "GymLeader_hackRoomId_idx" ON "GymLeader"("hackRoomId");

-- CreateIndex
CREATE INDEX "OwnedPokemon_fakeSpeciesId_idx" ON "OwnedPokemon"("fakeSpeciesId");

-- AddForeignKey
ALTER TABLE "HackRoomScreenshot" ADD CONSTRAINT "HackRoomScreenshot_hackRoomId_fkey" FOREIGN KEY ("hackRoomId") REFERENCES "HackRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FakeSpecies" ADD CONSTRAINT "FakeSpecies_hackRoomId_fkey" FOREIGN KEY ("hackRoomId") REFERENCES "HackRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FakeSpecies" ADD CONSTRAINT "FakeSpecies_evolvesFromId_fkey" FOREIGN KEY ("evolvesFromId") REFERENCES "FakeSpecies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymLeader" ADD CONSTRAINT "GymLeader_hackRoomId_fkey" FOREIGN KEY ("hackRoomId") REFERENCES "HackRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymLeader" ADD CONSTRAINT "GymLeader_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedPokemon" ADD CONSTRAINT "OwnedPokemon_fakeSpeciesId_fkey" FOREIGN KEY ("fakeSpeciesId") REFERENCES "FakeSpecies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
