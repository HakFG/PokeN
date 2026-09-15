'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getPokemonList } from '@/lib/pokeapi/client';
import { getOfficialArtwork } from '@/lib/pokeapi/sprite-variants';
import {
  addHackroomEvolutionLine,
  addHackroomFakeEvolutionLine,
  addHackroomPokedexFake,
  addHackroomPokedexPokemon,
  removeHackroomPokedexEntry,
} from '@/lib/actions/hackroom-pokedex';

type NativePokemon = { id: number; name: string };
type Entry = {
  id: string;
  entryNumber: number;
  name: string;
  pokemonId: number | null;
  fakeSpeciesId: string | null;
  spriteUrl: string | null;
};
type FakeSpecies = { id: string; name: string; spriteUrl: string | null; evolvesFromId: string | null };

export default function HackDexBuilder({
  gameId,
  entries,
  fakeSpecies,
}: {
  gameId: string;
  entries: Entry[];
  fakeSpecies: FakeSpecies[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [nativePokemon, setNativePokemon] = useState<NativePokemon[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const configuredNative = useMemo(
    () => new Set(entries.flatMap((entry) => entry.pokemonId ?? [])),
    [entries],
  );
  const configuredFakes = useMemo(
    () => new Set(entries.flatMap((entry) => entry.fakeSpeciesId ?? [])),
    [entries],
  );

  useEffect(() => {
    getPokemonList()
      .then((data) => setNativePokemon(data.results.map((item) => ({
        id: Number(item.url.split('/').filter(Boolean).pop()),
        name: item.name,
      })).filter((item) => Number.isInteger(item.id) && item.id > 0)))
      .catch(() => setNativePokemon([]));
  }, []);

  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];
    return [
      ...fakeSpecies
        .filter((item) => item.name.toLowerCase().includes(term) && !configuredFakes.has(item.id))
        .map((item) => ({ ...item, kind: 'fake' as const })),
      ...nativePokemon
        .filter((item) => item.name.includes(term) && !item.name.includes('-mega') && !configuredNative.has(item.id))
        .slice(0, 10)
        .map((item) => ({ ...item, kind: 'native' as const })),
    ].slice(0, 12);
  }, [configuredFakes, configuredNative, fakeSpecies, nativePokemon, query]);

  function run(task: () => Promise<{ added?: number }>, success: (added: number) => string) {
    startTransition(async () => {
      try {
        const result = await task();
        setNotice(success(result.added ?? 0));
        setQuery('');
        router.refresh();
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Não foi possível atualizar a Pokédex');
      }
    });
  }

  return (
    <section className="rounded-3xl border border-cyan-300/20 bg-slate-950/65 p-5 shadow-[0_18px_60px_rgba(8,15,45,.32)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-[10px] font-bold uppercase tracking-[.22em] text-cyan-200/75">Pokédex da Hackroom</p>
          <h2 className="mt-1 text-xl font-black text-white">Monte as espécies da região</h2>
          <p className="mt-1 text-sm text-white/55">Pesquise espécies nativas, formas regionais ou Fakémon. A Living Dex usará esta lista.</p>
        </div>
        <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-200">{entries.length} espécies</span>
      </div>

      <div className="relative mt-5">
        <label className="text-xs font-bold uppercase tracking-wider text-cyan-100/75" htmlFor="hackdex-search">Adicionar espécie</label>
        <input id="hackdex-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: Charmander, Alolan Vulpix ou Fakémon" className="mt-2 w-full rounded-xl border border-white/15 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60" />
        {suggestions.length > 0 && (
          <div className="absolute z-20 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-cyan-300/25 bg-slate-950 p-2 shadow-2xl">
            {suggestions.map((item) => (
              <div key={`${item.kind}-${item.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5">
                <img src={item.kind === 'fake' ? item.spriteUrl ?? '' : getOfficialArtwork(item.id)} alt="" className="h-10 w-10 object-contain" />
                <div className="min-w-0 flex-1"><p className="truncate font-bold capitalize text-white">{item.name}</p><p className="text-[10px] uppercase tracking-wider text-cyan-200/65">{item.kind === 'fake' ? 'Fakémon' : `#${String(item.id).padStart(4, '0')}`}</p></div>
                {item.kind === 'native' ? <><button type="button" disabled={pending} onClick={() => run(() => addHackroomPokedexPokemon(gameId, item.id), (added) => added ? `${item.name} adicionado.` : 'Essa espécie já estava na Pokédex.')} className="rounded-lg border border-cyan-300/35 px-2 py-1 text-[10px] font-bold uppercase text-cyan-100 hover:bg-cyan-300/10 disabled:opacity-50">Adicionar</button><button type="button" disabled={pending} onClick={() => run(() => addHackroomEvolutionLine(gameId, item.id), (added) => added ? `${added} espécies da linha evolutiva adicionadas.` : 'A linha evolutiva já está completa.')} className="rounded-lg bg-amber-300 px-2 py-1 text-[10px] font-bold uppercase text-slate-950 hover:bg-amber-200 disabled:opacity-50">Linha inteira</button></> : <><button type="button" disabled={pending} onClick={() => run(() => addHackroomPokedexFake(gameId, item.id), (added) => added ? `${item.name} adicionado.` : 'Esse Fakémon já está na Pokédex.')} className="rounded-lg border border-cyan-300/35 px-2 py-1 text-[10px] font-bold uppercase text-cyan-100 hover:bg-cyan-300/10 disabled:opacity-50">Adicionar</button><button type="button" disabled={pending} onClick={() => run(() => addHackroomFakeEvolutionLine(gameId, item.id), (added) => added ? `${added} Fakémon da linha adicionados.` : 'A linha evolutiva já está completa.')} className="rounded-lg bg-amber-300 px-2 py-1 text-[10px] font-bold uppercase text-slate-950 hover:bg-amber-200 disabled:opacity-50">Linha inteira</button></>}
              </div>
            ))}
          </div>
        )}
      </div>

      {notice && <p className="mt-3 text-sm text-cyan-100">{notice}</p>}
      {pending && <p className="mt-3 text-xs font-bold uppercase tracking-wider text-amber-200">Atualizando Pokédex…</p>}

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <article key={entry.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3">
            <span className="w-8 font-mono text-xs font-bold text-amber-200">#{String(entry.entryNumber).padStart(3, '0')}</span>
            <img src={entry.spriteUrl ?? (entry.pokemonId ? getOfficialArtwork(entry.pokemonId) : '')} alt="" className="h-12 w-12 object-contain" />
            <div className="min-w-0 flex-1"><p className="truncate font-bold capitalize text-white">{entry.name}</p><p className="text-[10px] uppercase tracking-wider text-cyan-200/60">{entry.fakeSpeciesId ? 'Fakémon' : 'Espécie nativa'}</p></div>
            <button type="button" disabled={pending} onClick={() => run(() => removeHackroomPokedexEntry(gameId, entry.id), () => 'Espécie removida da Pokédex.')} className="rounded-lg px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-400/10 disabled:opacity-50" aria-label={`Remover ${entry.name}`}>×</button>
          </article>
        ))}
      </div>
      {entries.length === 0 && <p className="py-8 text-center text-sm text-white/45">Sua Pokédex está vazia. Pesquise acima para adicionar a primeira espécie.</p>}
    </section>
  );
}
