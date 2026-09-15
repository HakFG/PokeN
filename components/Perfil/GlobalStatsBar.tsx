'use client';

import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

interface Props {
  uniquePokemonCount: number;
  totalShiny: number;
  totalBadges: number;
  gamesCompleted: number;
  gamesInProgress: number;
}

const STAT_CONFIG = [
  { key: 'uniquePokemonCount', label: 'Únicos',   icon: '◎',  color: '#22d3ee' },
  { key: 'totalShiny',         label: 'Shinies',  icon: '✦',  color: '#fbbf24' },
  { key: 'totalBadges',        label: 'Insígnias', icon: '◈', color: '#a78bfa' },
  { key: 'gamesCompleted',     label: 'Zerados',  icon: '★',  color: '#f472b6' },
  { key: 'gamesInProgress',    label: 'Jogando',  icon: '▶',  color: '#34d399' },
] as const;

export default function GlobalStatsBar(props: Props) {
  return (
    <div className="stats-bar">
      <div className="stats-bar-header">
        <span className="stats-bar-title">Estatísticas</span>
        <span className="stats-bar-sub">Visão geral</span>
      </div>
      <div className="stats-bar-grid">
        {STAT_CONFIG.map((cfg, i) => (
          <motion.div
            key={cfg.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
            className="stat-item"
            style={{ ['--accent' as string]: cfg.color }}
          >
            <span className="stat-item-icon">{cfg.icon}</span>
            <AnimatedNumber value={props[cfg.key]} className="stat-item-value" />
            <span className="stat-item-label">{cfg.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}