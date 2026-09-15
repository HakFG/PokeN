'use client';

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TRAINER_PRESETS } from '@/lib/presets/trainers';
import {
  updateTrainerInfo,
  uploadTrainerSprite,
  updateShowcase,
  renameBadge,
  toggleBadgeEarned,
} from '@/lib/actions/trainer-card';
import PokemonPicker from './PokemonPicker';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';
import { useXpFeedback } from '@/components/Xp/XpFeedbackProvider';
import { updateGameProgress, type GameProgressState } from '@/lib/actions/game-progress';

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
  initialTrainerPresetId: string | null;
  initialPlaytime: string | null;
  initialGameStatus: 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
  initialIsCurrentlyPlaying: boolean;
  initialStartedAt: Date | string | null;
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
  gameId,
  trainerCardId,
  initialName,
  initialSpriteUrl,
  initialTrainerPresetId,
  initialPlaytime,
  initialGameStatus,
  initialIsCurrentlyPlaying,
  initialStartedAt,
  initialShowcase,
  initialBadges,
  onClose,
}: Props) {
  const { showFeedback } = useXpFeedback();
  const [tab, setTab] = useState<Tab>('trainer');
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Treinador
  const [name, setName] = useState(initialName);
  const [spriteUrl, setSpriteUrl] = useState(initialSpriteUrl);
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(initialTrainerPresetId);
  const [spriteStatus, setSpriteStatus] = useState<string | null>(null);
  const spriteInputRef = useRef<HTMLInputElement>(null);
  const [playtime, setPlaytime] = useState(initialPlaytime ?? '');
  const [gameProgress, setGameProgress] = useState<GameProgressState>(
    initialGameStatus === 'COMPLETED'
      ? 'COMPLETED'
      : initialGameStatus === 'DROPPED'
        ? 'DROPPED'
        : initialStartedAt
          ? 'IN_PROGRESS'
          : 'NOT_STARTED',
  );
  const [currentlyPlaying, setCurrentlyPlaying] = useState(initialIsCurrentlyPlaying);

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
        trainerPresetId: selectedTrainer,
        playtime: playtime.trim() || null,
      });
      await updateGameProgress(gameId, gameProgress, currentlyPlaying);

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
    const result = await toggleBadgeEarned(b.id, next);
    if (result.ok && result.xp) {
      showFeedback(result.xp, `${b.name} conquistada`);
    }
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

  function handleSpriteUpload(file: File | undefined) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSpriteStatus('A imagem deve ter no máximo 2MB.');
      return;
    }
    setSpriteStatus('Carregando imagem...');
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSpriteUrl(base64);
      setSpriteStatus('Sprite carregado! Clique em Salvar para confirmar.');
    };
    reader.onerror = () => {
      setSpriteStatus('Erro ao ler a imagem.');
    };
    reader.readAsDataURL(file);
  }

