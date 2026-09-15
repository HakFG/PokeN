'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { getPokemonList } from '@/lib/pokeapi/client';
import { createOwnedPokemon } from '@/lib/actions/living-dex';
import { useXpFeedback } from '@/components/Xp/XpFeedbackProvider';
import type { PokedexSpecies } from '@/lib/pokeapi/server-pokedex';
import { getOfficialArtwork } from '@/lib/pokeapi/sprite-variants';

interface Props {
  gameId: string;
  boxNumber: number;
  boxSlot: number;
  isHackRoom: boolean;
  initialSpecies: PokedexSpecies | null;
  fakeSpecies?: { id: string; name: string; spriteUrl: string | null }[];
  onClose: () => void;
  onSaved?: () => void;
}

interface SpeciesLite {
  id: number;
  name: string;
  fakeSpeciesId?: string;
  spriteUrl?: string | null;
}

export default function AddPokemonModal({
  gameId,
  boxNumber,
  boxSlot,
  isHackRoom,
  initialSpecies,
  fakeSpecies = [],
  onClose,
  onSaved,
}: Props) {
  const { showFeedback } = useXpFeedback();
  const reduceMotion = useReducedMotion();
  const [allSpecies, setAllSpecies] = useState<SpeciesLite[]>([]);
  const [query, setQuery] = useState(initialSpecies?.name ?? '');
  const [selected, setSelected] = useState<SpeciesLite | null>(
    initialSpecies
      ? { id: initialSpecies.id, name: initialSpecies.name }
      : null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isShiny, setIsShiny] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Necessário para o React Portal: só renderiza depois de montar no cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Carrega a lista de espécies uma vez
  useEffect(() => {
    let isMounted = true;
    getPokemonList()
      .then((res) => {
        if (!isMounted) return;
        const list = res.results
          .map((r) => ({
            id: Number(r.url.split('/').filter(Boolean).pop()),
            name: r.name,
          }))
          .filter((s) => s.id > 0 && s.id <= 1025);
        setAllSpecies(list);
      })
      .catch(() => {
        if (isMounted) setAllSpecies([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Bloqueia o scroll do body enquanto o modal estiver aberto
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Fecha com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Autofocus no input
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    if (query.trim().length < 2 || selected) return [];
    const q = query.toLowerCase().trim();
    const native = allSpecies.filter((s) => s.name.includes(q));
    const fakes = isHackRoom ? fakeSpecies.filter((s) => s.name.toLowerCase().includes(q)).map((s) => ({ id: 0, name: s.name, fakeSpeciesId: s.id, spriteUrl: s.spriteUrl })) : [];
    return [...fakes, ...native].slice(0, 12);
  }, [allSpecies, query, selected, fakeSpecies, isHackRoom]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) {
      setError('Escolha uma espécie primeiro');
      return;
    }
    setSaving(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('pokemonId', String(selected.id));
    if (selected.fakeSpeciesId) formData.set('fakeSpeciesId', selected.fakeSpeciesId);
    formData.set('gameId', gameId);
    formData.set('boxNumber', String(boxNumber));
    formData.set('boxSlot', String(boxSlot));
    try {
      const result = await createOwnedPokemon(formData);
      if (result.ok && result.xp) {
        showFeedback(result.xp, `${selected.name} adicionado`);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
      setSaving(false);
    }
  }

  const artwork = selected ? (selected.spriteUrl || (selected.id > 0 ? getOfficialArtwork(selected.id, isShiny) : null)) : null;

  // Não renderiza nada no SSR (evita erro de hydration com o portal)
  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="add-pokemon-backdrop"
      >
        <motion.div
          key="modal"
          initial={reduceMotion ? undefined : { opacity: 0, y: 32, scale: 0.94 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="add-pokemon-modal"
        >
          {/* Linhas decorativas */}
          <span className="add-pokemon-modal-corner tl" aria-hidden="true" />
          <span className="add-pokemon-modal-corner tr" aria-hidden="true" />
          <span className="add-pokemon-modal-corner bl" aria-hidden="true" />
          <span className="add-pokemon-modal-corner br" aria-hidden="true" />
          <div className="add-pokemon-modal-topline" aria-hidden="true" />

          {/* Header */}
          <header className="add-pokemon-header">
            <div className="add-pokemon-header-left">
              <span className="add-pokemon-pokeball" aria-hidden="true" />
              <div className="add-pokemon-header-text">
                <span className="add-pokemon-header-label">Adicionar à Living Dex</span>
                <span className="add-pokemon-header-slot">
                  Box {String(boxNumber).padStart(2, '0')} · Slot {String(boxSlot).padStart(2, '0')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="add-pokemon-close"
              aria-label="Fechar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          {/* Corpo com scroll */}
          <form onSubmit={handleSubmit} className="add-pokemon-form">
            <div className="add-pokemon-scroll">
              {/* Preview do pokémon selecionado */}
              <div className="add-pokemon-preview">
                <div className="add-pokemon-preview-sprite">
                  {artwork ? (
                    <motion.img
                      key={artwork}
                      src={artwork}
                      alt={selected?.name ?? ''}
                      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.7 }}
                      animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      draggable={false}
                    />
                  ) : (
                    <span className="add-pokemon-preview-empty">?</span>
                  )}
                </div>
                <div className="add-pokemon-preview-info">
                  <span className="add-pokemon-preview-label">Selecionado</span>
                  {selected ? (
                    <>
                      <span className="add-pokemon-preview-name">{selected.name}</span>
                      <span className="add-pokemon-preview-number">
                        #{String(selected.id).padStart(3, '0')}
                      </span>
                    </>
                  ) : (
                    <span className="add-pokemon-preview-none">
                      Nenhum pokémon escolhido
                    </span>
                  )}
                </div>
              </div>

              {/* Campo de busca com autocomplete */}
              <div className="add-pokemon-field">
                <label className="add-pokemon-label" htmlFor="pokemon-search">
                  <span className="add-pokemon-label-dot" aria-hidden="true" />
                  Espécie *
                </label>
                <div className="add-pokemon-search-wrap">
                  <input
                    ref={inputRef}
                    id="pokemon-search"
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setSelected(null);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    autoComplete="off"
                    placeholder="Digite pelo menos 2 letras (ex: char)"
                    className="add-pokemon-input"
                  />
                  {selected && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(null);
                        setQuery('');
                        inputRef.current?.focus();
                      }}
                      className="add-pokemon-clear"
                      aria-label="Limpar"
                    >
                      ✕
                    </button>
                  )}

                  {/* Dropdown de sugestões */}
                  <AnimatePresence>
                    {showSuggestions && filtered.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="add-pokemon-suggestions"
                      >
                        {filtered.map((s) => (
                          <li key={s.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelected(s);
                                setQuery(s.name);
                                setShowSuggestions(false);
                              }}
                              className="add-pokemon-suggestion"
                            >
                              <img
                                src={s.spriteUrl || getOfficialArtwork(s.id)}
                                alt=""
                                className="add-pokemon-suggestion-sprite"
                                draggable={false}
                              />
                              <span className="add-pokemon-suggestion-name">{s.name}</span>
                              <span className="add-pokemon-suggestion-num">
                                {s.fakeSpeciesId ? 'FAKE' : `#${String(s.id).padStart(3, '0')}`}
                              </span>
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Nível + Nickname */}
              <div className="add-pokemon-row">
                <div className="add-pokemon-field">
                  <label className="add-pokemon-label" htmlFor="level">
                    <span className="add-pokemon-label-dot" aria-hidden="true" />
                    Nível *
                  </label>
                  <input
                    id="level"
                    name="level"
                    type="number"
                    min={1}
                    max={100}
                    defaultValue={5}
                    required
                    className="add-pokemon-input"
                  />
                </div>
                <div className="add-pokemon-field">
                  <label className="add-pokemon-label" htmlFor="nickname">
                    <span className="add-pokemon-label-dot" aria-hidden="true" />
                    Apelido
                  </label>
                  <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    placeholder="Opcional"
                    className="add-pokemon-input"
                  />
                </div>
              </div>

              {/* Shiny */}
              <label className="add-pokemon-checkbox">
                <input
                  name="isShiny"
                  type="checkbox"
                  checked={isShiny}
                  onChange={(e) => setIsShiny(e.target.checked)}
                />
                <span className="add-pokemon-checkbox-mark" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="add-pokemon-checkbox-label">Shiny</span>
                <span className="add-pokemon-checkbox-star" aria-hidden="true">★</span>
              </label>

              {/* Sprite custom (hack room) */}
              {isHackRoom && (
                <div className="add-pokemon-field">
                  <label className="add-pokemon-label" htmlFor="sprite">
                    <span className="add-pokemon-label-dot" aria-hidden="true" />
                    Sprite customizado
                  </label>
                  <input
                    id="sprite"
                    name="sprite"
                    type="file"
                    accept="image/*"
                    className="add-pokemon-file"
                  />
                  <p className="add-pokemon-hint">
                    Salvo no bucket e aplicado nesta hack room.
                  </p>
                </div>
              )}

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="add-pokemon-error"
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* Footer */}
            <footer className="add-pokemon-footer">
              <button
                type="button"
                onClick={onClose}
                className="add-pokemon-btn add-pokemon-btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !selected}
                className="add-pokemon-btn add-pokemon-btn-primary"
              >
                {saving ? (
                  <>
                    <span className="add-pokemon-spinner" aria-hidden="true" />
                    Adicionando…
                  </>
                ) : (
                  'Adicionar'
                )}
              </button>
            </footer>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Teleporta o modal para o body, fora de qualquer stacking context do layout
  return createPortal(modalContent, document.body);
}
