'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useXpFeedback } from '@/components/Xp/XpFeedbackProvider';
import { createHackRoom } from './actions';

export default function NovaHackRoomForm() {
  const router = useRouter();
  const { showFeedback } = useXpFeedback();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError(null);
    try {
      const result = await createHackRoom(formData);
      if (result.ok) {
        if (result.xp) showFeedback(result.xp, 'Hackroom criada');
        router.push(`/jogos/${result.gameId}/hackroom`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar hackroom');
      setSaving(false);
    }
  }

  return (
    <form action={handleSubmit} className="mx-auto w-full max-w-lg space-y-5">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80"
        >
          Nome
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder="ex: Pokémon Radical Red"
          className="w-full rounded-xl border border-white/12 bg-slate-900/70 px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="baseRomName" className="mb-1.5 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">ROM base</label>
          <input id="baseRomName" name="baseRomName" placeholder="ex: FireRed" className="w-full rounded-xl border border-white/12 bg-slate-900/70 px-3.5 py-2 text-sm text-white placeholder:text-white/30" />
        </div>
        <div>
          <label htmlFor="regionName" className="mb-1.5 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">Região</label>
          <input id="regionName" name="regionName" placeholder="ex: Kanto" className="w-full rounded-xl border border-white/12 bg-slate-900/70 px-3.5 py-2 text-sm text-white placeholder:text-white/30" />
        </div>
      </div>
      <div>
        <label htmlFor="difficulty" className="mb-1.5 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80">Dificuldade</label>
        <select id="difficulty" name="difficulty" defaultValue="" className="w-full rounded-xl border border-white/12 bg-slate-900/70 px-3.5 py-2 text-sm text-white"><option value="">Não definida</option><option value="EASY">Fácil</option><option value="NORMAL">Normal</option><option value="HARD">Difícil</option><option value="BRUTAL">Brutal</option></select>
      </div>

      <div>
        <label
          htmlFor="themeColor"
          className="mb-1.5 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80"
        >
          Cor do tema
        </label>
        <input
          id="themeColor"
          name="themeColor"
          type="color"
          defaultValue="#90A4AE"
          className="h-10 w-full cursor-pointer rounded-xl border border-white/12 bg-slate-900/70 p-1"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1.5 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80"
        >
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Opcional"
          className="w-full resize-none rounded-xl border border-white/12 bg-slate-900/70 px-3.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
        />
      </div>

      <div>
        <label
          htmlFor="banner"
          className="mb-1.5 block font-display text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200/80"
        >
          Banner
        </label>
        <input
          id="banner"
          name="banner"
          type="file"
          accept="image/*"
          className="w-full rounded-xl border border-white/12 bg-slate-900/70 px-3.5 py-2 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1 file:text-xs file:font-bold file:text-cyan-200"
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl border border-amber-300/50 bg-gradient-to-br from-amber-300 to-amber-500 px-4 py-3 font-display text-[11px] font-black uppercase tracking-[0.18em] text-slate-900 shadow-[0_0_18px_rgba(251,191,36,0.4)] transition hover:brightness-110 disabled:opacity-50"
      >
        {saving ? 'Criando…' : 'Criar Hack Room'}
      </button>
    </form>
  );
}
