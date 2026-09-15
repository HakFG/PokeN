# PROMPT PARA O CLAUDE CHAT: REDESIGN DA ANIMAÇÃO DE FUNDO (BACKGROUND ATMOSPHERE)

> **Instruções para o usuário:**  
> Copie todo o conteúdo abaixo e cole diretamente no Claude Chat. Ele terá 100% das informações técnicas, arquivos exatos, regras de performance e conexões para criar uma nova animação de fundo incrível sem quebrar nada do projeto.

---

### INÍCIO DO PROMPT PARA O CLAUDE

Você é um Motion Designer e Desenvolvedor Front-end Especialista em Animações Interativas (React, Tailwind CSS, Framer Motion e Canvas API). Você foi contratado para criar uma **nova animação visual de fundo (background atmosphere)** para a tela principal de Pokémons em uma aplicação Next.js chamada **PokeN**.

Atualmente, o fundo possui uma mistura de gradientes estáticos, manchas de luz (auroras) e uma constelação com linhas SVG e estrelas cadentes, mas o projeto precisa de uma **nova atmosfera visual mais moderna, imersiva e com identidade marcante** (por exemplo: estilo Pokédex cibernética, grid holográfico de dados, circuitos de energia sutis, partículas táteis, scanlines digitais, matriz hexagonal, etc.).

Você só precisa gerar o código de **1 arquivo** (ou no máximo 2) para substituir o componente de fundo atual. Você tem liberdade visual e criativa total para o design da animação.

---

## 1. STACK E TECNOLOGIAS DO PROJETO

- **Framework:** Next.js 16 (App Router)
- **React:** React 19 (`'use client'`)
- **Estilização:** Tailwind CSS v4 (suporta classes utilitárias modernas do Tailwind, gradients, blur, etc.)
- **Animações:** `framer-motion` (versão 13 instalada, com suporte a `useReducedMotion`, `motion.div`, etc.) ou **HTML5 Canvas** nativo se preferir uma animação de partículas com alto desempenho
- **Linguagem:** TypeScript 5
- **Paleta de Cores e Estilo do Projeto:**
  - Cor base do fundo da página: `#1D132D` (roxo profundo espacial)
  - Cores de destaque da interface: ciano (`#22D3EE` / `cyan-400`), dourado/âmbar (`#FBBF24` / `amber-300`), violeta espacial (`#8B5CF6`)
  - A interface deve permanecer escura e legível, pois cards de Pokémon, títulos e cabeçalho ficam por cima desse fundo.

---

## 2. ARQUITETURA E CONEXÕES TÉCNICAS

### Onde a animação é chamada:
A página pai é `app/pokemons/page.tsx`. Ela renderiza o componente no topo da árvore:

```tsx
// app/pokemons/page.tsx (trecho relevante)
export default async function PokemonsPage() {
  // ...
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#1D132D]">
      <PokemonAtmosphere /> {/* <--- SEU COMPONENTE DE FUNDO */}
      <Header />
      <div className="pokemon-header-line" aria-hidden="true" />
      <main className="relative z-10 flex-1 pb-16">
        <PokemonHomeBanner count={entries.length} />
        <PokemonGrid entries={entries} />
      </main>
    </div>
  );
}
```

### O Componente Alvo:
O componente responsável pelo fundo fica em:  
👉 `components/Pokemons/PokemonAtmosphere.tsx`

Ele é importado em `app/pokemons/page.tsx` sem nenhuma prop:
```tsx
import PokemonAtmosphere from '@/components/Pokemons/PokemonAtmosphere';
```

*(Existe também um arquivo auxiliar chamado `components/Pokemons/PokemonConstellation.tsx` que era usado pela versão anterior. Se você quiser criar uma solução 100% autocontida em `PokemonAtmosphere.tsx`, pode fazer tudo em um só arquivo ou modularizar como achar melhor).*

---

## 3. REGRAS TÉCNICAS E DE PERFORMANCE OBRIGATÓRIAS

1. **Não bloquear cliques ou interação do usuário:**
   - O elemento raiz do componente de fundo DEVE ter `pointer-events-none`, `fixed inset-0` (ou `absolute inset-0`) e `z-0` (ou `z-[-1]`).
   - Todos os elementos interativos da página (botões, cards de Pokémon, header) possuem `z-10` ou superior.
2. **Acessibilidade & Preferência de Movimento Reduzido:**
   - Se usar `framer-motion`, verifique `useReducedMotion()`. Quando ativo, reduza drasticamente as animações ou mantenha os elementos sutis e estáticos.
