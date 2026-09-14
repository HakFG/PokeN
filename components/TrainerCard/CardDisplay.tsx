import GameCover from './GameCover';
import TrainerSprite from './TrainerSprite';
import PokemonSlot from './PokemonSlot';
import BadgeRow from './BadgeRow';
import TrainerCardFrame from './TrainerCardFrame';
import type { PokemonDetail } from '@/lib/pokeapi/types';

interface Props {
  game: { name: string; themeColor: string; bannerUrl: string | null };
  trainerName: string;
  characterSpriteUrl: string | null;
  showcase: {
    slot: number;
    pokemonId: number;
    nickname: string | null;
    moveset: string[];
  }[];
  badges: {
    id: string;
    name: string;
    iconUrl: string | null;
    earnedAt: Date | string | null;
  }[];
  details: Map<number, PokemonDetail>;
}

export default function CardDisplay({
  game,
  trainerName,
  characterSpriteUrl,
  showcase,
  badges,
  details,
}: Props) {
  const filled = Array.from({ length: 6 }, (_, i) => {
    const slot = i + 1;
    const found = showcase.find((s) => s.slot === slot);
    return found ?? { slot, pokemonId: 0, nickname: null, moveset: [] };
  });

  return (
    <TrainerCardFrame themeColor={game.themeColor} gameName={game.name}>
      <div className="flex h-full w-full flex-col gap-2 md:gap-3">
        {/* Área principal — flex-1 garante que ela se estica sem scroll */}
        <div className="grid min-h-0 flex-1 grid-cols-[0.85fr_2.15fr] gap-2 md:grid-cols-[1fr_3fr] md:gap-3">
          {/* Coluna esquerda: capa + sprite do treinador */}
          <div className="flex min-h-0 flex-col gap-2 md:gap-3">
            <div className="relative min-h-0 flex-1">
              <GameCover {...game} />
            </div>
            <div className="relative min-h-0 flex-1">
              <TrainerSprite
                spriteUrl={characterSpriteUrl}
                trainerName={trainerName}
                themeColor={game.themeColor}
              />
            </div>
          </div>

          {/* Grid de 6 pokémons — 3x2 no desktop, 2x3 no mobile */}
          <div className="grid min-h-0 grid-cols-2 grid-rows-3 gap-2 md:grid-cols-3 md:grid-rows-2 md:gap-3">
            {filled.map((s) => (
              <div key={s.slot} className="min-h-0 min-w-0">
                {s.pokemonId > 0 ? (
                  <PokemonSlot
                    slot={s.slot}
                    pokemonId={s.pokemonId}
                    nickname={s.nickname}
                    moveset={s.moveset}
                    detail={details.get(s.pokemonId) ?? null}
                  />
                ) : (
                  <div className="trainer-slot-empty group relative flex h-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-cyan-300/45 bg-cyan-300/[0.03]">
                    <div className="relative z-10 text-center text-cyan-200/65 transition-transform duration-300 group-hover:scale-110 group-hover:text-cyan-100">
                      <span className="block text-2xl font-light leading-none md:text-3xl">+</span>
                      <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.18em] md:text-[10px]">
                        Slot {s.slot}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Insígnias */}
        <div className="shrink-0">
          <BadgeRow badges={badges} themeColor={game.themeColor} />
        </div>
      </div>
    </TrainerCardFrame>
  );
}