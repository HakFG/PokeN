import Link from 'next/link';
import Header from '@/components/Header';
import NovaHackRoomForm from './NovaHackRoomForm';

export default function NovaHackRoomPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D132D]">
      <Header />
      <main className="relative z-10 mx-auto w-full max-w-2xl px-6 py-10 md:px-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300/80">
              Hack Rooms
            </p>
            <h1 className="mt-1 font-display text-2xl font-black uppercase tracking-[0.08em] text-white">
              Nova Hack Room
            </h1>
          </div>
          <Link
            href="/jogos"
            className="rounded-xl border border-white/15 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 transition hover:bg-white/5"
          >
            Voltar
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-8">
          <NovaHackRoomForm />
        </div>
      </main>
    </div>
  );
}