3. **Alto Desempenho e Leveza:**
   - Evite animações pesadas de CPU/GPU que causem travamento ao rolar a página ou abrir modais.
   - Se utilizar `<canvas>`, certifique-se de limpar os listeners no `return () => cancelAnimationFrame(id)` do `useEffect` para evitar vazamentos de memória (memory leaks) e redimensionar dinamicamente (`window.addEventListener('resize', ...)`).
4. **Contraste:**
   - A animação é uma **atmosfera de fundo**. Ela deve ter opacidade suave (efeito sutil de profundidade), sem ofuscar os textos e sprites que ficam por cima.

---

## 4. IDEIAS E CONCEITOS DE DESIGN PARA VOCÊ ESCOLHER OU COMBINAR

Você tem total liberdade criativa para desenhar a experiência. Algumas direções temáticas recomendadas:

- **Opção A — Pokédex Holo-Grid & Scanlines:** Grade holográfica cibernética com linhas sutis em perspectiva, pulsos de dados digitais viajando em eixos, leves feixes luminosos e micro-partículas flutuantes.
- **Opção B — Matriz de Energia Elemental / Constelação Tecnológica:** Partículas conectadas por nós de energia com brilho sutil em tons de ciano e âmbar, reagindo suavemente ou flutuando em gravidade zero.
- **Opção C — Laboratório Cibernético / Silhuetas Holográficas:** Grade técnica com círculos de mira/radar, silhuetas tênues de Pokébolas em wireframe que surgem e giram suavemente, com luzes de pulso neon.
- **Opção D — Aurora Cósmica Minimalista:** Ondas de luz suaves e profundas com micro-poeira estelar cintilante, criando uma atmosfera aconchegante e misteriosa.

---

## 5. CÓDIGO ATUAL PARA SUA REFERÊNCIA

### `components/Pokemons/PokemonAtmosphere.tsx` (Atual)
```tsx
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
```

### `components/Pokemons/PokemonConstellation.tsx` (Atual)
```tsx
'use client';

const POINTS = [
  [6, 14], [14, 32], [23, 11], [31, 26], [39, 8], [48, 20], [57, 12], [67, 28], [77, 10], [89, 23],
  [4, 52], [16, 64], [27, 47], [36, 61], [46, 45], [55, 67], [64, 51], [74, 63], [84, 46], [95, 59],
  [9, 82], [20, 93], [32, 76], [43, 88], [53, 78], [63, 94], [72, 80], [82, 91], [91, 76], [97, 91],
] as const;

const LINKS = POINTS.flatMap(([x, y], index) =>
  POINTS.slice(index + 1).flatMap(([otherX, otherY], otherIndex) => {
    const distance = Math.hypot(x - otherX, y - otherY);
    return distance < 23
      ? [{ from: index, to: index + otherIndex + 1 }]
      : [];
  }),
);

export default function PokemonConstellation() {
  return (
    <div className="pokemon-constellation" aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {LINKS.map((link, index) => {
          const [x1, y1] = POINTS[link.from];
          const [x2, y2] = POINTS[link.to];
          return (
            <line
              key={`${link.from}-${link.to}`}
              className="constellation-link"
              style={{ animationDelay: `${(index % 9) * -0.45}s` }}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            />
          );
        })}
        {POINTS.map(([x, y], index) => (
          <circle
            key={`${x}-${y}`}
            className={`constellation-point ${index % 10 < 3 ? 'constellation-point-gold' : ''}`}
            style={{
              transformOrigin: `${x}% ${y}%`,
              animationDelay: `${(index % 8) * -0.65}s`,
              animationDuration: `${4 + (index % 4) * 0.7}s`,
            }}
            cx={x}
            cy={y}
            r={index % 5 === 0 ? 0.42 : 0.28}
          />
        ))}
      </svg>
      <span className="falling-star falling-star-one" />
      <span className="falling-star falling-star-two" />
    </div>
  );
}
```

---

## 6. O QUE VOCÊ DEVE ENTREGAR

Por favor, forneça o código TypeScript/React completo e pronto para colar para:
- `components/Pokemons/PokemonAtmosphere.tsx` (preferencialmente autocontido com Tailwind/Framer Motion ou Canvas para facilitar a substituição de 1 único arquivo).

**Critérios de aceite:**
- [ ] Exporta `default function PokemonAtmosphere()`.
- [ ] Não requer nenhuma propriedade (`props`).
- [ ] Não bloqueia cliques (`pointer-events-none`).
- [ ] O visual harmoniza perfeitamente com a cor `#1D132D` e os tons neon da Pokédex (ciano e âmbar).
- [ ] Código limpo, sem bugs de montagem/desmontagem de hooks ou canvas.