if (!mounted) return null;

  const modalContent = (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ zIndex: 9999 }} className="fixed inset-0 flex items-center justify-center bg-black/90 p-3 backdrop-blur-md md:p-6"
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
                    <label
                      className="mb-1.5 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80"
                      htmlFor="playtime"
                    >
                      Playtime
                    </label>
                    <input
                      id="playtime"
                      name="playtime"
                      type="text"
                      placeholder="ex: 42h 30min"
                      value={playtime}
                      onChange={(e) => setPlaytime(e.target.value)}
                      className="w-full rounded-xl border border-white/12 bg-slate-900/70 px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                    />
                  </div>

                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[.04] p-3">
                    <label className="block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80" htmlFor="game-progress">
                      Progresso do jogo
                    </label>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <select
                        id="game-progress"
                        value={gameProgress}
                        onChange={(event) => {
                          const next = event.target.value as GameProgressState;
                          setGameProgress(next);
                          if (next !== 'IN_PROGRESS') setCurrentlyPlaying(false);
                        }}
                        className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-cyan-300/60 focus:outline-none"
                      >
                        <option value="NOT_STARTED">Não iniciado</option>
                        <option value="IN_PROGRESS">Em progresso</option>
                        <option value="COMPLETED">Concluído</option>
                        <option value="DROPPED">Pausado</option>
                      </select>
                      <label className="flex items-center gap-2 text-xs font-semibold text-white/80">
                        <input type="checkbox" checked={currentlyPlaying} disabled={gameProgress !== 'IN_PROGRESS'} onChange={(event) => setCurrentlyPlaying(event.target.checked)} className="h-4 w-4 accent-cyan-300" />
                        Estou jogando este jogo agora
                      </label>
                    </div>
                    <p className="mt-2 text-[11px] text-white/45">Ao salvar, as datas de início e conclusão são registradas automaticamente.</p>
                  </div>

                  <div>
                    <label className="mb-2 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">
                      Sprite do treinador
                    </label>
                    <p className="mb-3 text-xs text-white/55">Escolha um protagonista e envie seu PNG, WEBP ou GIF. A imagem fica salva como URL na sua Trainer Card.</p>
                    <input ref={spriteInputRef} type="file" accept="image/png,image/webp,image/gif,image/jpeg" className="sr-only" onChange={(event) => void handleSpriteUpload(event.target.files?.[0])} />
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => spriteInputRef.current?.click()} className="rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-100 hover:bg-cyan-300/20">Enviar sprite do computador</button>
                      {spriteUrl && <button type="button" onClick={() => { setSpriteUrl(null); setSelectedTrainer(null); setSpriteStatus('Sprite removido. Salve para confirmar.'); }} className="rounded-xl border border-red-300/25 px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-red-200 hover:bg-red-400/10">Remover sprite</button>}
                      {spriteStatus && <span className="text-xs text-cyan-100">{spriteStatus}</span>}
                    </div>

                    <div className="mb-3">
                      <label className="mb-1 block font-display text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-200/80">
                        Ou cole o link direto da imagem (URL da web / PNG / GIF / WEBP):
                      </label>
                      <input
                        type="url"
                        placeholder="https://exemplo.com/sprite.png ou /images/..."
                        value={spriteUrl && !spriteUrl.startsWith('data:') ? spriteUrl : ''}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          setSpriteUrl(val || null);
                          setSpriteStatus(val ? 'Link inserido! Salve para confirmar.' : null);
                        }}
                        className="w-full rounded-xl border border-white/12 bg-slate-900/70 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                      />
                    </div>

                    {spriteUrl && (
                      <div className="mb-3 flex items-center gap-3 rounded-xl border border-cyan-300/20 bg-cyan-300/[.04] p-2">
                        <img
                          src={spriteUrl}
                          alt="Prévia do sprite"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.opacity = '0.3';
                          }}
                          className="h-14 w-14 object-contain [image-rendering:pixelated]"
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-cyan-100/90">Prévia do sprite</span>
                          <span className="text-[10px] text-white/50">Clique em Salvar no rodapé para gravar as alterações</span>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {TRAINER_PRESETS.map((p) => (
                        <SpriteTile
                          key={p.id}
                          preset={p}
                          selected={selectedTrainer === p.id}
                          onSelect={() => { setSelectedTrainer(p.id); setSpriteStatus(`${p.label} selecionado. Agora envie o sprite dele.`); }}
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

  return createPortal(modalContent, document.body);
}

/* ---------- Tile de sprite do treinador, com fallback ---------- */
function SpriteTile({
  preset,
  selected,
  onSelect,
}: {
  preset: { id: string; label: string; game: string };
  selected: boolean;
  onSelect: () => void;
}) {
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
        <span className="font-display text-sm font-black text-cyan-200">{initials}</span>
      </div>
      <span className="text-center text-[9px] font-bold uppercase tracking-wider text-white/70 group-hover:text-white">
        {preset.label}
      </span>
      <span className="text-center text-[8px] leading-tight text-white/40">{preset.game}</span>
    </button>
  );
}
