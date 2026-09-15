'use client';

import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import PokedexPanel from './PokedexPanel';
import BoxPanel from './BoxPanel';
import AddPokemonModal from './AddPokemonModal';
import EditPokemonModal from './EditPokemonModal';
import type { PokedexSpecies } from '@/lib/pokeapi/server-pokedex';
import { getOfficialArtwork } from '@/lib/pokeapi/sprite-variants';

interface Owned {
  id: string;
  pokemonId: number;
  name: string;
  nickname: string | null;
  level: number;
  boxNumber: number;
  boxSlot: number;
  spriteUrl: string | null;
  spriteVariant: string | null;
  isShiny: boolean;
  fakeSpeciesId?: string | null;
}

interface Props {
  gameId: string;
  isHackRoom: boolean;
  species: PokedexSpecies[];
  ownedIds: string[];
  owned: Owned[];
  pokedexDescription: string;
  fakeSpecies?: { id: string; name: string; spriteUrl: string | null }[];
}

export default function LivingDexClient({
  gameId,
  isHackRoom,
  species,
  ownedIds,
  owned,
  pokedexDescription,
  fakeSpecies = [],
}: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [addTarget, setAddTarget] = useState<{
    box: number;
    slot: number;
    species: PokedexSpecies | null;
  } | null>(null);
  const [editingPokemon, setEditingPokemon] = useState<Owned | null>(null);
  const [dragging, setDragging] = useState<PokedexSpecies | null>(null);
  const ownedSet = new Set(ownedIds);

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    setDragging(species.find((item) => (item.fakeSpeciesId ? `fake:${item.fakeSpeciesId}` : `pokemon:${item.id}`) === id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(null);
    const overId = String(event.over?.id ?? '');
    const match = overId.match(/^box-(\d+)-slot-(\d+)$/);
    if (!match) return;

    const boxNumber = Number(match[1]);
    const boxSlot = Number(match[2]);
    const speciesItem = species.find((item) => (item.fakeSpeciesId ? `fake:${item.fakeSpeciesId}` : `pokemon:${item.id}`) === String(event.active.id)) ?? null;
    if (!speciesItem) return;
    const occupied = owned.some(
      (pokemon) => pokemon.boxNumber === boxNumber && pokemon.boxSlot === boxSlot,
    );
    if (occupied) return;

    setAddTarget({
      box: boxNumber,
      slot: boxSlot,
      species: speciesItem,
    });
  }

  function openSpecies(speciesItem: PokedexSpecies) {
    setAddTarget({
      ...findFirstEmptySlot(owned),
      species: speciesItem,
    });
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid h-full min-h-0 grid-cols-1 gap-3 md:grid-cols-[380px_1fr] md:gap-4">
        {/* Pokédex à esquerda */}
        <motion.section
          className="min-h-0 overflow-hidden"
          initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <PokedexPanel
            species={species}
            ownedIds={ownedSet}
            pokedexDescription={pokedexDescription}
            onSpeciesClick={openSpecies}
          />
        </motion.section>

        {/* Box à direita */}
        <motion.section
          className="min-h-0 overflow-hidden"
          initial={reduceMotion ? undefined : { opacity: 0, x: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <BoxPanel
            owned={owned}
            onEmptyClick={(box, slot) => setAddTarget({ box, slot, species: null })}
            onFilledClick={(id) => {
              const found = owned.find((pokemon) => pokemon.id === id);
              if (found) setEditingPokemon(found);
            }}
          />
        </motion.section>
      </div>

      <DragOverlay>
        {dragging && (
          <div className="livingdex-drag-ghost">
            <img
              src={dragging.spriteUrl ?? getOfficialArtwork(dragging.id)}
              alt={dragging.name}
              className="h-16 w-16 object-contain drop-shadow-[0_8px_16px_rgba(34,211,238,0.6)]"
              draggable={false}
            />
            <span className="livingdex-drag-ghost-label">{dragging.name}</span>
          </div>
        )}
      </DragOverlay>

      {/* Modal para adicionar novo Pokémon */}
      {addTarget && (
        <AddPokemonModal
          gameId={gameId}
          boxNumber={addTarget.box}
          boxSlot={addTarget.slot}
          isHackRoom={isHackRoom}
          fakeSpecies={fakeSpecies}
          initialSpecies={addTarget.species}
          availableSpecies={species}
          onClose={() => setAddTarget(null)}
          onSaved={() => router.refresh()}
        />
      )}

      {/* Modal para editar Pokémon existente */}
      {editingPokemon && (
        <EditPokemonModal
          gameId={gameId}
          owned={editingPokemon}
          onClose={() => setEditingPokemon(null)}
          onSaved={() => router.refresh()}
          onDeleted={() => router.refresh()}
        />
      )}
    </DndContext>
  );
}

function findFirstEmptySlot(owned: Owned[]) {
  const maxBox = Math.max(1, ...owned.map((pokemon) => pokemon.boxNumber));
  for (let box = 1; box <= maxBox; box += 1) {
    for (let slot = 1; slot <= 12; slot += 1) {
      const occupied = owned.some(
        (pokemon) => pokemon.boxNumber === box && pokemon.boxSlot === slot,
      );
      if (!occupied) return { box, slot };
    }
  }
  return { box: maxBox + 1, slot: 1 };
}
