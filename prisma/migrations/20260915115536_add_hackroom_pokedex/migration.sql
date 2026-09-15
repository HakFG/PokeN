-- CreateTable
CREATE TABLE "HackRoomPokedexEntry" (
    "id" TEXT NOT NULL,
    "hackRoomId" TEXT NOT NULL,
    "pokemonId" INTEGER,
    "fakeSpeciesId" TEXT,
    "name" TEXT NOT NULL,
    "entryNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HackRoomPokedexEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HackRoomPokedexEntry_hackRoomId_idx" ON "HackRoomPokedexEntry"("hackRoomId");

-- CreateIndex
CREATE INDEX "HackRoomPokedexEntry_fakeSpeciesId_idx" ON "HackRoomPokedexEntry"("fakeSpeciesId");

-- CreateIndex
CREATE UNIQUE INDEX "HackRoomPokedexEntry_hackRoomId_entryNumber_key" ON "HackRoomPokedexEntry"("hackRoomId", "entryNumber");

-- CreateIndex
CREATE UNIQUE INDEX "HackRoomPokedexEntry_hackRoomId_pokemonId_key" ON "HackRoomPokedexEntry"("hackRoomId", "pokemonId");

-- CreateIndex
CREATE UNIQUE INDEX "HackRoomPokedexEntry_hackRoomId_fakeSpeciesId_key" ON "HackRoomPokedexEntry"("hackRoomId", "fakeSpeciesId");

-- AddForeignKey
ALTER TABLE "HackRoomPokedexEntry" ADD CONSTRAINT "HackRoomPokedexEntry_hackRoomId_fkey" FOREIGN KEY ("hackRoomId") REFERENCES "HackRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackRoomPokedexEntry" ADD CONSTRAINT "HackRoomPokedexEntry_fakeSpeciesId_fkey" FOREIGN KEY ("fakeSpeciesId") REFERENCES "FakeSpecies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
