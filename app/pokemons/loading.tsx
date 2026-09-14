export default function PokemonsLoading() {
  return (
    <div className="min-h-screen bg-[#1D132D] px-6 pb-16 pt-8">
      <div className="mx-auto mb-10 h-16 w-72 animate-pulse rounded-full bg-cyan-200/15" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {Array.from({ length: 24 }, (_, index) => (
          <div key={index} className="flex flex-col items-center gap-3 rounded-3xl p-3">
            <div className="h-20 w-20 animate-pulse rounded-full bg-white/10 md:h-24 md:w-24" />
            <div className="h-3 w-16 animate-pulse rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
