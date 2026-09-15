'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getPokemon } from '@/lib/pokeapi/client';
import type { PokemonDetail } from '@/lib/pokeapi/types';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';
import { addPokemonHomeAction } from '@/lib/actions/pokemon-home';
import type { PokemonGameOption } from './PokemonGrid';

interface Props {
  games: PokemonGameOption[];
  onClose: () => void;
}

export default function AddPokemonModal({ games, onClose }: Props) {
  const [gameId, setGameId] = useState(games[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [nickname, setNickname] = useState('');
  const [level, setLevel] = useState(5);
  const [isShiny, setIsShiny] = useState(false);

  const [preview, setPreview] = useState<PokemonDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Debounced lookup so the preview updates as the user types a Dex number or a name.
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setPreview(null);
      setPreviewError(false);
      return;
    }
    setPreviewLoading(true);
    setPreviewError(false);
    const handle = setTimeout(() => {
      getPokemon(trimmed.toLowerCase())
        .then((detail) => {
          setPreview(detail);
          setImgFailed(false);
        })
        .catch(() => {
          setPreview(null);
          setPreviewError(true);
        })
        .finally(() => setPreviewLoading(false));
    }, 350);
    return () => clearTimeout(handle);
  }, [query]);

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

  const canSubmit = Boolean(gameId) && Boolean(resolvedPokemonId) && level >= 1 && level <= 100 && !saving;

  async function handleSubmit() {
    if (!resolvedPokemonId || !gameId) return;
    setSaving(true);
    setError(null);
    try {
      await addPokemonHomeAction({
        gameId,
        pokemonId: resolvedPokemonId,
        nickname: nickname.trim() === '' ? null : nickname.trim(),
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
        className="pokemon-modal-overlay fixed inset-0 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
        style={{ zIndex: 2147483647 }}
      >
        <motion.div
          initial={{ scale: 0.82, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-amber-300/25 bg-slate-950/90 p-6 text-slate-100"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-300/70">
                Novo Espécime
              </p>
              <h2 className="text-2xl font-bold">Registrar Pokémon</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="my-4 flex h-32 items-center justify-center">
            {previewLoading ? (
              <div className="h-16 w-16 animate-pulse rounded-full bg-white/10" />
            ) : spriteSrc ? (
              <div className="relative">
                {isShiny && (
                  <span className="absolute -right-1 -top-1 text-lg text-amber-300">✦</span>
                )}
                <img
                  src={spriteSrc}
                  alt=""
                  className="w-28 object-contain"
                  onError={() => setImgFailed(true)}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                {previewError ? 'Espécie não encontrada.' : 'Digite um número ou nome para pré-visualizar.'}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <Field label="Jogo de Destino">
              <select
                value={gameId}
                onChange={(e) => setGameId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
              >
                {games.length === 0 && <option value="">Nenhum jogo disponível</option>}
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Número ou Nome da Espécie">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: 25 ou pikachu"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/50"
              />
            </Field>

            <Field label="Apelido (opcional)">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Sem apelido"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/50"
              />
            </Field>

            <Field label={`Nível (${level})`}>
              <input
                type="range"
                min={1}
                max={100}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className="w-full accent-amber-300"
              />
            </Field>

            <button
              type="button"
              onClick={() => setIsShiny((v) => !v)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                isShiny
                  ? 'border-amber-300/60 bg-amber-300/15 text-amber-100'
                  : 'border-white/10 bg-white/5 text-slate-300'
              }`}
            >
              <span>✦ Forma Shiny</span>
              <span>{isShiny ? 'Ativada' : 'Desativada'}</span>
            </button>

            {error && <p className="text-sm text-rose-300">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full rounded-xl border border-amber-300/50 bg-amber-300/10 py-2.5 font-bold text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Registrando...' : 'Registrar Espécime'}
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
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      {children}
    </label>
  );
}