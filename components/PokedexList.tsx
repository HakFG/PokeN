// components/PokedexList.tsx
'use client';

import { useState } from 'react';

interface Props {
  species: { id: number; entryNumber: number; name: string }[];
  ownedIds: Set<number>;
}

const PAGE_SIZE = 30;

export default function PokedexList({ species, ownedIds }: Props) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(species.length / PAGE_SIZE);
  const slice = species.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const ownedCount = species.filter((s) => ownedIds.has(s.id)).length;

  return (
    <aside className="flex h-[80vh] flex-col rounded-3xl border border-cyan-300/20 bg-slate-950/55 p-4 text-slate-100 shadow-[0_18px_50px_rgba(8,15,45,0.25)] backdrop-blur-md">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="font-display text-xl font-bold text-cyan-100">Pokédex</h2>
        <span className="text-xs font-bold text-cyan-200">{ownedCount} / {species.length}</span>
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-cyan-400" style={{ width: `${species.length ? (ownedCount / species.length) * 100 : 0}%` }} /></div>
      <ul className="flex-1 space-y-1 overflow-y-auto scroll-smooth pr-1">
        {slice.map((s) => {
          const id = s.id;
          const owned = ownedIds.has(id);
          return (
            <li
              key={s.name}
              className={`flex justify-between text-sm px-2 py-1 rounded-lg border border-transparent transition ${
                owned ? 'bg-cyan-400/15 text-cyan-100 font-bold' : 'text-slate-500 hover:bg-white/5'
              }`}
            >
              <span>#{String(s.entryNumber).padStart(3, '0')}</span>
              <span className="capitalize">{s.name}</span>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-between items-center mt-3 text-sm">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-100 disabled:opacity-40"
        >
          Anterior
        </button>
        <span>
          {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
          className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-100 disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </aside>
  );
}