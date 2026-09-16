'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getPokemon, searchPokemonByName, type PokemonSearchResult } from '@/lib/pokeapi/client';
import type { PokemonDetail } from '@/lib/pokeapi/types';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';
import { addPokemonHomeAction } from '@/lib/actions/pokemon-home';
import type { PokemonGameOption } from './PokemonGrid';
import CyberDropdown from './CyberDropdown';

interface Props {
  games: PokemonGameOption[];
  onClose: () => void;
}

export default function AddPokemonModal({ games, onClose }: Props) {
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>(
    games.length > 0 ? [games[0].id] : []
  );
  const [query, setQuery] = useState('');
  const [nickname, setNickname] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [level, setLevel] = useState(5);
  const [isShiny, setIsShiny] = useState(false);

  const [preview, setPreview] = useState<PokemonDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // Lista de sugestões de autocomplete
  const [suggestions, setSuggestions] = useState<PokemonSearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsContainerRef = useRef<HTMLDivElement>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const gameOptions = useMemo(
    () => games.map((g) => ({ value: g.id, label: g.name })),
    [games]
  );

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        suggestionsContainerRef.current &&
        !suggestionsContainerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Busca sugestões em tempo real conforme o usuário digita + debounced exact lookup
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setPreview(null);
      setPreviewError(false);
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let active = true;

    // Busca rápida de opções parciais
    searchPokemonByName(trimmed).then((results) => {
      if (!active) return;
      setSuggestions(results);
      if (results.length > 0) {
        setShowSuggestions(true);
      }
    });

    // Lookup exato com debounce
    setPreviewLoading(true);
    setPreviewError(false);
    const handle = setTimeout(() => {
      getPokemon(trimmed.toLowerCase())
        .then((detail) => {
          if (!active) return;
          setPreview(detail);
          setImgFailed(false);
          setPreviewError(false);
        })
        .catch(() => {
          if (!active) return;
          setPreview(null);
          setPreviewError(true);
        })
        .finally(() => {
          if (active) setPreviewLoading(false);
        });
    }, 350);

    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [query]);

  function handleSelectSuggestion(item: PokemonSearchResult) {
    setQuery(item.name);
    setShowSuggestions(false);
    setPreviewLoading(true);
    setPreviewError(false);
    getPokemon(item.id)
      .then((detail) => {
        setPreview(detail);
        setImgFailed(false);
      })
      .catch(() => {
        setPreview(null);
        setPreviewError(true);
      })
      .finally(() => setPreviewLoading(false));
  }

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const resolvedPokemonId = preview?.id ?? (Number.isFinite(Number(query)) && query.trim() !== '' ? Number(query) : null);

  const spriteSrc = resolvedPokemonId
    ? imgFailed
      ? getFallbackSprite(resolvedPokemonId, isShiny)
      : getOfficialArtwork(resolvedPokemonId, isShiny)
    : null;

  const canSubmit =
    selectedGameIds.length > 0 &&
    Boolean(resolvedPokemonId) &&
    level >= 1 &&
    level <= 100 &&
    !saving;

  async function handleSubmit() {
    if (!resolvedPokemonId || selectedGameIds.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const primaryGameId = selectedGameIds[0];
      const extraGameIds = selectedGameIds.slice(1);

      await addPokemonHomeAction({
        gameId: primaryGameId,
        extraGameIds,
        pokemonId: resolvedPokemonId,
        nickname: nickname.trim() === '' ? null : nickname.trim(),
        trainerName: trainerName.trim() === '' ? null : trainerName.trim(),
        level,
        isShiny,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível registrar o Pokémon.');
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="pokemon-modal-overlay fixed inset-0 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
        style={{ zIndex: 2147483647 }}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 8 }}
          onClick={(e) => e.stopPropagation()}
          className="pokemon-modal-window pokemon-add-modal-card relative max-h-[90vh] w-full max-w-md overflow-x-hidden overflow-y-auto rounded-3xl border border-amber-400/40 bg-[#0A0616]/98 p-6 text-slate-100 shadow-[0_0_60px_-10px_rgba(251,191,36,0.35),0_25px_70px_rgba(0,0,0,0.95)]"
        >
          {/* Header Pokédex */}
          <div className="pokemon-modal-header flex items-start justify-between border-b border-white/10 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3 items-center justify-center rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]">
                  <span className="h-1 w-1 rounded-full bg-white" />
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#10b981]" />
                <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300/90">
                  POKÉDEX // NOVO ESPÉCIME
                </p>
              </div>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(251,191,36,0.2)]">
                Registrar Pokémon
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="pokemon-modal-close flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-slate-400 hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-amber-200 transition"
            >
              ✕
            </button>
          </div>

          {/* Baia de Pré-visualização Holográfica */}
          <div className="pokemon-modal-preview relative my-4 flex h-36 items-center justify-center overflow-hidden rounded-2xl border border-amber-400/20 bg-black/50 shadow-inner">
            {/* Linhas de Radar Holográfico de Fundo */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
              viewBox="0 0 200 120"
              preserveAspectRatio="none"
            >
              <circle cx="100" cy="60" r="50" fill="none" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="100" cy="60" r="30" fill="none" stroke="#FBBF24" strokeWidth="0.8" />
              <line x1="0" y1="60" x2="200" y2="60" stroke="#FBBF24" strokeWidth="0.5" />
              <line x1="100" y1="0" x2="100" y2="120" stroke="#FBBF24" strokeWidth="0.5" />
            </svg>

            {previewLoading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400/30 border-t-amber-400" />
                <span className="font-mono text-[10px] text-amber-300/80 animate-pulse tracking-wider">
                  LOCALIZANDO DADOS NA POKÉDEX...
                </span>
              </div>
            ) : spriteSrc ? (
              <div className="pokemon-modal-sprite-wrap relative z-10 flex flex-col items-center">
                {isShiny && (
                  <span className="pokemon-modal-shiny-indicator absolute -right-3 -top-2 text-xl text-amber-300">✦</span>
                )}
                <img
                  src={spriteSrc}
                  alt=""
                  className="pokemon-modal-sprite h-24 object-contain transition-transform duration-300 hover:scale-110 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                  onError={() => setImgFailed(true)}
                />
                {preview && (
                  <span className="mt-1 rounded-full border border-amber-400/50 bg-amber-400/20 px-3 py-0.5 font-mono text-[10px] font-black capitalize text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                    #{String(preview.id).padStart(3, '0')} {preview.name}
                  </span>
                )}
              </div>
            ) : suggestions.length > 0 ? (
              <div className="text-center px-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-400/20 px-3 py-1 font-mono text-xs font-bold text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                  <span className="h-2 w-2 animate-ping rounded-full bg-amber-400" />
                  <span>{suggestions.length} ESPÉCIMES ENCONTRADOS</span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-slate-400">
                  Selecione uma opção na lista abaixo
                </p>
              </div>
            ) : (
              <div className="text-center px-4">
                <p className="font-mono text-xs font-bold text-slate-300">
                  {previewError && query.trim().length > 0 ? (
                    <span className="text-rose-400">⚠️ Espécime não encontrado</span>
                  ) : (
                    'DIGITE O NOME OU NÚMERO DA ESPÉCIE'
                  )}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-slate-500">Ex: 25, pi, charmander, mewtwo</p>
              </div>
            )}
          </div>

          <div className="pokemon-modal-form space-y-3.5">
            <Field label="Jogos de Destino">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>
                    {selectedGameIds.length} {selectedGameIds.length === 1 ? 'jogo selecionado' : 'jogos selecionados'}
                  </span>
                  <span className="text-amber-400/80 font-bold">Mínimo 1 jogo</span>
                </div>
                {games.length === 0 ? (
                  <p className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-slate-400">
                    Nenhum jogo cadastrado.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {games.map((g) => {
                      const isChecked = selectedGameIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              if (selectedGameIds.length <= 1) return; // manter ao menos 1
                              setSelectedGameIds((prev) => prev.filter((id) => id !== g.id));
                            } else {
                              setSelectedGameIds((prev) => [...prev, g.id]);
                            }
                          }}
                          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            isChecked
                              ? 'border-amber-400/80 bg-amber-400/15 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                              : 'border-white/10 bg-[#080B18]/90 text-slate-400 hover:border-white/20 hover:text-slate-200'
                          }`}
                        >
                          <span className="truncate pr-2 text-left">{g.name}</span>
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border font-mono text-[10px] ${
                              isChecked
                                ? 'border-amber-400 bg-amber-400 text-black font-black'
                                : 'border-white/20 bg-white/5 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Field>

            {/* Campo de Busca com Autocomplete e Dropdown de Opções */}
            <Field label="Número ou Nome da Espécie">
              <div ref={suggestionsContainerRef} className="relative">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder="Ex: 25, pi ou pikachu"
                    className="pokemon-modal-input w-full rounded-xl border border-white/10 bg-[#080B18]/90 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-amber-400 focus:bg-[#0e1428] focus:shadow-[0_0_18px_rgba(251,191,36,0.3)]"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setPreview(null);
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Popover Flutuante de Sugestões de Espécimes */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 4, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-56 overflow-y-auto rounded-xl border border-amber-400/50 bg-[#060410]/98 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(251,191,36,0.25)] backdrop-blur-2xl scrollbar-thin"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(251,191,36,0.5) rgba(15,23,42,0.8)',
                      }}
                    >
                      <div className="mb-1 flex items-center justify-between border-b border-white/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                        <span>Opções Pokédex</span>
                        <span>{suggestions.length} encontrados</span>
                      </div>
                      <div className="space-y-0.5">
                        {suggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectSuggestion(item)}
                            className="group flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-all hover:bg-amber-400/20 hover:border-amber-400/40"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={item.iconUrl}
                                alt=""
                                className="h-7 w-7 object-contain transition-transform group-hover:scale-125"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div>
                                <span className="mr-2 font-mono text-[11px] font-bold text-amber-400/90">
                                  #{String(item.id).padStart(3, '0')}
                                </span>
                                <span className="text-xs font-black capitalize text-slate-100 group-hover:text-amber-200">
                                  {item.name}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono text-[10px] font-bold text-slate-400 transition-colors group-hover:text-amber-300">
                              Selecionar ↵
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Field>

            <Field label="Apelido (opcional)">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Sem apelido"
                className="pokemon-modal-input w-full rounded-xl border border-white/10 bg-[#080B18]/90 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-amber-400 focus:shadow-[0_0_16px_rgba(251,191,36,0.25)]"
              />
            </Field>

            <Field label="Nome do Treinador (opcional)">
              <input
                type="text"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
                placeholder="Ex: Red, Ash, etc."
                className="pokemon-modal-input w-full rounded-xl border border-white/10 bg-[#080B18]/90 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-amber-400 focus:shadow-[0_0_16px_rgba(251,191,36,0.25)]"
              />
            </Field>

            <Field label="Nível Inicial">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs text-slate-400">
                  <span>Nv. 1</span>
                  <span className="rounded bg-amber-400/20 px-2 py-0.5 font-bold text-amber-200 border border-amber-400/40">
                    Lv. {level}
                  </span>
                  <span>Nv. 100</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="pokemon-modal-slider w-full"
                />
              </div>
            </Field>

            <button
              type="button"
              onClick={() => setIsShiny((v) => !v)}
              className={`group relative flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
                isShiny
                  ? 'border-amber-400/80 bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-amber-500/25 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.35)] ring-1 ring-amber-300/40'
                  : 'border-white/10 bg-[#080B18]/90 text-slate-300 hover:border-amber-400/40 hover:text-amber-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`text-sm ${isShiny ? 'text-amber-300 drop-shadow-[0_0_6px_#fbbf24]' : 'text-slate-500'}`}>
                  ✦
                </span>
                <span>Variante Shiny (Brilhante)</span>
              </span>
              <span
                className={`rounded px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider border ${
                  isShiny
                    ? 'border-amber-400/60 bg-amber-400/30 text-amber-200'
                    : 'border-white/10 bg-white/5 text-slate-500'
                }`}
              >
                {isShiny ? 'ATIVADA' : 'DESATIVADA'}
              </span>
            </button>

            {error && <p className="text-sm font-semibold text-rose-300">{error}</p>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="pokemon-modal-submit-btn group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-amber-400/70 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-500/30 py-3 text-xs font-black tracking-wider uppercase text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-200 hover:border-amber-300 hover:shadow-[0_0_36px_rgba(251,191,36,0.55)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/30 border border-amber-300/60 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-transform duration-200 group-hover:scale-115">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span>{saving ? 'Registrando Espécime...' : 'Registrar Espécime'}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="pokemon-modal-field block space-y-1">
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      {children}
    </label>
  );
}