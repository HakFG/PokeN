'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRAINER_PRESETS } from '@/lib/presets/trainers';
import { xpProgress } from '@/lib/xp';
import { updateProfileSprite } from '@/lib/actions/profile';

interface Props {
  name: string;
  level: number;
  xp: number;
  characterSpriteUrl: string | null;
}

export default function ProfileCard({ name, level, xp, characterSpriteUrl }: Props) {
  const [spriteUrl, setSpriteUrl] = useState(characterSpriteUrl);
  const [openPicker, setOpenPicker] = useState(false);
  const [customUrl, setCustomUrl] = useState(characterSpriteUrl ?? '');
  const [savingUrl, setSavingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const progress = xpProgress(xp, level);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative inline-block self-start">
        <div className="bg-slate-300 rounded-3xl px-10 py-5">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            {name.toUpperCase()} CARD
          </h1>
        </div>
        <div
          className="absolute left-8 -bottom-3 w-6 h-6 bg-slate-300"
          style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
        />
      </div>

      <div className="flex flex-col items-center">
        <motion.img
          key={spriteUrl ?? 'default'}
          src={spriteUrl ?? '/trainers/gold.png'}
          alt={name}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-40 md:w-56 object-contain [image-rendering:pixelated] cursor-pointer"
          onClick={() => setOpenPicker(true)}
          title="Clique para trocar o sprite"
        />

        <div className="w-full bg-slate-300 rounded-3xl py-4 px-6 flex items-center gap-4 mt-2">
          <div className="flex-1">
            <div className="h-2 bg-slate-400 rounded-full overflow-hidden">
              <div className="h-full bg-slate-800 transition-all" style={{ width: `${progress.pct}%` }} />
            </div>
            <span className="text-[11px] text-slate-700 mt-1 inline-block font-bold">
              {progress.current} / {progress.needed} XP
            </span>
          </div>
          <div className="text-3xl md:text-4xl font-black text-slate-900 whitespace-nowrap">
            Lv {level}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {openPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpenPicker(false)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <h2 className="text-lg font-bold mb-4">Escolher sprite do treinador</h2>
              <div className="grid grid-cols-4 gap-3">
                {TRAINER_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={async () => {
                      setSpriteUrl(preset.spriteUrl);
                      setCustomUrl(preset.spriteUrl);
                      await updateProfileSprite(preset.spriteUrl);
                      setOpenPicker(false);
                    }}
                    className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 ${
                      spriteUrl === preset.spriteUrl
                        ? 'border-slate-800 bg-slate-100'
                        : 'border-transparent hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={preset.spriteUrl}
                      alt={preset.label}
                      className="w-12 h-12 object-contain [image-rendering:pixelated]"
                    />
                    <span className="text-[10px] text-center">{preset.label}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 border-t border-slate-200 pt-4">
                <label htmlFor="profile-sprite-url" className="block text-sm font-bold mb-1">
                  URL do avatar
                </label>
                <input
                  id="profile-sprite-url"
                  type="url"
                  value={customUrl}
                  onChange={(event) => {
                    setCustomUrl(event.target.value);
                    setUrlError(null);
                  }}
                  placeholder="https://exemplo.com/meu-avatar.png"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                {urlError && <p className="text-red-600 text-xs mt-1">{urlError}</p>}
                <button
                  type="button"
                  disabled={savingUrl}
                  onClick={async () => {
                    setSavingUrl(true);
                    setUrlError(null);
                    try {
                      const nextUrl = customUrl.trim() || null;
                      await updateProfileSprite(nextUrl);
                      setSpriteUrl(nextUrl);
                      setOpenPicker(false);
                    } catch (error) {
                      setUrlError(error instanceof Error ? error.message : 'Não foi possível salvar o avatar');
                    } finally {
                      setSavingUrl(false);
                    }
                  }}
                  className="mt-2 w-full px-4 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 disabled:opacity-50"
                >
                  {savingUrl ? 'Salvando...' : 'Usar esta URL'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
