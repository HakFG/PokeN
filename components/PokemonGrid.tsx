'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import PokemonGridItem from './PokemonGridItem';
import PokemonDetailModal from './PokemonDetailModal';
import AddPokemonModal from './AddPokemonModal';

export interface PokemonGameOption {
  id: string;
  name: string;
  type: string; // 'FRANCHISE' | 'HACK_ROM'
}

export interface PokemonGridEntry {
  id: string;
  gameId: string;
  boxNumber: number;
  boxSlot: number;
  pokemonId: number;
  nickname: string | null;
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
        if (!map.has(t)) map.set(t, entry.typeColor);
      }
    }
    return map;
  }, [entries]);

  const gameFilterOptions = useMemo(() => {
    const ids = new Set<string>();
    for (const entry of entries) ids.add(entry.gameId);
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
      list = list.filter((entry) => entry.gameId === activeGameId);
    }
    if (shinyOnly) {
      list = list.filter((entry) => entry.isShiny);
    }
    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter((entry) => {
        const nickname = entry.nickname?.toLowerCase() ?? '';
        return entry.name.toLowerCase().includes(query) || nickname.includes(query);
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
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
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
  return (
    <div className="sticky top-0 z-30 mb-1 rounded-2xl border border-white/10 bg-[#0D0817]/90 p-4 backdrop-blur-md">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nome ou apelido..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/50 focus:bg-white/10"
            />
          </div>

          <select
            value={activeGameId}
            onChange={(e) => onGameChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
          >
            <option value="all">Todos os Jogos</option>
            {gameOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={sortKey}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={onShinyToggle}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              shinyOnly
                ? 'border-amber-300/60 bg-amber-300/15 text-amber-100'
                : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <span>✦</span> Apenas Shinies
          </button>
        </div>

        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-2 rounded-xl border border-amber-300/50 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100 transition hover:bg-amber-300/20"
        >
          <span className="text-lg leading-none">+</span> Registrar Pokémon
        </button>
      </div>

      {typeIndex.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <TypePill
            label="Todos"
            color="#64748B"
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

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>
          Exibindo <span className="font-semibold text-slate-200">{visibleCount}</span> de{' '}
          <span className="font-semibold text-slate-200">{totalCount}</span> espécimes
        </span>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="font-semibold text-cyan-300 hover:text-cyan-200"
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
      onClick={onClick}
      style={
        active
          ? { backgroundColor: `${color}33`, borderColor: `${color}99`, color }
          : undefined
      }
      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition ${
        active
          ? ''
          : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
      }`}
    >
      {label}
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