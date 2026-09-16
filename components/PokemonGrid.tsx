'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import PokemonGridItem from './PokemonGridItem';
import PokemonDetailModal from './PokemonDetailModal';
import AddPokemonModal from './AddPokemonModal';
import CyberDropdown from './CyberDropdown';
import { TYPE_COLORS } from '@/lib/pokemon-types';

export interface PokemonGameOption {
  id: string;
  name: string;
  type: string; // 'FRANCHISE' | 'HACK_ROM'
}

export interface PokemonGridEntry {
  id: string;
  gameId: string;
  gameIds?: string[];
  gameNames?: string[];
  boxNumber: number;
  boxSlot: number;
  pokemonId: number;
  nickname: string | null;
  trainerName?: string | null;
  name: string;
  level: number;
  moveset: unknown;
  isShiny: boolean;
  typeNames: string[];
  typeName: string;
  typeColor: string;
  spriteUrl: string | null;
  spriteVariant: string | null;
}

interface Props {
  entries: PokemonGridEntry[];
  games?: PokemonGameOption[];
}

type SortKey =
  | 'dex-asc'
  | 'dex-desc'
  | 'level-asc'
  | 'level-desc'
  | 'name-asc'
  | 'name-desc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'dex-asc', label: 'Dex (menor → maior)' },
  { value: 'dex-desc', label: 'Dex (maior → menor)' },
  { value: 'level-asc', label: 'Nível (menor → maior)' },
  { value: 'level-desc', label: 'Nível (maior → menor)' },
  { value: 'name-asc', label: 'Nome (A → Z)' },
  { value: 'name-desc', label: 'Nome (Z → A)' },
];

export default function PokemonGrid({ entries, games = [] }: Props) {
  const [selected, setSelected] = useState<PokemonGridEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeGameId, setActiveGameId] = useState<string>('all');
  const [shinyOnly, setShinyOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('dex-asc');

  const gameNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of games) map.set(g.id, g.name);
    return map;
  }, [games]);

  const typeIndex = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of entries) {
      for (const t of entry.typeNames) {
        if (!map.has(t)) {
          const color = TYPE_COLORS[t.toLowerCase()] ?? '#64748B';
          map.set(t, color);
        }
      }
    }
    return map;
  }, [entries]);

  const gameFilterOptions = useMemo(() => {
    const ids = new Set<string>();
    for (const entry of entries) {
      if (entry.gameIds && entry.gameIds.length > 0) {
        for (const gid of entry.gameIds) ids.add(gid);
      } else {
        ids.add(entry.gameId);
      }
    }
    return Array.from(ids).map((id) => ({
      id,
      name: gameNameById.get(id) ?? id,
    }));
  }, [entries, gameNameById]);

  const filteredEntries = useMemo(() => {
    let list = entries;

    if (activeType) {
      list = list.filter((entry) => entry.typeNames.includes(activeType));
    }
    if (activeGameId !== 'all') {
      list = list.filter((entry) => {
        const ids = entry.gameIds && entry.gameIds.length > 0 ? entry.gameIds : [entry.gameId];
        return ids.includes(activeGameId);
      });
    }
    if (shinyOnly) {
      list = list.filter((entry) => entry.isShiny);
    }
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((entry) => {
        const nickname = entry.nickname?.toLowerCase() ?? '';
        const trainer = entry.trainerName?.toLowerCase() ?? '';
        return (
          entry.name.toLowerCase().includes(query) ||
          nickname.includes(query) ||
          trainer.includes(query)
        );
      });
    }

    return list;
  }, [entries, activeType, activeGameId, shinyOnly, search]);

  const visibleEntries = useMemo(() => {
    const list = [...filteredEntries];
    switch (sortKey) {
      case 'dex-asc':
        list.sort((a, b) => a.pokemonId - b.pokemonId);
        break;
      case 'dex-desc':
        list.sort((a, b) => b.pokemonId - a.pokemonId);
        break;
      case 'level-asc':
        list.sort((a, b) => a.level - b.level);
        break;
      case 'level-desc':
        list.sort((a, b) => b.level - a.level);
        break;
      case 'name-asc':
        list.sort((a, b) => (a.nickname ?? a.name).localeCompare(b.nickname ?? b.name));
        break;
      case 'name-desc':
        list.sort((a, b) => (b.nickname ?? b.name).localeCompare(a.nickname ?? a.name));
        break;
    }
    return list;
  }, [filteredEntries, sortKey]);

  const hasActiveFilters =
    search.trim() !== '' || activeType !== null || activeGameId !== 'all' || shinyOnly;

  function clearFilters() {
    setSearch('');
    setActiveType(null);
    setActiveGameId('all');
    setShinyOnly(false);
  }

  if (entries.length === 0) {
    return <EmptyPokemonState />;
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5 pb-16">
      <ControlBar
        search={search}
        onSearchChange={setSearch}
        typeIndex={typeIndex}
        activeType={activeType}
        onTypeChange={setActiveType}
        gameOptions={gameFilterOptions}
        activeGameId={activeGameId}
        onGameChange={setActiveGameId}
        shinyOnly={shinyOnly}
        onShinyToggle={() => setShinyOnly((v) => !v)}
        sortKey={sortKey}
        onSortChange={setSortKey}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        visibleCount={visibleEntries.length}
        totalCount={entries.length}
        onAddClick={() => setShowAddModal(true)}
      />

      {visibleEntries.length === 0 ? (
        <div className="mt-10 flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#120B1E] px-6 text-center">
          <p className="text-lg font-semibold text-slate-200">Nenhum espécime encontrado</p>
          <p className="mt-1 text-sm text-slate-400">Tente ajustar a busca ou os filtros.</p>
          <button
            onClick={clearFilters}
            className="mt-5 rounded-lg border border-cyan-300/40 bg-cyan-300/10 px-5 py-2 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/20"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="relative z-10 mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {visibleEntries.map((entry, index) => (
            <PokemonGridItem
              key={entry.id}
              pokemonId={entry.pokemonId}
              nickname={entry.nickname}
              name={entry.name}
              level={entry.level}
              isShiny={entry.isShiny}
              typeNames={entry.typeNames}
              typeName={entry.typeName}
              typeColor={entry.typeColor}
              spriteUrl={entry.spriteUrl}
              spriteVariant={entry.spriteVariant}
              index={index}
              onClick={() => setSelected(entry)}
            />
          ))}
        </div>
      )}

      {selected && (
        <PokemonDetailModal
          entry={selected}
          games={games}
          onClose={() => setSelected(null)}
        />
      )}

      {showAddModal && (
        <AddPokemonModal games={games} onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}

interface ControlBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeIndex: Map<string, string>;
  activeType: string | null;
  onTypeChange: (type: string | null) => void;
  gameOptions: { id: string; name: string }[];
  activeGameId: string;
  onGameChange: (id: string) => void;
  shinyOnly: boolean;
  onShinyToggle: () => void;
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  visibleCount: number;
  totalCount: number;
  onAddClick: () => void;
}

