'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { updateOwnedPokemon, deleteOwnedPokemon } from '@/lib/actions/living-dex';
import { getOfficialArtwork, getPreferredSprite, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';

interface Props {
  gameId: string;
  owned: {
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
  };
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

export default function EditPokemonModal({
  gameId,
  owned,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  const [nickname, setNickname] = useState(owned.nickname ?? '');
  const [level, setLevel] = useState<number>(owned.level || 5);
  const [isShiny, setIsShiny] = useState<boolean>(owned.isShiny);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Imagem para preview no modal
  const spritePreview = owned.spriteUrl
    ? owned.spriteUrl
    : owned.pokemonId > 0
      ? getOfficialArtwork(owned.pokemonId, isShiny)
      : null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateOwnedPokemon(owned.id, gameId, {
        nickname: nickname.trim() || null,
        level,
        isShiny,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteOwnedPokemon(owned.id, gameId);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover pokémon');
      setDeleting(false);
    }
  }

  const modalContent = (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        style={{ zIndex: 9999 }} className="add-pokemon-backdrop"
      >
        <motion.div
          key="modal"
          initial={reduceMotion ? undefined : { opacity: 0, y: 32, scale: 0.94 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="add-pokemon-modal"
          style={{ maxWidth: '440px' }}
        >
          {/* Cantos e linhas decorativas */}
          <span className="add-pokemon-modal-corner tl" aria-hidden="true" />
          <span className="add-pokemon-modal-corner tr" aria-hidden="true" />
          <span className="add-pokemon-modal-corner bl" aria-hidden="true" />
          <span className="add-pokemon-modal-corner br" aria-hidden="true" />
          <div className="add-pokemon-modal-topline" aria-hidden="true" />

          {/* Header */}
          <header className="add-pokemon-header">
            <div className="add-pokemon-header-left">
              <span className="add-pokemon-pokeball" aria-hidden="true" />
              <div className="add-pokemon-header-text">
                <span className="add-pokemon-header-label">Editar Pokémon</span>
                <span className="add-pokemon-header-slot">
                  Box {String(owned.boxNumber).padStart(2, '0')} · Slot {String(owned.boxSlot).padStart(2, '0')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="add-pokemon-close"
              aria-label="Fechar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <form onSubmit={handleSave} className="add-pokemon-form">
            <div className="add-pokemon-scroll">
              {/* Preview */}
              <div className="add-pokemon-preview">
                <div className="add-pokemon-preview-sprite">
                  {spritePreview ? (
                    <motion.img
                      key={`${spritePreview}-${isShiny}`}
                      src={spritePreview}
                      alt={owned.name}
                      initial={reduceMotion ? undefined : { opacity: 0, scale: 0.75 }}
                      animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="max-h-16 w-auto object-contain [image-rendering:pixelated]"
                      draggable={false}
                    />
                  ) : (
                    <span className="add-pokemon-preview-empty">?</span>
                  )}
                </div>
                <div className="add-pokemon-preview-info">
                  <span className="add-pokemon-preview-label">Espécie</span>
                  <span className="add-pokemon-preview-name">{owned.name}</span>
                  {owned.pokemonId > 0 && (
                    <span className="add-pokemon-preview-number">
                      #{String(owned.pokemonId).padStart(3, '0')}
                    </span>
                  )}
                </div>
              </div>

              {/* Apelido */}
              <div className="add-pokemon-field">
                <label className="add-pokemon-label" htmlFor="edit-nickname">
                  <span className="add-pokemon-label-dot" aria-hidden="true" />
                  Apelido (Nickname)
                </label>
                <input
                  id="edit-nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={owned.name}
                  className="add-pokemon-input"
                  maxLength={24}
                />
              </div>

              {/* Nível */}
              <div className="add-pokemon-field">
                <label className="add-pokemon-label" htmlFor="edit-level">
                  <span className="add-pokemon-label-dot" aria-hidden="true" />
                  Nível (1 a 100) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-level"
                    type="number"
                    min={1}
                    max={100}
                    value={level}
                    onChange={(e) => setLevel(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
                    required
                    className="add-pokemon-input"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setLevel((l) => Math.max(1, l - 5))}
                      className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-bold text-white hover:bg-white/10"
                    >
                      -5
                    </button>
                    <button
                      type="button"
                      onClick={() => setLevel((l) => Math.min(100, l + 5))}
                      className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-bold text-white hover:bg-white/10"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => setLevel(100)}
                      className="rounded-lg border border-amber-300/30 bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-200 hover:bg-amber-400/20"
                    >
                      Lv 100
                    </button>
                  </div>
                </div>
              </div>

              {/* Shiny */}
              <label className="add-pokemon-checkbox">
                <input
                  name="isShiny"
                  type="checkbox"
                  checked={isShiny}
                  onChange={(e) => setIsShiny(e.target.checked)}
                />
                <span className="add-pokemon-checkbox-mark" aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="add-pokemon-checkbox-label">Versão Shiny</span>
                <span className="add-pokemon-checkbox-star" aria-hidden="true">★</span>
              </label>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="add-pokemon-error"
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* Footer com Ações */}
            <footer className="add-pokemon-footer justify-between">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || saving}
                className="add-pokemon-btn livingdex-detail-btn-danger text-xs font-bold"
                style={{
                  backgroundColor: confirmDelete ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                  color: confirmDelete ? '#ffffff' : '#fca5a5',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                }}
              >
                {deleting
                  ? 'Removendo…'
                  : confirmDelete
                    ? 'Confirmar exclusão?'
                    : 'Remover da Box'}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="add-pokemon-btn add-pokemon-btn-ghost"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="add-pokemon-btn add-pokemon-btn-primary"
                >
                  {saving ? 'Salvando…' : 'Salvar Alterações'}
                </button>
              </div>
            </footer>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
