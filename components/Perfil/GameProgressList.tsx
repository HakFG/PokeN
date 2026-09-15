'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface GameProgress {
  id: string;
  name: string;
  themeColor: string;
  percent: number;
  isDexComplete: boolean;
}

export default function GameProgressList({ games }: { games: GameProgress[] }) {
  const sorted = [...games]
    .filter((g) => g.percent > 0)
    .sort((a, b) => b.percent - a.percent);

  return (
    <div className="progress-panel">
      <div className="progress-header">
        <span className="progress-title">Progresso da Dex</span>
        <span className="progress-count">{sorted.length} jogos</span>
      </div>

      {sorted.length === 0 ? (
        <div className="progress-empty">
          <p>Adicione pokémons em algum jogo<br />para ver o progresso aqui.</p>
        </div>
      ) : (
        <div className="progress-scroll">
          {sorted.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Link href={`/jogos/${game.id}/living-dex`} className="progress-row">
                <span className="progress-row-name">
                  {game.name}
                  {game.isDexComplete && <span className="progress-row-star">★</span>}
                </span>
                <div className="progress-row-track">
                  <motion.div
                    className="progress-row-fill"
                    style={{
                      background: `linear-gradient(90deg, ${game.themeColor}, ${game.themeColor}aa)`,
                      boxShadow: `0 0 8px ${game.themeColor}88`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${game.percent}%` }}
                    transition={{ delay: 0.3 + i * 0.04, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <span className="progress-row-pct">{game.percent}%</span>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}