import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL!,
});
const prisma = new PrismaClient({ adapter });

type FranchiseGame = {
  name: string;
  spriteKey: string;
  themeColor: string;
  pokedexId: number;
  bannerUrl?: string;
};

const franchiseGames: FranchiseGame[] = [
  { name: 'Red', spriteKey: 'red-blue', themeColor: '#B71C1C', pokedexId: 2 },
  { name: 'Blue', spriteKey: 'red-blue', themeColor: '#1565C0', pokedexId: 2 },
  { name: 'Yellow', spriteKey: 'yellow', themeColor: '#F9A825', pokedexId: 2 },
  { name: 'Gold', spriteKey: 'gold-silver', themeColor: '#F9A825', pokedexId: 3 },
  { name: 'Silver', spriteKey: 'gold-silver', themeColor: '#90A4AE', pokedexId: 3 },
  { name: 'Crystal', spriteKey: 'crystal', themeColor: '#4FC3F7', pokedexId: 3 },
  { name: 'Ruby', spriteKey: 'ruby-sapphire', themeColor: '#B71C1C', pokedexId: 4 },
  { name: 'Sapphire', spriteKey: 'ruby-sapphire', themeColor: '#1565C0', pokedexId: 4 },
  { name: 'Emerald', spriteKey: 'emerald', themeColor: '#2E7D32', pokedexId: 4 },
  { name: 'FireRed', spriteKey: 'firered-leafgreen', themeColor: '#D32F2F', pokedexId: 2 },
  { name: 'LeafGreen', spriteKey: 'firered-leafgreen', themeColor: '#388E3C', pokedexId: 2 },
  { name: 'Diamond', spriteKey: 'diamond-pearl', themeColor: '#5C6BC0', pokedexId: 5 },
  { name: 'Pearl', spriteKey: 'diamond-pearl', themeColor: '#EC407A', pokedexId: 5 },
  { name: 'Platinum', spriteKey: 'platinum', themeColor: '#78909C', pokedexId: 6 },
  { name: 'HeartGold', spriteKey: 'heartgold-soulsilver', themeColor: '#F9A825', pokedexId: 7 },
  { name: 'SoulSilver', spriteKey: 'heartgold-soulsilver', themeColor: '#B0BEC5', pokedexId: 7 },
  { name: 'Black', spriteKey: 'black-white', themeColor: '#212121', pokedexId: 8 },
  { name: 'White', spriteKey: 'black-white', themeColor: '#ECEFF1', pokedexId: 8 },
  { name: 'Black 2', spriteKey: 'black-2-white-2', themeColor: '#212121', pokedexId: 9 },
  { name: 'White 2', spriteKey: 'black-2-white-2', themeColor: '#ECEFF1', pokedexId: 9 },
  { name: 'X', spriteKey: 'x-y', themeColor: '#1976D2', pokedexId: 12 },
  { name: 'Y', spriteKey: 'x-y', themeColor: '#D32F2F', pokedexId: 12 },
  { name: 'Omega Ruby', spriteKey: 'omega-ruby-alpha-sapphire', themeColor: '#B71C1C', pokedexId: 15 },
  { name: 'Alpha Sapphire', spriteKey: 'omega-ruby-alpha-sapphire', themeColor: '#1565C0', pokedexId: 15 },
  { name: 'Sun', spriteKey: 'sun-moon', themeColor: '#FFB300', pokedexId: 16 },
  { name: 'Moon', spriteKey: 'sun-moon', themeColor: '#5E35B1', pokedexId: 16 },
  { name: 'Ultra Sun', spriteKey: 'ultra-sun-ultra-moon', themeColor: '#FFB300', pokedexId: 17 },
  { name: 'Ultra Moon', spriteKey: 'ultra-sun-ultra-moon', themeColor: '#5E35B1', pokedexId: 17 },
  { name: "Let's Go, Pikachu!", spriteKey: 'lets-go-pikachu-eevee', themeColor: '#F9A825', pokedexId: 26 },
  { name: "Let's Go, Eevee!", spriteKey: 'lets-go-pikachu-eevee', themeColor: '#D97706', pokedexId: 26 },
  { name: 'Sword', spriteKey: 'sword-shield', themeColor: '#2563EB', pokedexId: 27 },
  { name: 'Shield', spriteKey: 'sword-shield', themeColor: '#DB2777', pokedexId: 27 },
  { name: 'Brilliant Diamond', spriteKey: 'brilliant-diamond-shining-pearl', themeColor: '#60A5FA', pokedexId: 5 },
  { name: 'Shining Pearl', spriteKey: 'brilliant-diamond-shining-pearl', themeColor: '#F472B6', pokedexId: 5 },
  { name: 'Legends: Arceus', spriteKey: 'legends-arceus', themeColor: '#64748B', pokedexId: 30 },
  { name: 'Scarlet', spriteKey: 'scarlet-violet', themeColor: '#DC2626', pokedexId: 31 },
  { name: 'Violet', spriteKey: 'scarlet-violet', themeColor: '#7C3AED', pokedexId: 31 },
  { name: 'Legends: Z-A', spriteKey: 'legends-za', themeColor: '#6D28D9', pokedexId: 34 },
];

async function main() {
  for (const gameData of franchiseGames) {
    const existing = await prisma.game.findFirst({
      where: { name: gameData.name, type: 'FRANCHISE' },
    });

    if (existing) {
      await prisma.game.update({
        where: { id: existing.id },
        data: {
          spriteKey: gameData.spriteKey,
          themeColor: gameData.themeColor,
          pokedexId: gameData.pokedexId,
        },
      });
      console.log(`Updated ${gameData.name}`);
      continue;
    }

    await prisma.game.create({
      data: {
        name: gameData.name,
        type: 'FRANCHISE',
        themeColor: gameData.themeColor,
        spriteKey: gameData.spriteKey,
        pokedexId: gameData.pokedexId,
        isCurrentlyPlaying: false,
      },
    });
    console.log(`Created ${gameData.name}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
