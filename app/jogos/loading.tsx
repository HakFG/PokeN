export default function Loading() {
  return (
    <div className="relative min-h-screen bg-[#1D132D] px-6 pb-20 pt-8 md:px-12">
      <div className="mx-auto mb-10 h-12 w-72 animate-pulse rounded-full bg-slate-700/40" />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-2xl bg-slate-700/30" style={{ animationDelay: `${index * 0.05}s` }} />)}
      </div>
    </div>
  );
}
