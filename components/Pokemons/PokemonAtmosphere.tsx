import PokemonConstellation from './PokemonConstellation';

export default function PokemonAtmosphere() {
  return (
    <div className="pokemon-page-atmosphere" aria-hidden="true">
      <div className="site-bg" aria-hidden="true" />
      <div className="pokemon-center-glow" aria-hidden="true" />
      <div className="pokemon-aurora pokemon-aurora-one" aria-hidden="true" />
      <div className="pokemon-aurora pokemon-aurora-two" aria-hidden="true" />
      <div className="pokemon-aurora pokemon-aurora-three" aria-hidden="true" />
      <div className="site-bg-scanlines" aria-hidden="true" />
      <PokemonConstellation />
    </div>
  );
}
