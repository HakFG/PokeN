export default function PokemonBoxLoading() {
  return (
    <div className="min-h-screen bg-[#1D132D] px-6 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[320px_1fr]">
        <div className="h-[80vh] animate-pulse rounded-3xl bg-white/10" />
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {Array.from({ length: 30 }, (_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-xl bg-white/10" />
          ))}
        </div>
      </div>
    </div>
  );
}
