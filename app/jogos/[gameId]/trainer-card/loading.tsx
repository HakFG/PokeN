export default function TrainerCardLoading() {
  return (
    <div className="min-h-screen bg-[#1D132D] px-4 py-8 md:px-8">
      <div className="mx-auto mb-8 h-12 w-64 animate-pulse rounded-full bg-white/10" />
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-slate-950/50 p-5">
        <div className="grid gap-3 md:grid-cols-[13rem_1fr]">
          <div className="space-y-3"><div className="h-56 animate-pulse rounded-2xl bg-white/10" /><div className="h-56 animate-pulse rounded-2xl bg-white/10" /></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="min-h-[150px] animate-pulse rounded-2xl bg-white/10" />)}</div>
        </div>
      </div>
    </div>
  );
}