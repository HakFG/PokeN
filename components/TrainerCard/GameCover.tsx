interface Props {
  name: string;
  themeColor: string;
  bannerUrl: string | null;
}

export default function GameCover({ name, themeColor, bannerUrl }: Props) {
  return (
    <div
      className="trainer-game-cover group relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-white/15 shadow-[0_16px_40px_rgba(0,0,0,.5)]"
      style={{ backgroundColor: themeColor }}
    >
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          draggable={false}
        />
      ) : (
        <span className="relative z-10 px-3 text-center font-display text-sm font-black uppercase tracking-wide text-white/90 drop-shadow-lg md:text-base">
          {name}
        </span>
      )}

      {/* Overlay de profundidade */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/[0.06]"
        aria-hidden="true"
      />

      {/* Shine sweep no hover */}
      <div
        className="trainer-cover-shine pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
    </div>
  );
}