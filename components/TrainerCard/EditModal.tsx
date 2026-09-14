'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRAINER_PRESETS } from '@/lib/presets/trainers';
import {
  updateTrainerInfo,
  updateShowcase,
  renameBadge,
  toggleBadgeEarned,
} from '@/lib/actions/trainer-card';
import PokemonPicker from './PokemonPicker';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';

type Tab = 'trainer' | 'team' | 'badges';

interface ShowcaseSlot {
  slot: number;
  pokemonId: number;
  nickname: string | null;
  moveset: string[];
}

interface BadgeData {
  id: string;
  name: string;
  iconUrl: string | null;
  earnedAt: Date | string | null;
}

interface Props {
  gameId: string;
  trainerCardId: string;
  initialName: string;
  initialSpriteUrl: string | null;
  initialShowcase: ShowcaseSlot[];
  initialBadges: BadgeData[];
  onClose: () => void;
}

interface TeamState {
  slot: number;
  pokemonId: number | null;
  pokemonName: string;
  nickname: string;
  moveset: string;
}

export default function EditModal({
  trainerCardId,
  initialName,
  initialSpriteUrl,
  initialShowcase,
  initialBadges,
  onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>('trainer');
  const [saving, setSaving] = useState(false);

  // Treinador
  const [name, setName] = useState(initialName);
  const [spriteUrl, setSpriteUrl] = useState(initialSpriteUrl);

  // Time — 6 slots
  const [team, setTeam] = useState<TeamState[]>(() => {
    const arr: TeamState[] = [];
    for (let i = 1; i <= 6; i++) {
      const found = initialShowcase.find((s) => s.slot === i);
      arr.push({
        slot: i,
        pokemonId: found?.pokemonId ?? null,
        pokemonName: '',
        nickname: found?.nickname ?? '',
        moveset: (found?.moveset ?? []).join(', '),
      });
    }
    return arr;
  });

  const [pickerSlot, setPickerSlot] = useState<number | null>(null);

  // Insígnias
  const [badges, setBadges] = useState<BadgeData[]>(initialBadges);

  async function handleSave() {
    setSaving(true);
    try {
      await updateTrainerInfo(trainerCardId, {
        trainerName: name.trim() || 'Hak',
        characterSpriteUrl: spriteUrl,
      });

      const filled = team
        .filter((s) => s.pokemonId !== null)
        .map((s) => ({
          slot: s.slot,
          pokemonId: s.pokemonId!,
          nickname: s.nickname.trim() || null,
          moveset: s.moveset
            .split(',')
            .map((m) => m.trim())
            .filter(Boolean)
            .slice(0, 4),
        }));

      await updateShowcase(trainerCardId, filled);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleBadgeToggle(b: BadgeData) {
    const next = !b.earnedAt;
    await toggleBadgeEarned(b.id, next);
    setBadges((prev) =>
      prev.map((x) =>
        x.id === b.id ? { ...x, earnedAt: next ? new Date().toISOString() : null } : x,
      ),
    );
  }

  async function handleBadgeRename(b: BadgeData, newName: string) {
    if (!newName.trim() || newName === b.name) return;
    await renameBadge(b.id, newName.trim());
    setBadges((prev) =>
      prev.map((x) => (x.id === b.id ? { ...x, name: newName.trim() } : x)),
    );
  }

return (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md md:p-6"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[92vh] w-full max-w-[860px] flex-col overflow-hidden rounded-3xl border border-amber-300/25 bg-slate-950 shadow-[0_40px_120px_rgba(0,0,0,0.9),0_0_60px_rgba(251,191,36,0.12)]"
      >
          {/* Linha superior dourada */}
          <div className="pointer-events-none absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent" />

          {/* Header */}
          <header className="flex shrink-0 items-center justify-between gap-3 px-5 pt-5 pb-3">
            <h2 className="font-display text-sm font-black uppercase tracking-[0.24em] text-amber-100">
              Editar Trainer Card
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/40 hover:text-white"
              aria-label="Fechar"
            >
              ✕
            </button>
          </header>

          {/* Tabs */}
          <nav className="flex shrink-0 gap-1 border-b border-white/8 px-3">
            {(
              [
                ['trainer', 'Treinador'],
                ['team', 'Time'],
                ['badges', 'Insígnias'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`relative px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  tab === key ? 'text-amber-100' : 'text-white/45 hover:text-white/75'
                }`}
              >
                {label}
                {tab === key && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-1 -bottom-px h-[2px] rounded-full bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.7)]"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Conteúdo */}
          <div className="relative min-h-0 flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {tab === 'trainer' && (
                <motion.div
                  key="trainer"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div>
                    <label className="mb-1.5 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
                      Nome do treinador
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/12 bg-slate-900/70 px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
                      Sprite do treinador
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {TRAINER_PRESETS.map((p) => (
                        <SpriteTile
                          key={p.id}
                          preset={p}
                          selected={spriteUrl === p.spriteUrl}
                          onSelect={() => setSpriteUrl(p.spriteUrl)}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {tab === 'team' && (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="mb-3 text-[10px] italic text-white/45">
                    Monte seu time de até 6 pokémons. Máximo de 4 moves por pokémon.
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {team.map((s, idx) => (
                      <div
                        key={s.slot}
                        className="relative min-h-[180px] rounded-2xl border border-white/10 bg-slate-900/50 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-display text-[9px] font-bold uppercase tracking-[0.22em] text-amber-200/80">
                            Slot {s.slot}
                          </span>
                          {s.pokemonId !== null && (
                            <button
                              type="button"
                              onClick={() =>
                                setTeam((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? { ...x, pokemonId: null, pokemonName: '', nickname: '', moveset: '' }
                                      : x,
                                  ),
                                )
                              }
                              className="rounded-md border border-red-400/30 px-1.5 py-0.5 text-[9px] font-bold text-red-300/80 hover:bg-red-500/10"
                            >
                              Remover
                            </button>
                          )}
                        </div>

                        {s.pokemonId === null ? (
                          <button
                            type="button"
                            onClick={() => setPickerSlot(s.slot)}
                            className="flex h-[110px] w-full items-center justify-center rounded-xl border border-dashed border-cyan-300/35 bg-cyan-300/[0.03] text-cyan-200/70 transition hover:border-cyan-300/70 hover:bg-cyan-300/[0.08]"
                          >
                            <span className="text-2xl font-light leading-none">+</span>
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={getOfficialArtwork(s.pokemonId)}
                                alt=""
                                className="h-12 w-12 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = getFallbackSprite(s.pokemonId!);
                                }}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold capitalize text-white">
                                  {s.pokemonName || `#${s.pokemonId}`}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => setPickerSlot(s.slot)}
                                  className="text-[9px] font-bold uppercase tracking-wider text-cyan-300/80 hover:text-cyan-200"
                                >
                                  Trocar
                                </button>
                              </div>
                            </div>
                            <input
                              placeholder="Apelido (opcional)"
                              value={s.nickname}
                              onChange={(e) =>
                                setTeam((prev) =>
                                  prev.map((x, i) =>
                                    i === idx ? { ...x, nickname: e.target.value } : x,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:border-cyan-300/50 focus:outline-none"
                            />
                            <input
                              placeholder="Moves (separe por vírgula, até 4)"
                              value={s.moveset}
                              onChange={(e) =>
                                setTeam((prev) =>
                                  prev.map((x, i) =>
                                    i === idx ? { ...x, moveset: e.target.value } : x,
                                  ),
                                )
                              }
                              className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:border-cyan-300/50 focus:outline-none"
                            />
                          </div>
                        )}

                        {/* Picker dentro do slot */}
                        <AnimatePresence>
                          {pickerSlot === s.slot && (
                            <PokemonPicker
                              onSelect={(id, pname) => {
                                setTeam((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? { ...x, pokemonId: id, pokemonName: pname }
                                      : x,
                                  ),
                                );
                                setPickerSlot(null);
                              }}
                              onClose={() => setPickerSlot(null)}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === 'badges' && (
                <motion.div
                  key="badges"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="mb-3 text-[10px] italic text-white/45">
                    Renomeie suas insígnias e marque as que você já conquistou. A alteração é salva na hora.
                  </p>
                  <ul className="space-y-2">
                    {badges.map((b, i) => {
                      const earned = !!b.earnedAt;
                      return (
                        <li
                          key={b.id}
                          className={`flex items-center gap-3 rounded-xl border p-2.5 transition-colors ${
                            earned
                              ? 'border-amber-300/40 bg-amber-300/[0.06]'
                              : 'border-white/8 bg-slate-900/40'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleBadgeToggle(b)}
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                              earned
                                ? 'border-amber-300 bg-gradient-to-br from-amber-200 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                                : 'border-white/20 bg-slate-800'
                            }`}
                            aria-label={earned ? 'Desmarcar' : 'Marcar como conquistada'}
                          >
                            {earned ? (
                              <svg
                                viewBox="0 0 24 24"
                                width="14"
                                height="14"
                                fill="none"
                                stroke="rgba(35,25,0,0.9)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <span className="font-display text-[10px] font-black text-white/45">
                                {i + 1}
                              </span>
                            )}
                          </button>

                          <input
                            defaultValue={b.name}
                            onBlur={(e) => handleBadgeRename(b, e.target.value)}
                            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/60 px-2.5 py-1.5 text-xs font-bold text-white focus:border-amber-300/50 focus:outline-none"
                          />

                          {earned && (
                            <span className="hidden shrink-0 text-[9px] font-bold uppercase tracking-wider text-amber-200/80 sm:inline">
                              {new Date(b.earnedAt!).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-white/8 bg-slate-950/80 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/15 px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 transition hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl border border-amber-300/50 bg-gradient-to-br from-amber-300 to-amber-500 px-4 py-2 font-display text-[10px] font-black uppercase tracking-[0.18em] text-slate-900 shadow-[0_0_18px_rgba(251,191,36,0.4)] transition hover:brightness-110 disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- Tile de sprite do treinador, com fallback ---------- */
function SpriteTile({
  preset,
  selected,
  onSelect,
}: {
  preset: { id: string; label: string; spriteUrl: string };
  selected: boolean;
  onSelect: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const initials = preset.label
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex flex-col items-center gap-1 rounded-xl border-2 p-2 transition-all ${
        selected
          ? 'border-amber-300 bg-amber-300/10 shadow-[0_0_14px_rgba(251,191,36,0.35)]'
          : 'border-white/10 hover:border-white/30 hover:bg-white/5'
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-slate-900/80">
        {failed ? (
          <span className="font-display text-sm font-black text-cyan-200">{initials}</span>
        ) : (
          <img
            src={preset.spriteUrl}
            alt={preset.label}
            onError={() => setFailed(true)}
            className="h-full w-full object-contain [image-rendering:pixelated]"
          />
        )}
      </div>
      <span className="text-center text-[9px] font-bold uppercase tracking-wider text-white/70 group-hover:text-white">
        {preset.label}
      </span>
    </button>
  );
}