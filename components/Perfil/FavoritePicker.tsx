'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPokemonList } from '@/lib/pokeapi/client';
import { setFavorite } from '@/lib/actions/profile';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';

interface Props {
  slot: number;
  onClose: () => void;
  onSaved: () => void;
}

interface SpeciesLite {
  id: number;
  name: string;
}

export default function FavoritePicker({ slot, onClose, onSaved }: Props) {
  const [allSpecies, setAllSpecies] = useState<SpeciesLite[]>([]);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPokemonList().then((response) => {
      setAllSpecies(
        response.results
          .map((item) => ({
            id: Number(item.url.split('/').filter(Boolean).pop()),
            name: item.name,
          }))
          .filter((item) => item.id > 0 && item.id <= 1025),
      );
    });
  }, []);

  const filtered = query.length >= 2
    ? allSpecies.filter((item) => item.name.includes(query.toLowerCase())).slice(0, 12)
    : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(event) => event.stopPropagation()}
          className="bg-white rounded-2xl p-6 max-w-md w-full"
        >
          <h2 className="text-lg font-bold mb-4">Favorito - Slot {slot}</h2>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Digite pelo menos 2 letras"
            className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            autoFocus
          />

          {filtered.length > 0 && (
            <ul className="mt-3 max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
              {filtered.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      await setFavorite(slot, item.id);
                      onSaved();
                      onClose();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-100 text-left disabled:opacity-50"
                  >
                    <img
                      src={getOfficialArtwork(item.id)}
                      alt={item.name}
                      className="w-7 h-7 object-contain"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackSprite(item.id);
                      }}
                    />
                    <span className="capitalize text-sm">{item.name}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">#{String(item.id).padStart(3, '0')}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-end mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-200 font-bold hover:bg-slate-300">Cancelar</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
