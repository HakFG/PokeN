import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DIRECT_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const VARIANTS = ['dream-world', 'official-artwork'] as const;

async function main() {
  const all = await prisma.ownedPokemon.findMany({
    where: { spriteVariant: null },
  });

  for (const pokemon of all) {
    const variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    await prisma.ownedPokemon.update({
      where: { id: pokemon.id },
      data: { spriteVariant: variant },
    });
    console.log(`✓ ${pokemon.id} → ${variant}`);
  }

  console.log(`Total: ${all.length}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
