'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

interface CompletedGame {
  id: string;
  name: string;
  themeColor: string;
  bannerUrl: string | null;
  completedAt: Date | null;
}

export default function HallOfFame({ games }: { games: CompletedGame[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="hall-panel">
      <div className="hall-header">
        <span className="hall-title">Hall da Fama</span>
        <span className="hall-count">{games.length} zerado{games.length !== 1 ? 's' : ''}</span>
      </div>

      {games.length === 0 ? (
        <div className="hall-empty">
          <span className="hall-empty-icon">🏆</span>
          <p className="hall-empty-text">
            Nenhum jogo zerado ainda.<br />Continue jogando!
          </p>
        </div>
      ) : (
        <div className="hall-scroll">
          <div className="hall-grid">
            {games.map((game, i) => (
              <motion.div
                key={game.id}
                initial={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
                animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                whileHover={reduceMotion ? undefined : { scale: 1.05, y: -2 }}
              >
                <Link
                  href={`/jogos/${game.id}`}
                  className="hall-trophy"
                  style={{
                    background: game.bannerUrl
                      ? `url(${game.bannerUrl}) center/cover`
                      : `linear-gradient(160deg, ${game.themeColor}55 0%, rgba(15,23,42,0.9) 100%)`,
                    borderColor: game.themeColor,
                  }}
                >
                  <div className="hall-trophy-overlay" />
                  <span className="hall-trophy-badge">🏆</span>
                  <span className="hall-trophy-name">{game.name}</span>
                  {game.completedAt && (
                    <span className="hall-trophy-date">
                      {new Date(game.completedAt).toLocaleDateString('pt-BR', {
                        month: 'short',
                        year: '2-digit',
                      })}
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}