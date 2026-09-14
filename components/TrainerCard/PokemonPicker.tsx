'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getPokemonList } from '@/lib/pokeapi/client';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';

interface Props {
  onSelect: (pokemonId: number, name: string) => void;
  onClose: () => void;
}

interface Species {
  id: number;
  name: string;
}

export default function PokemonPicker({ onSelect, onClose }: Props) {
  const [all, setAll] = useState<Species[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getPokemonList()
      .then((res) => {
        if (!mounted) return;
        const list = res.results
          .map((r) => ({
            id: Number(r.url.split('/').filter(Boolean).pop()),
            name: r.name,
          }))
          .filter((s) => s.id > 0 && s.id <= 1025);
        setAll(list);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return all.filter((s) => s.name.includes(q)).slice(0, 24);
  }, [all, query]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-30 flex flex-col gap-2 rounded-2xl border border-cyan-300/25 bg-slate-950/98 p-3 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200">
          Escolher Pokémon
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-white/15 px-2 py-0.5 text-[10px] font-bold text-white/70 hover:bg-white/10"
        >
          Fechar
        </button>
      </div>

      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Digite pelo menos 2 letras (ex: char)"
        className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-3 py-1.5 text-xs text-white placeholder:text-white/35 focus:border-cyan-300/60 focus:outline-none"
      />

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-white/5 bg-slate-900/40">
        {loading && (
          <p className="p-3 text-center text-[10px] text-white/40">Carregando Pokédex…</p>
        )}
        {!loading && query.trim().length < 2 && (
          <p className="p-3 text-center text-[10px] text-white/40">
            Digite para buscar.
          </p>
        )}
        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <p className="p-3 text-center text-[10px] text-white/40">
            Nada encontrado.
          </p>
        )}
        {results.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id, s.name)}
            className="flex w-full items-center gap-2 border-b border-white/5 px-3 py-1.5 text-left transition-colors last:border-b-0 hover:bg-cyan-300/10"
          >
            <img
              src={getOfficialArtwork(s.id)}
              alt=""
              className="h-7 w-7 object-contain"
              onError={(e) => {
                e.currentTarget.src = getFallbackSprite(s.id);
              }}
            />
            <span className="flex-1 text-xs font-bold capitalize text-white/90">{s.name}</span>
            <span className="font-mono text-[10px] text-white/40">
              #{String(s.id).padStart(3, '0')}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}