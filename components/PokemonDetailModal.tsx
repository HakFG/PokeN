'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { getPokemon } from '@/lib/pokeapi/client';
import type { PokemonDetail } from '@/lib/pokeapi/types';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';
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

  useEffect(() => {
    setCurrent(initialEntry);
    setNickname(initialEntry.nickname ?? '');
    setLevel(initialEntry.level);
    setIsShiny(initialEntry.isShiny);
  }, [initialEntry]);

  // --- Edit tab state ---
  const [nickname, setNickname] = useState(initialEntry.nickname ?? '');
  const [level, setLevel] = useState(initialEntry.level);
  const [isShiny, setIsShiny] = useState(initialEntry.isShiny);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState(false);

  // --- Transfer tab state ---
  const availableGames = games.filter((g) => g.id !== current.gameId);
  const [targetGameId, setTargetGameId] = useState(availableGames[0]?.id ?? '');
  const [targetBoxNumber, setTargetBoxNumber] = useState(1);
  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

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

  async function handleSave() {
    if (!current.id) {
      setEditError('Não é possível salvar alterações para este Pokémon.');
      return;
    }
    setSaving(true);
    setEditError(null);
    setEditSuccess(false);
    try {
      await updatePokemonHomeAction(current.id, {
        nickname: nickname.trim() === '' ? null : nickname.trim(),
        level,
        isShiny,
        spriteVariant: current.spriteVariant,
      });
      setCurrent((prev) => ({
        ...prev,
        nickname: nickname.trim() === '' ? null : nickname.trim(),
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

  async function handleTransfer() {
    if (!current.id || !targetGameId) return;
    setTransferring(true);
    setTransferError(null);
    setTransferSuccess(null);
    try {
      const result = await transferPokemonGameAction({
        pokemonId: current.id,
        targetGameId,
        targetBoxNumber,
      });
      const targetName = games.find((g) => g.id === targetGameId)?.name ?? 'jogo selecionado';
      const box = (result as { boxNumber?: number } | undefined)?.boxNumber ?? targetBoxNumber;
      const slot = (result as { boxSlot?: number } | undefined)?.boxSlot;
      setTransferSuccess(
        `Transferido com sucesso para ${targetName} • Box ${box}${slot ? ` (Slot ${slot})` : ''}!`
      );
      setCurrent((prev) => ({ ...prev, gameId: targetGameId, boxNumber: box, boxSlot: slot ?? prev.boxSlot }));
      setTimeout(() => onClose(), 1400);
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : 'Não foi possível transferir o Pokémon.');
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
        className="pokemon-modal-overlay fixed inset-0 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.82, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-cyan-300/25 bg-slate-950/90 p-6 text-slate-100"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300/70">
                #{String(current.pokemonId).padStart(3, '0')}
              </p>
              <h2 className="text-2xl font-bold capitalize">
                {current.nickname ?? detail?.name ?? current.name}
              </h2>
              {detail && (
                <p className="text-sm text-cyan-200">
                  {detail.types.map((t) => t.type.name).join(' / ')}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <div className="relative mx-auto my-4 w-40">
            {current.isShiny && (
              <span className="absolute -right-1 -top-1 text-lg text-amber-300">✦</span>
            )}
            <img src={src} alt="" className="w-full object-contain" onError={() => setImgFailed(true)} />
          </div>

          <p className="text-center text-xs text-slate-400">
            Localização atual: <span className="font-semibold text-slate-200">{currentGameName}</span>
            {' • '}Box {current.boxNumber} (Slot {current.boxSlot})
          </p>

          <div className="mt-5 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            <TabButton label="Visão Geral" active={tab === 'view'} onClick={() => setTab('view')} />
            <TabButton label="Editar" active={tab === 'edit'} onClick={() => setTab('edit')} />
            <TabButton label="Transferir" active={tab === 'transfer'} onClick={() => setTab('transfer')} />
          </div>

          <div className="mt-5">
            {tab === 'view' && (
              <div className="space-y-3">
                <InfoRow label="Nível" value={String(current.level)} />
                <InfoRow label="Apelido" value={current.nickname ?? '—'} />
                <InfoRow label="Shiny" value={current.isShiny ? 'Sim ✦' : 'Não'} />
                <InfoRow label="Jogo" value={currentGameName} />
                <InfoRow label="Box / Slot" value={`Box ${current.boxNumber} • Slot ${current.boxSlot}`} />
                {Array.isArray(current.moveset) && (current.moveset as string[]).length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Moveset</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(current.moveset as string[]).map((move, i) => (
                        <span key={i} className="rounded-md bg-white/10 px-2 py-0.5 text-xs capitalize text-slate-200">
                          {move}
                        </span>
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
                    className="w-full accent-cyan-300"
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

                {editError && <p className="text-sm text-rose-300">{editError}</p>}
                {editSuccess && !editError && (
                  <p className="text-sm text-emerald-300">Alterações salvas com sucesso!</p>
                )}

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full rounded-xl border border-cyan-300/50 bg-cyan-300/10 py-2.5 font-bold text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full rounded-xl border border-rose-400/50 bg-rose-400/10 py-2.5 font-bold text-rose-200 transition hover:bg-rose-400/20 disabled:opacity-50"
                >
                  {deleting
                    ? 'Soltando...'
                    : confirmDelete
                    ? 'Confirmar: Soltar Pokémon?'
                    : 'Soltar Pokémon'}
                </button>
                {confirmDelete && !deleting && (
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            )}

            {tab === 'transfer' && (
              <div className="space-y-4">
                {availableGames.length === 0 ? (
                  <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-400">
                    Não há outros jogos disponíveis para transferência.
                  </p>
                ) : (
                  <>
                    <Field label="Jogo de Destino">
                      <select
                        value={targetGameId}
                        onChange={(e) => setTargetGameId(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
                      >
                        {availableGames.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Box de Destino">
                      <input
                        type="number"
                        min={1}
                        value={targetBoxNumber}
                        onChange={(e) => setTargetBoxNumber(Math.max(1, Number(e.target.value)))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
                      />
                    </Field>

                    {transferError && <p className="text-sm text-rose-300">{transferError}</p>}
                    {transferSuccess && <p className="text-sm text-emerald-300">{transferSuccess}</p>}

                    <button
                      onClick={handleTransfer}
                      disabled={transferring || !targetGameId}
                      className="w-full rounded-xl border border-amber-300/50 bg-amber-300/10 py-2.5 font-bold text-amber-100 transition hover:bg-amber-300/20 disabled:opacity-50"
                    >
                      {transferring ? 'Transferindo...' : 'Transferir para este Jogo'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {tab === 'view' && (
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-xl border border-amber-300/50 bg-amber-300/10 py-2 font-bold text-amber-100"
            >
              Fechar
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
      className={`rounded-lg py-1.5 text-xs font-bold transition ${
        active ? 'bg-cyan-300/20 text-cyan-100' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold capitalize text-slate-100">{value}</span>
    </div>
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