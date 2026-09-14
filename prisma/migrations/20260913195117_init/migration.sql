-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('FRANCHISE', 'HACK_ROM');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoritePokemon" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "slot" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoritePokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GameType" NOT NULL,
    "themeColor" TEXT NOT NULL,
    "bannerUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HackRoom" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HackRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomSprite" (
    "id" TEXT NOT NULL,
    "hackRoomId" TEXT NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomSprite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnedPokemon" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "nickname" TEXT,
    "level" INTEGER NOT NULL,
    "isShiny" BOOLEAN NOT NULL DEFAULT false,
    "boxNumber" INTEGER NOT NULL DEFAULT 1,
    "boxSlot" INTEGER NOT NULL,
    "moveset" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnedPokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerCard" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "trainerName" TEXT NOT NULL,
    "characterSpriteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainerCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "trainerCardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT,
    "earnedAt" TIMESTAMP(3),

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerCardPokemon" (
    "id" TEXT NOT NULL,
    "trainerCardId" TEXT NOT NULL,
    "pokemonId" INTEGER NOT NULL,
    "nickname" TEXT,
    "slot" INTEGER NOT NULL,
    "moveset" JSONB,

    CONSTRAINT "TrainerCardPokemon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoritePokemon_profileId_idx" ON "FavoritePokemon"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoritePokemon_profileId_slot_key" ON "FavoritePokemon"("profileId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "HackRoom_gameId_key" ON "HackRoom"("gameId");

-- CreateIndex
CREATE INDEX "CustomSprite_hackRoomId_idx" ON "CustomSprite"("hackRoomId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomSprite_hackRoomId_pokemonId_key" ON "CustomSprite"("hackRoomId", "pokemonId");

-- CreateIndex
CREATE INDEX "OwnedPokemon_gameId_idx" ON "OwnedPokemon"("gameId");

-- CreateIndex
CREATE INDEX "OwnedPokemon_pokemonId_idx" ON "OwnedPokemon"("pokemonId");

-- CreateIndex
CREATE UNIQUE INDEX "OwnedPokemon_gameId_boxNumber_boxSlot_key" ON "OwnedPokemon"("gameId", "boxNumber", "boxSlot");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerCard_gameId_key" ON "TrainerCard"("gameId");

-- CreateIndex
CREATE INDEX "Badge_trainerCardId_idx" ON "Badge"("trainerCardId");

-- CreateIndex
CREATE INDEX "TrainerCardPokemon_trainerCardId_idx" ON "TrainerCardPokemon"("trainerCardId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerCardPokemon_trainerCardId_slot_key" ON "TrainerCardPokemon"("trainerCardId", "slot");

-- AddForeignKey
ALTER TABLE "FavoritePokemon" ADD CONSTRAINT "FavoritePokemon_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackRoom" ADD CONSTRAINT "HackRoom_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSprite" ADD CONSTRAINT "CustomSprite_hackRoomId_fkey" FOREIGN KEY ("hackRoomId") REFERENCES "HackRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedPokemon" ADD CONSTRAINT "OwnedPokemon_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerCard" ADD CONSTRAINT "TrainerCard_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_trainerCardId_fkey" FOREIGN KEY ("trainerCardId") REFERENCES "TrainerCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerCardPokemon" ADD CONSTRAINT "TrainerCardPokemon_trainerCardId_fkey" FOREIGN KEY ("trainerCardId") REFERENCES "TrainerCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
