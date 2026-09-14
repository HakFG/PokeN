'use client';

const POINTS = [
  [6, 14], [14, 32], [23, 11], [31, 26], [39, 8], [48, 20], [57, 12], [67, 28], [77, 10], [89, 23],
  [4, 52], [16, 64], [27, 47], [36, 61], [46, 45], [55, 67], [64, 51], [74, 63], [84, 46], [95, 59],
  [9, 82], [20, 93], [32, 76], [43, 88], [53, 78], [63, 94], [72, 80], [82, 91], [91, 76], [97, 91],
] as const;

const LINKS = POINTS.flatMap(([x, y], index) =>
  POINTS.slice(index + 1).flatMap(([otherX, otherY], otherIndex) => {
    const distance = Math.hypot(x - otherX, y - otherY);
    return distance < 23
      ? [{ from: index, to: index + otherIndex + 1 }]
      : [];
  }),
);

export default function PokemonConstellation() {
  return (
    <div className="pokemon-constellation" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {LINKS.map((link, index) => {
          const [x1, y1] = POINTS[link.from];
          const [x2, y2] = POINTS[link.to];
          return (
            <line
              key={`${link.from}-${link.to}`}
              className="constellation-link"
              style={{ animationDelay: `${(index % 9) * -0.45}s` }}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            />
          );
        })}
        {POINTS.map(([x, y], index) => (
          <circle
            key={`${x}-${y}`}
            className={`constellation-point ${index % 10 < 3 ? 'constellation-point-gold' : ''}`}
            style={{
              transformOrigin: `${x}% ${y}%`,
              animationDelay: `${(index % 8) * -0.65}s`,
              animationDuration: `${4 + (index % 4) * 0.7}s`,
            }}
            cx={x}
            cy={y}
            r={index % 5 === 0 ? 0.42 : 0.28}
          />
        ))}
      </svg>
      <span className="falling-star falling-star-one" />
      <span className="falling-star falling-star-two" />
    </div>
  );
}
