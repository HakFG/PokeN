'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  searchPokemonByName,
  type PokemonSearchResult,
} from '@/lib/pokeapi/client';
import { setFavorite, removeFavorite } from '@/lib/actions/profile';
import { useXpFeedback } from '@/components/Xp/XpFeedbackProvider';

interface CurrentFavorite {
  pokemonId: number;
  name: string | null;
  animatedSpriteUrl: string | null;
}

interface Props {
  slot: number;
  current: CurrentFavorite | null;
  onClose: () => void;
}

export default function FavoriteEditModal({ slot, current, onClose }: Props) {
  const router = useRouter();
  const { showFeedback } = useXpFeedback();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PokemonSearchResult[]>([]);
  const [selected, setSelected] = useState<PokemonSearchResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await searchPokemonByName(query);
      setResults(res);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      const result = await setFavorite(slot, selected.id);
      if (result.ok && result.xp) {
        showFeedback(result.xp, 'Favorito salvo');
      }
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    try {
      await removeFavorite(slot);
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  const preview =
    selected ??
    (current
      ? {
          id: current.pokemonId,
          name: current.name ?? '',
          animatedSpriteUrl: current.animatedSpriteUrl ?? '',
          fallbackSpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${current.pokemonId}.png`,
        }
      : null);

  const modal = (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        className="fav-modal-backdrop"
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="fav-modal"
        >
          <span className="fav-modal-topline" aria-hidden="true" />
          <span className="fav-modal-corner tl" aria-hidden="true" />
          <span className="fav-modal-corner tr" aria-hidden="true" />
          <span className="fav-modal-corner bl" aria-hidden="true" />
          <span className="fav-modal-corner br" aria-hidden="true" />

          <header className="fav-modal-header">
            <div className="fav-modal-header-left">
              <span className="fav-modal-pokeball" aria-hidden="true" />
              <div>
                <span className="fav-modal-header-label">Favorito</span>
                <span className="fav-modal-header-slot">Slot {slot}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="fav-modal-close"
              aria-label="Fechar"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <div className="fav-modal-preview">
            <motion.div
              key={preview?.id ?? 'empty'}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fav-modal-preview-sprite"
            >
              {preview ? (
                <img
                  src={preview.animatedSpriteUrl}
                  alt={preview.name}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      preview.fallbackSpriteUrl;
                  }}
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <span className="fav-modal-preview-empty">?</span>
              )}
            </motion.div>
            <div className="fav-modal-preview-info">
              <span className="fav-modal-preview-label">Selecionado</span>
              {preview ? (
                <>
                  <span className="fav-modal-preview-name">
                    {preview.name}
                  </span>
                  <span className="fav-modal-preview-num">
                    #{String(preview.id).padStart(3, '0')}
                  </span>
                </>
              ) : (
                <span className="fav-modal-preview-none">
                  Nenhum pokémon escolhido
                </span>
              )}
            </div>
          </div>

          <div className="fav-modal-field">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelected(null);
              }}
              placeholder="Digite o nome (ex: char)"
              className="fav-modal-input"
              autoComplete="off"
            />

            {query.length >= 2 && !selected && (
              <div className="fav-modal-results">
                {results.length === 0 ? (
                  <p className="fav-modal-empty">Nada encontrado.</p>
                ) : (
                  results.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelected(r);
                        setQuery(r.name);
                      }}
                      className="fav-modal-result"
                    >
                      <img
                        src={r.animatedSpriteUrl}
                        alt=""
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            r.fallbackSpriteUrl;
                        }}
                        style={{ imageRendering: 'pixelated' }}
                        draggable={false}
                      />
                      <span className="fav-modal-result-name">{r.name}</span>
                      <span className="fav-modal-result-num">
                        #{String(r.id).padStart(3, '0')}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <footer className="fav-modal-footer">
            {current && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={saving}
                className="fav-modal-btn fav-modal-btn-danger"
              >
                Remover
              </button>
            )}
            <div className="fav-modal-footer-right">
              <button
                type="button"
                onClick={onClose}
                className="fav-modal-btn fav-modal-btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !selected}
                className="fav-modal-btn fav-modal-btn-primary"
              >
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
