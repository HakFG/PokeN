'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import PokedexCard from './PokedexCard';
import type { PokedexSpecies } from '@/lib/pokeapi/server-pokedex';

interface Props {
  species: PokedexSpecies[];
  ownedIds: Set<string>;
  pokedexDescription: string;
  onSpeciesClick: (species: PokedexSpecies) => void;
}

const PAGE_SIZE = 30;

export default function PokedexPanel({
  species,
  ownedIds,
  pokedexDescription,
  onSpeciesClick,
}: Props) {
  const [page, setPage] = useState(0);
  const reduceMotion = useReducedMotion();
  const totalPages = Math.max(1, Math.ceil(species.length / PAGE_SIZE));
  const slice = species.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const speciesKey = (item: PokedexSpecies) => item.fakeSpeciesId ? `fake:${item.fakeSpeciesId}` : `pokemon:${item.id}`;
  function goTo(next: number) {
    setPage(Math.max(0, Math.min(totalPages - 1, next)));
  }

  return (
    <div className="pokedex-panel">
      {/* Header: título + região */}
      <div className="pokedex-panel-header">
        <h2 className="pokedex-panel-title">POKEDEX</h2>
        <span className="pokedex-panel-region">{pokedexDescription}</span>
      </div>

      {/* Scroll com chips */}
      <div className="pokedex-panel-scroll">
        <div className="pokedex-panel-grid">
          {slice.map((item, i) => (
            <motion.div
              key={item.id}
              initial={reduceMotion ? undefined : { opacity: 0, y: 6, scale: 0.94 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.28,
                delay: i * 0.006,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <PokedexCard
                id={speciesKey(item)}
                pokemonId={item.id}
                entryNumber={item.entryNumber}
                name={item.name}
                owned={ownedIds.has(speciesKey(item))}
                spriteUrl={item.spriteUrl}
                onClick={() => onSpeciesClick(item)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Paginação */}
      <div className="pokedex-panel-pagination">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page === 0}
          className="pokedex-nav-btn"
          aria-label="Página anterior"
        >
          ‹ Anterior
        </button>
        <span className="pokedex-nav-page">
          {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages - 1}
          className="pokedex-nav-btn"
          aria-label="Próxima página"
        >
          Próxima ›
        </button>
      </div>
    </div>
  );
}
