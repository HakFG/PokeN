'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getPokemon } from '@/lib/pokeapi/client';
import type { PokemonDetail } from '@/lib/pokeapi/types';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';
import { TYPE_COLORS } from '@/lib/pokemon-types';
import CyberDropdown, { type CyberDropdownOption } from './CyberDropdown';
import {
  updatePokemonHomeAction,
  deletePokemonHomeAction,
  transferPokemonGameAction,
} from '@/lib/actions/pokemon-home';
import type { PokemonGridEntry, PokemonGameOption } from './PokemonGrid';

export interface EntryPokemonDetailModalProps {
  entry: PokemonGridEntry;
  games?: PokemonGameOption[];
  onClose: () => void;
}

export interface LegacyPokemonDetailModalProps {
  pokemonId: number;
  nickname?: string | null;
  trainerName?: string | null;
  level?: number;
  moveset?: unknown;
  isShiny?: boolean;
  id?: string;
  gameId?: string;
  boxNumber?: number;
  boxSlot?: number;
  games?: PokemonGameOption[];
  onClose: () => void;
}

export type PokemonDetailModalProps = EntryPokemonDetailModalProps | LegacyPokemonDetailModalProps;

type Tab = 'view' | 'edit' | 'transfer';

export default function PokemonDetailModal(props: PokemonDetailModalProps) {
  const { onClose, games = [] } = props;

  const initialEntry: PokemonGridEntry = useMemo(() => {
    if ('entry' in props && props.entry) {
      return props.entry;
    }
    const legacy = props as LegacyPokemonDetailModalProps;
    return {
      id: legacy.id ?? '',
      gameId: legacy.gameId ?? '',
      boxNumber: legacy.boxNumber ?? 1,
      boxSlot: legacy.boxSlot ?? 1,
      pokemonId: legacy.pokemonId,
      nickname: legacy.nickname ?? null,
      trainerName: legacy.trainerName ?? null,
      name: legacy.nickname ?? `#${legacy.pokemonId}`,
      level: legacy.level ?? 1,
      moveset: legacy.moveset ?? null,
      isShiny: legacy.isShiny ?? false,
      typeNames: [],
      typeName: '',
      typeColor: '#22D3EE',
      spriteUrl: null,
      spriteVariant: null,
    };
  }, [props]);

  const [tab, setTab] = useState<Tab>('view');
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  // Local mirror of the entry so the modal reflects edits/transfers immediately
  // while the server action revalidates the page in the background.
  const [current, setCurrent] = useState<PokemonGridEntry>(initialEntry);

  const initialGameIds = useMemo(() => {
    return initialEntry.gameIds && initialEntry.gameIds.length > 0
      ? initialEntry.gameIds
      : [initialEntry.gameId];
  }, [initialEntry]);

  // --- Edit tab state ---
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>(initialGameIds);
  const [nickname, setNickname] = useState(initialEntry.nickname ?? '');
  const [trainerName, setTrainerName] = useState(initialEntry.trainerName ?? '');
  const [level, setLevel] = useState(initialEntry.level);
  const [isShiny, setIsShiny] = useState(initialEntry.isShiny);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    setCurrent(initialEntry);
    const gIds =
      initialEntry.gameIds && initialEntry.gameIds.length > 0
        ? initialEntry.gameIds
        : [initialEntry.gameId];
    setSelectedGameIds(gIds);
    setNickname(initialEntry.nickname ?? '');
    setTrainerName(initialEntry.trainerName ?? '');
    setLevel(initialEntry.level);
    setIsShiny(initialEntry.isShiny);
  }, [initialEntry]);

  // --- Transfer / Enviar tab state ---
  const currentAssignedIds = useMemo(() => {
    return new Set(
      current.gameIds && current.gameIds.length > 0 ? current.gameIds : [current.gameId]
    );
  }, [current.gameIds, current.gameId]);

  const availableGames = useMemo(() => {
    return games.filter((g) => !currentAssignedIds.has(g.id));
  }, [games, currentAssignedIds]);

  const [targetGameId, setTargetGameId] = useState(availableGames[0]?.id ?? '');
  const [targetBoxNumber, setTargetBoxNumber] = useState(1);
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (availableGames.length > 0 && (!targetGameId || !availableGames.some((g) => g.id === targetGameId))) {
      setTargetGameId(availableGames[0].id);
    }
  }, [availableGames, targetGameId]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    getPokemon(current.pokemonId).then(setDetail).catch(() => {});
  }, [current.pokemonId]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const src = imgFailed
    ? getFallbackSprite(current.pokemonId, isShiny)
    : getOfficialArtwork(current.pokemonId, isShiny);

  const currentGameName =
    games.find((g) => g.id === current.gameId)?.name ?? current.gameId;

  const allAssignedGames = useMemo(() => {
    const ids = current.gameIds && current.gameIds.length > 0 ? current.gameIds : [current.gameId];
    return ids.map((id) => games.find((g) => g.id === id)?.name ?? id);
  }, [current.gameIds, current.gameId, games]);

  const targetGameOptions: CyberDropdownOption[] = useMemo(() => {
    return availableGames.map((g) => ({
      value: g.id,
      label: g.name,
    }));
  }, [availableGames]);

  async function handleSave() {
    if (!current.id) {
      setEditError('Não é possível salvar alterações para este Pokémon.');
      return;
    }
    if (selectedGameIds.length === 0) {
      setEditError('Selecione pelo menos um jogo para manter o Pokémon.');
      return;
    }
    setSaving(true);
    setEditError(null);
    setEditSuccess(false);
    try {
      const primaryGameId = selectedGameIds.includes(current.gameId)
        ? current.gameId
        : selectedGameIds[0];
      const extraGameIds = selectedGameIds.filter((id) => id !== primaryGameId);

      await updatePokemonHomeAction(current.id, {
        gameId: primaryGameId,
        extraGameIds,
        nickname: nickname.trim() === '' ? null : nickname.trim(),
        trainerName: trainerName.trim() === '' ? null : trainerName.trim(),
        level,
        isShiny,
        spriteVariant: current.spriteVariant,
      });
      setCurrent((prev) => ({
        ...prev,
        gameId: primaryGameId,
        gameIds: selectedGameIds,
        gameNames: selectedGameIds.map((id) => games.find((g) => g.id === id)?.name ?? id),
        nickname: nickname.trim() === '' ? null : nickname.trim(),
        trainerName: trainerName.trim() === '' ? null : trainerName.trim(),
        level,
        isShiny,
      }));
      setEditSuccess(true);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Não foi possível salvar as alterações.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!current.id) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deletePokemonHomeAction(current.id);
      onClose();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Não foi possível soltar o Pokémon.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleTransfer(mode: 'link' | 'move' = 'link') {
    if (!current.id || !targetGameId) return;
    setTransferring(true);
    setTransferError(null);
    setTransferSuccess(null);
    try {
      const result = await transferPokemonGameAction({
        pokemonId: current.id,
        targetGameId,
        targetBoxNumber,
        mode,
      });
      const targetName = games.find((g) => g.id === targetGameId)?.name ?? 'jogo selecionado';
      const box = (result as { targetBox?: number; boxNumber?: number } | undefined)?.targetBox ?? targetBoxNumber;
      const slot = (result as { targetSlot?: number; boxSlot?: number } | undefined)?.targetSlot;

      if (mode === 'link') {
        const nextGameIds = Array.from(new Set([...(current.gameIds || [current.gameId]), targetGameId]));
        setTransferSuccess(
          `Enviado com sucesso para a Living Dex de ${targetName}! O espécime agora está ativo em ambos os jogos.`
        );
        setCurrent((prev) => ({
          ...prev,
          gameIds: nextGameIds,
          gameNames: nextGameIds.map((id) => games.find((g) => g.id === id)?.name ?? id),
        }));
      } else {
        const nextGameIds = [targetGameId, ...(current.gameIds || []).filter((id) => id !== current.gameId && id !== targetGameId)];
        setTransferSuccess(
          `Transferido com sucesso para ${targetName} • Box ${box}${slot ? ` (Slot ${slot})` : ''}!`
        );
        setCurrent((prev) => ({
          ...prev,
          gameId: targetGameId,
          gameIds: nextGameIds,
          gameNames: nextGameIds.map((id) => games.find((g) => g.id === id)?.name ?? id),
          boxNumber: box,
          boxSlot: slot ?? prev.boxSlot,
        }));
      }
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : 'Não foi possível enviar o Pokémon.');
    } finally {
      setTransferring(false);
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
        className="pokemon-modal-overlay fixed inset-0 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md"
        style={{ zIndex: 2147483647 }}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="pokemon-modal-window pokemon-detail-modal-card relative max-h-[90vh] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-3xl border border-cyan-400/30 bg-[#090514]/95 p-6 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(34,211,238,0.15)]"
        >
          {/* Pokédex Top Sensor Bar */}
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500/80" />
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono text-[10px] font-bold tracking-wider text-cyan-400/80">
                POKÉDEX // DIAGNÓSTICO
              </span>
            </div>
            <button
              onClick={onClose}
              className="pokemon-modal-close flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-slate-400 transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Header with Title & Authentic Type Badges */}
          <div className="pokemon-modal-header flex items-start justify-between">
            <div>
              <p className="font-mono text-xs font-bold tracking-wider text-cyan-400/80">
                #{String(current.pokemonId).padStart(3, '0')}
              </p>
              <h2 className="pokemon-modal-title text-2xl font-black capitalize tracking-tight text-white drop-shadow-[0_2px_10px_rgba(34,211,238,0.2)]">
                {current.nickname ?? detail?.name ?? current.name}
              </h2>
              {detail && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {detail.types.map((t) => {
                    const color = TYPE_COLORS[t.type.name.toLowerCase()] || '#22D3EE';
                    return (
                      <span
                        key={t.type.name}
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                        style={{
                          backgroundColor: `${color}25`,
                          borderColor: `${color}80`,
                          boxShadow: `0 0 10px ${color}30`,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
                        />
                        {t.type.name}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Holographic Radar Sprite Chamber */}
          <div className="relative mx-auto my-4 flex h-48 w-48 items-center justify-center">
            {/* Holographic Radar Background */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="absolute h-40 w-40 animate-pulse rounded-full border border-cyan-500/20 bg-radial from-cyan-500/10 via-transparent to-transparent" />
              <div className="absolute h-32 w-32 rounded-full border border-dashed border-cyan-400/25" />
              <div className="absolute h-20 w-20 rounded-full border border-cyan-400/30" />
              <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 200 200">
                <line x1="100" y1="10" x2="100" y2="190" stroke="#22D3EE" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="#22D3EE" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#22D3EE" strokeWidth="0.75" strokeDasharray="2 4" />
              </svg>
              {/* Pedestal beam glow under sprite */}
              <div className="absolute -bottom-2 h-5 w-32 rounded-full bg-cyan-400/25 blur-md" />
            </div>

            {current.isShiny && (
              <motion.span
                animate={{ scale: [1, 1.15, 1], opacity: [0.9, 1, 0.9] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="absolute right-1 top-2 z-20 flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-400/20 px-2 py-0.5 font-mono text-[10px] font-black text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.5)] backdrop-blur-sm"
              >
                ✦ SHINY
              </motion.span>
            )}

            <motion.img
              src={src}
              alt=""
              className="pokemon-modal-sprite relative z-10 h-36 w-36 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
              onError={() => setImgFailed(true)}
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
            />
          </div>

          {/* Pokédex Location readout */}
          <div className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-center font-mono text-[11px] text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22D3EE]" />
            <span className="font-semibold text-slate-100">{currentGameName}</span>
            <span className="text-white/20">•</span>
            <span className="font-bold text-cyan-300">Box {current.boxNumber}</span>
            <span className="text-white/20">•</span>
            <span className="text-slate-400">Slot {current.boxSlot}</span>
          </div>

          {/* Pokédex Mode Tabs with Framer Motion Sliding Pill */}
          <div className="pokemon-modal-tabs relative mt-5 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/50 p-1">
            <TabButton label="Visão Geral" active={tab === 'view'} onClick={() => setTab('view')} />
            <TabButton label="Editar" active={tab === 'edit'} onClick={() => setTab('edit')} />
            <TabButton label="Enviar / Transferir" active={tab === 'transfer'} onClick={() => setTab('transfer')} />
          </div>

          <div className="pokemon-modal-body mt-5">
            {tab === 'view' && (
              <div className="space-y-3">
                {/* Level Spec with Progress Bar */}
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-cyan-400/30">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      [NÍVEL REGISTRADO]
                    </span>
                    <span className="font-mono text-sm font-black text-cyan-300">
                      Lv. {current.level} <span className="text-[10px] text-slate-500">/ 100</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-black/50 p-0.5 border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.max(1, current.level))}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                    />
                  </div>
                </div>

                <InfoRow label="[APELIDO]" value={current.nickname ?? '—'} />
                <InfoRow label="[TREINADOR ORIGINAL]" value={current.trainerName ?? '—'} />
                
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm transition hover:border-cyan-400/30">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">[FORMA / VARIANTE]</span>
                  <span className={`font-semibold flex items-center gap-1.5 ${current.isShiny ? 'text-amber-300' : 'text-slate-200'}`}>
                    {current.isShiny ? '✦ Shiny (Brilhante)' : 'Comum'}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm transition hover:border-cyan-400/30">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      [JOGOS VINCULADOS]
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-cyan-300">
                      {allAssignedGames.length} {allAssignedGames.length === 1 ? 'cartucho' : 'cartuchos'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allAssignedGames.map((gName, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-950/40 px-2.5 py-1 text-xs font-semibold text-cyan-200 shadow-sm"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22D3EE]" />
                        {gName}
                      </span>
                    ))}
                  </div>
                </div>
                <InfoRow label="[ARMAZENAMENTO ORIGEM]" value={`Box ${current.boxNumber} • Slot ${current.boxSlot}`} />

                {Array.isArray(current.moveset) && (current.moveset as string[]).length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm">
                    <p className="mb-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      [MOVESET CONHECIDO]
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {(current.moveset as string[]).map((move, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs capitalize text-slate-200"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_#22D3EE]" />
                          <span className="truncate">{move}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'edit' && (
              <div className="space-y-4">
                <Field label="Apelido">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Sem apelido"
                    className="pokemon-modal-input w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:bg-black/60 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  />
                </Field>

                <Field label="Nome do Treinador">
                  <input
                    type="text"
                    value={trainerName}
                    onChange={(e) => setTrainerName(e.target.value)}
                    placeholder="Ex: Red, Ash, etc."
                    className="pokemon-modal-input w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400/60 focus:bg-black/60 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  />
                </Field>

                <Field label="Jogos Vinculados">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>{selectedGameIds.length} selecionado(s)</span>
                      <span className="text-cyan-400/80 font-bold">Mínimo 1 jogo</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {games.map((g) => {
                        const isChecked = selectedGameIds.includes(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                if (selectedGameIds.length <= 1) return;
                                setSelectedGameIds((prev) => prev.filter((id) => id !== g.id));
                              } else {
                                setSelectedGameIds((prev) => [...prev, g.id]);
                              }
                            }}
                            className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                              isChecked
                                ? 'border-cyan-400/80 bg-cyan-950/50 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                                : 'border-white/10 bg-black/40 text-slate-400 hover:border-white/20 hover:text-slate-200'
                            }`}
                          >
                            <span className="truncate pr-2 text-left">{g.name}</span>
                            <span
                              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border font-mono text-[10px] ${
                                isChecked
                                  ? 'border-cyan-400 bg-cyan-400 text-black font-bold'
                                  : 'border-white/20 bg-white/5 text-transparent'
                              }`}
                            >
                              ✓
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Field>

                <Field label="Nível do Pokémon">
                  <div className="space-y-2 rounded-xl border border-white/10 bg-black/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-400">Status de Nível</span>
                      <span className="rounded-md border border-cyan-400/40 bg-cyan-400/10 px-2 py-0.5 font-mono text-xs font-black text-cyan-300">
                        Lv. {level}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={level}
                      onChange={(e) => setLevel(Number(e.target.value))}
                      className="pokemon-modal-slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-cyan-400"
                    />
                  </div>
                </Field>

                <button
                  type="button"
                  onClick={() => setIsShiny((v) => !v)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-bold transition ${
                    isShiny
                      ? 'border-amber-400/60 bg-amber-400/15 text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.25)]'
                      : 'border-white/10 bg-black/40 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={isShiny ? 'text-amber-300 animate-spin' : 'text-slate-500'}>✦</span>
                    Forma Shiny (Brilhante)
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider">
                    {isShiny ? '[ ATIVADA ]' : '[ DESATIVADA ]'}
                  </span>
                </button>

                {editError && <p className="text-sm font-semibold text-rose-400">{editError}</p>}
                {editSuccess && !editError && (
                  <p className="text-sm font-semibold text-emerald-400">Alterações salvas com sucesso!</p>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="relative w-full overflow-hidden rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-500/25 to-blue-600/25 py-3 font-bold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)] transition hover:from-cyan-500/40 hover:to-blue-600/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] disabled:opacity-50"
                >
                  {saving ? 'Gravando no Banco...' : 'Salvar Alterações'}
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full rounded-xl border border-rose-500/40 bg-rose-500/10 py-2.5 font-bold text-rose-300 transition hover:bg-rose-500/20 hover:border-rose-500/70 disabled:opacity-50"
                >
                  {deleting
                    ? 'Soltando Espécime...'
                    : confirmDelete
                    ? 'Confirmar: Soltar para Natureza?'
                    : 'Soltar Pokémon'}
                </button>
                {confirmDelete && !deleting && (
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="w-full text-center font-mono text-xs text-slate-400 transition hover:text-slate-200"
                  >
                    [ Cancelar ]
                  </button>
                )}
              </div>
            )}

            {tab === 'transfer' && (
              <div className="space-y-4">
                {availableGames.length === 0 ? (
                  <p className="rounded-xl border border-white/10 bg-black/40 p-4 text-center text-sm text-slate-400">
                    Este Pokémon já está vinculado e presente na Living Dex de todos os jogos cadastrados.
                  </p>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                        Jogo de Destino
                      </span>
                      <CyberDropdown
                        value={targetGameId}
                        onChange={setTargetGameId}
                        options={targetGameOptions}
                        placeholder="Selecione o jogo de destino"
                        theme="cyan"
                      />
                    </div>

                    <div className="rounded-xl border border-cyan-400/20 bg-cyan-950/30 p-3 text-xs text-slate-300">
                      <p className="font-semibold text-cyan-200 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22D3EE]" />
                        Sincronização com a Living Dex
                      </p>
                      <p className="mt-1 text-slate-400 leading-relaxed">
                        Ao enviar, o Pokémon passará a constar na Living Dex do jogo selecionado e continuará sendo uma única entidade no seu Home sem se duplicar.
                      </p>
                    </div>

                    {transferError && <p className="text-sm font-semibold text-rose-400">{transferError}</p>}
                    {transferSuccess && <p className="text-sm font-semibold text-emerald-400">{transferSuccess}</p>}

                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleTransfer('link')}
                        disabled={transferring || !targetGameId}
                        className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-cyan-400/70 bg-gradient-to-r from-cyan-500/30 via-blue-500/20 to-cyan-500/30 py-3 text-xs font-black uppercase tracking-wider text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.3)] transition hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] disabled:opacity-50"
                      >
                        <span>{transferring ? 'Enviando...' : 'Enviar para Living Dex (Vincular)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTransfer('move')}
                        disabled={transferring || !targetGameId}
                        className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 font-mono text-[11px] font-semibold text-slate-400 hover:border-amber-400/40 hover:text-amber-200 transition disabled:opacity-50"
                      >
                        Mover Origem Definitivamente
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {tab === 'view' && (
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl border border-cyan-400/40 bg-cyan-400/10 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-cyan-200 transition hover:bg-cyan-400/20 hover:border-cyan-400/70"
            >
              [ Fechar Terminal ]
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-lg py-2 text-xs font-bold transition-colors ${
        active ? 'text-cyan-200' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {active && (
        <motion.div
          layoutId="detailActiveTab"
          className="absolute inset-0 rounded-lg border border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-[0_0_12px_rgba(34,211,238,0.2)]"
          transition={{ type: 'spring', stiffness: 450, damping: 32 }}
        />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="pokemon-modal-info-row flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm transition hover:border-cyan-400/30">
      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className="font-semibold capitalize text-slate-100">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="pokemon-modal-field block space-y-1.5">
      <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      {children}
    </label>
  );
}