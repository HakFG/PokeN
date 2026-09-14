'use client';

/**
 * Background da página "Qual Modo" — tema "Duelo de Auras".
 *
 * Duas auras respiram em ciclos dessincronizados (Gliscor à esquerda,
 * Greninja à direita), convergindo num shockwave central. Uma grade
 * hexagonal discreta e um feixe de luz diagonal completam a atmosfera.
 *
 * Todas as classes CSS estão definidas em app/globals.css.
 */
export default function QualModoBackground() {
  return (
    <div aria-hidden="true" className="qualmodo-bg">
      {/* Camada base: gradiente roxo/violeta */}
      <div className="qualmodo-bg-gradient" />

      {/* Aura esquerda — Gliscor (marrom/dourado) */}
      <div className="qualmodo-aura-left" />

      {/* Aura direita — Greninja (azul/violeta) */}
      <div className="qualmodo-aura-right" />

      {/* Anel de choque central */}
      <div className="qualmodo-shockwave" />

      {/* Grade hexagonal discreta */}
      <div className="qualmodo-hexgrid" />

      {/* Feixe de luz diagonal (dourado + ciano) */}
      <div className="qualmodo-sweep" />
    </div>
  );
}