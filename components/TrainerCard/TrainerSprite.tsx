'use client';

import { useState } from 'react';

interface Props {
  spriteUrl: string | null;
  trainerName: string;
  themeColor: string;
}

export default function TrainerSprite({ spriteUrl, trainerName, themeColor }: Props) {
  const [hasError, setHasError] = useState(false);

  const showImage = Boolean(spriteUrl && !hasError);

  return (
    <div
      className="trainer-sprite-panel relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-white/15 p-2 shadow-[0_16px_40px_rgba(0,0,0,.5)] md:p-3"
      style={{ backgroundColor: themeColor }}
    >
      {/* Brilho interno tipo spotlight */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_78%,rgba(255,255,255,0.32),transparent_62%)]"
        aria-hidden="true"
      />

      {/* Nome do treinador */}
      <span className="relative z-10 mb-1 max-w-full truncate px-1 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/95 drop-shadow md:text-[11px]">
        {trainerName}
      </span>

      {/* Frame circular com sprite */}
      <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
        {showImage ? (
          <>
            {/* Halo atrás do sprite */}
            <div className="trainer-sprite-halo absolute inset-0 m-auto" aria-hidden="true" />
            <img
              src={spriteUrl!}
              alt={trainerName}
              onError={() => setHasError(true)}
              className="relative z-10 max-h-full w-auto object-contain [image-rendering:pixelated] drop-shadow-[0_14px_26px_rgba(0,0,0,.6)]"
              draggable={false}
            />
          </>
        ) : (
          <div className="flex h-[72%] max-h-[120px] w-[72%] max-w-[120px] items-center justify-center rounded-full border-2 border-dashed border-white/45 bg-black/25">
            <span className="px-2 text-center text-[9px] font-bold uppercase tracking-[0.15em] text-white/70 md:text-[10px]">
              Sem sprite
            </span>
          </div>
        )}
      </div>
    </div>
  );
}