function ControlBar({
  search,
  onSearchChange,
  typeIndex,
  activeType,
  onTypeChange,
  gameOptions,
  activeGameId,
  onGameChange,
  shinyOnly,
  onShinyToggle,
  sortKey,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  visibleCount,
  totalCount,
  onAddClick,
}: ControlBarProps) {
  const gameDropdownOptions = useMemo(
    () => [
      { value: 'all', label: 'Todos os Jogos' },
      ...gameOptions.map((g) => ({ value: g.id, label: g.name })),
    ],
    [gameOptions]
  );

  return (
    <div className="pokemon-control-bar relative z-40 mb-5 rounded-2xl border border-cyan-400/30 bg-[#0A0718]/95 p-4 shadow-[0_16px_40px_-8px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
      {/* Pokédex Header Bar Decorativa */}
      <div className="mb-3.5 flex items-center justify-between border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2.5">
          {/* Grande Lente Azul da Pokédex com Reflexo */}
          <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] ring-2 ring-cyan-200/50">
            <div className="h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_4px_#ffffff]" />
          </div>
          {/* Três LEDs indicadores da Pokédex (Vermelho, Amarelo, Verde) */}
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]" />
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
          </div>
          <span className="font-mono text-[11px] font-bold tracking-widest text-cyan-300/80">
            POKÉDEX // TERMINAL DE CONTROLE
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
          <span className="font-semibold text-emerald-400">ONLINE</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          {/* Campo de Busca Terminal */}
          <div className="pokemon-search-wrapper relative flex-1 sm:max-w-xs">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400/80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nome ou apelido..."
              className="pokemon-search-input w-full rounded-xl border border-white/10 bg-[#090D1C]/90 py-2.5 pl-10 pr-8 text-xs font-bold text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-200 focus:border-cyan-400 focus:bg-[#0e1428] focus:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Seletor de Jogo via CyberDropdown */}
          <CyberDropdown
            value={activeGameId}
            onChange={onGameChange}
            options={gameDropdownOptions}
            theme="cyan"
          />

          {/* Seletor de Ordenação via CyberDropdown */}
          <CyberDropdown
            value={sortKey}
            onChange={(v) => onSortChange(v as SortKey)}
            options={SORT_OPTIONS}
            theme="cyan"
          />

          {/* Botão Apenas Shinies Sensor */}
          <button
            type="button"
            onClick={onShinyToggle}
            className={`group relative flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 hover:-translate-y-0.5 ${
              shinyOnly
                ? 'border-amber-400/90 bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/30 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.45)] ring-1 ring-amber-300/50'
                : 'border-white/10 bg-[#090D1C]/90 text-slate-300 hover:border-amber-400/50 hover:bg-[#141026] hover:text-amber-200 hover:shadow-[0_0_15px_rgba(251,191,36,0.2)]'
            }`}
          >
            <span
              className={`text-sm transition-transform duration-300 ${
                shinyOnly
                  ? 'text-amber-300 scale-110 drop-shadow-[0_0_8px_#fbbf24]'
                  : 'text-amber-400/60 group-hover:scale-110'
              }`}
            >
              ✦
            </span>
            <span className="tracking-wide">SHINIES</span>
            <span
              className={`ml-0.5 rounded px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider border ${
                shinyOnly
                  ? 'border-amber-400/60 bg-amber-400/30 text-amber-200'
                  : 'border-white/10 bg-white/5 text-slate-500 group-hover:text-amber-300 group-hover:border-amber-400/30'
              }`}
            >
              {shinyOnly ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Botão Master "+ Registrar Pokémon" Redenhado */}
        <button
          type="button"
          onClick={onAddClick}
          className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl border border-amber-400/70 bg-gradient-to-r from-amber-500/30 via-amber-400/20 to-yellow-500/30 px-5 py-2.5 text-xs font-black tracking-wider uppercase text-amber-100 shadow-[0_0_22px_rgba(251,191,36,0.35),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_0_32px_rgba(251,191,36,0.6)] active:translate-y-0"
        >
          {/* Shimmer sweep animation */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

          {/* Icon badge */}
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/30 border border-amber-300/60 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-transform duration-200 group-hover:scale-115">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
          <span className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">Registrar Pokémon</span>
        </button>
      </div>

      {/* Cartuchos de Tipagem Pokédex Coloridos */}
      {typeIndex.size > 0 && (
        <div className="pokemon-type-filter-bar mt-3.5 flex flex-wrap items-center gap-2">
          <TypePill
            label="Todos"
            color="#22D3EE"
            active={activeType === null}
            onClick={() => onTypeChange(null)}
          />
          {Array.from(typeIndex.entries()).map(([type, color]) => (
            <TypePill
              key={type}
              label={type}
              color={color}
              active={activeType === type}
              onClick={() => onTypeChange(activeType === type ? null : type)}
            />
          ))}
        </div>
      )}

      {/* Rodapé de Status */}
      <div className="pokemon-control-status mt-3 flex items-center justify-between font-mono text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="rounded bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-300 border border-white/10">
            [ {visibleCount} / {totalCount} ] ESPÉCIMES
          </span>
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}

function TypePill({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        backgroundColor: active ? `${color}35` : `${color}12`,
        borderColor: active ? color : `${color}40`,
        boxShadow: active
          ? `0 0 18px ${color}90, inset 0 0 10px ${color}40`
          : undefined,
        color: active ? '#FFFFFF' : color,
      }}
      className={`group relative flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_14px_rgba(255,255,255,0.15)]`}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full transition-all duration-200 group-hover:scale-125"
        style={{
          backgroundColor: color,
          boxShadow: active ? `0 0 10px ${color}` : `0 0 4px ${color}80`,
        }}
      />
      <span>{label}</span>
    </button>
  );
}

function EmptyPokemonState() {
  return (
    <div className="mx-6 my-10 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#120B1E] px-6 text-center">
      <h2 className="text-xl font-bold text-slate-100">Nenhum espécime registrado</h2>
      <Link href="/jogos" className="mt-5 rounded-lg border border-amber-300/50 bg-amber-300/10 px-5 py-2 text-sm font-bold text-amber-100">
        Ir para Jogos
      </Link>
    </div>
  );
}