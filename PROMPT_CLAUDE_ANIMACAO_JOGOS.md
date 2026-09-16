# PROMPT PARA O CLAUDE CHAT: NOVA ANIMAÇÃO TEMÁTICA DE POKÉMON PARA A ÁREA DE JOGOS

> **Instruções para o Usuário:**  
> 1. Copie todo o conteúdo abaixo a partir da linha demarcada `### INÍCIO DO PROMPT PARA O CLAUDE CHAT`.  
> 2. Cole diretamente no **Claude Chat**.  
> 3. O Claude terá 100% das informações técnicas, arquitetura, regras de performance, código atual e liberdade criativa para criar a nova animação de Pokémon para você substituir em **1 único arquivo** (`components/Jogos/JogosBackground.tsx`).

---

### INÍCIO DO PROMPT PARA O CLAUDE CHAT

Você é um **Creative Technologist, Motion Designer e Engenheiro Front-End Especialista em Interfaces Gamificadas e Criativas (React, Tailwind CSS, Framer Motion e Canvas API)**. Além disso, você tem profundo apreço pela franquia Pokémon (da era clássica do Game Boy/GBA até os jogos mais modernos).

Você foi contratado para **reformular completamente a animação de fundo da página de Jogos** (`/jogos`) da aplicação Next.js chamada **PokeN**.

Atualmente, o fundo da área de jogos possui apenas uma grade genérica em perspectiva estilo synthwave e algumas partículas circulares flutuando. O objetivo agora é **substituir totalmente essa animação por algo com alma de Pokémon**, trazendo elementos temáticos marcantes, estética imersiva e detalhes/Easter eggs à sua escolha, mantendo a harmonia com o tema dark/futurista do site.

Você só precisa gerar o código de **1 arquivo autocontido**:  
👉 `components/Jogos/JogosBackground.tsx`

---

## 1. ONDE O COMPONENTE É UTILIZADO NO PROJETO

Na página `app/jogos/page.tsx`, o componente de fundo é carregado no topo:

```tsx
// app/jogos/page.tsx (resumo)
export default async function JogosPage() {
  // ... busca jogos da franquia e hack rooms ...
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1D132D]">
      <JogosBackgroundLoader /> {/* <--- CHAMA O SEU COMPONENTE */}
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <div className="jogos-divider" />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-20 md:px-12">
          {/* Grade de Jogos da Franquia */}
          {/* Seção de Hack Rooms */}
        </main>
      </div>
    </div>
  );
}
```

O loader (`components/Jogos/JogosBackgroundLoader.tsx`) faz a importação dinâmica sem SSR:
```tsx
// components/Jogos/JogosBackgroundLoader.tsx
const JogosBackground = dynamic(() => import('./JogosBackground'), {
  ssr: false,
  loading: () => <div className="jogos-bg jogos-bg-loading" aria-hidden="true" />,
});
```

Portanto, o seu componente `components/Jogos/JogosBackground.tsx`:
- Deve ter `'use client'` no topo.
- Deve exportar como `default function JogosBackground()`.
- Não recebe nenhuma propriedade (`props`).
- Pode ser 100% autocontido (usando React, Framer Motion, SVG ou HTML5 Canvas).

---

## 2. STACK E CORES DO PROJETO

- **Framework:** Next.js 16 (App Router, Turbopack)
- **React:** 19 (`'use client'`)
- **Animações:** `framer-motion` (v13 com `motion`, `useReducedMotion`, `AnimatePresence`) ou **HTML5 `<canvas>`** nativo (excelente se quiser criar muitas partículas ou formas geométricas performáticas).
- **Estilização:** Tailwind CSS v4.
- **Paleta de Cores do Projeto:**
  - Cor base do fundo da página: `#1D132D` (roxo espacial escuro).
  - Tons de contraste/luz da interface:
    - Ciano cibernético: `#22D3EE` (`rgba(34, 211, 238, ...)`)
    - Âmbar / Dourado: `#FBBF24` (`rgba(251, 191, 36, ...)`)
    - Roxo / Violeta espacial: `#8B5CF6` (`rgba(139, 92, 246, ...)`)
    - Vermelho Pokédex / Fogo: `#EF4444` (`rgba(239, 68, 68, ...)`)
  - A atmosfera deve permanecer sutil o suficiente para não ofuscar os títulos, botões e os cards dos jogos que ficam por cima (`z-10`).

---

## 3. REGRAS TÉCNICAS E DE PERFORMANCE OBRIGATÓRIAS

1. **Cliques Livres (`pointer-events-none`):**
   - O elemento raiz do fundo DEVE possuir `pointer-events-none fixed inset-0 z-0 overflow-hidden` (ou classes equivalentes).
   - O usuário precisa conseguir clicar normalmente nos cards dos jogos, no botão `+ Nova Hack Room` e no cabeçalho.
2. **Acessibilidade (`prefers-reduced-motion`):**
   - Utilize `useReducedMotion()` do `framer-motion` (ou media query equivalente no Canvas).
   - Se o usuário tiver movimento reduzido ativo no sistema operacional, exiba uma versão estática, suave ou com opacidade reduzida.
3. **Limpeza de Memória (Sem Memory Leaks):**
   - Se utilizar `<canvas>`, faça o cancelamento correto do loop de animação:
     ```ts
     useEffect(() => {
       let animationFrameId: number;
       // ... loop ...
       return () => cancelAnimationFrame(animationFrameId);
     }, []);
     ```
   - Trate o redimensionamento da janela (`resize`) para manter a densidade correta de pixels (`window.devicePixelRatio`).
4. **Desempenho Estável a 60 FPS:**
   - Evite recriar arrays de partículas em cada renderização (utilize `useMemo` ou referências mutáveis dentro do loop do canvas).

---

## 4. CONCEITOS E IDEIAS DE DESIGN POKÉMON (ESCOLHA DO CLAUDE)

Você tem **liberdade artística total** para escolher a direção visual e adicionar detalhes criativos. Aqui estão algumas ideias ricas em DNA Pokémon para inspirar a sua escolha:

### 🌟 Opção A — A Matriz de Pokébolas & Feixes de Captura (Capture Chamber / PC Storage)
- **Conceito:** Uma atmosfera inspirada nas máquinas de transferência de Pokébolas de Bill/Lanette e no clássico sistema de PC de armazenamento Pokémon.
- **Elementos Visuais:**
  - Pokébolas minimalistas/wireframe holográficas (traçados sutis de Poké Ball, Great Ball, Ultra Ball, Timer Ball ou Master Ball) flutuando suavemente em órbitas lentas ou surgindo e desaparecendo.
  - Feixes de energia em partículas luminosas (vermelho, ciano e dourado) que sobem suavemente, simulando dados de Pokémon sendo transferidos entre cartuchos.
  - **Detalhes extras:** Ocasionalmente (com chance rara de 1%), surge uma partícula ou brilho especial em formato de estrela cadente dourada representando um encontro **Shiny** (o clássico brilho de 4 pontas da animação dos jogos).

### 🌌 Opção B — Espaço Dimensional dos Lendários (Ultra Space / Distortion World)
- **Conceito:** Inspirado nas viagens dimensionais de Pokémon Platinum (Mundo Distorcido de Giratina) ou nos Wormholes de Pokémon Sun/Moon (Ultra Space).
- **Elementos Visuais:**
  - Vórtices sutis de energia nebular em tons de roxo profundo (`#1D132D`), violeta elétrico (`#8B5CF6`) e ciano espacial.
  - Runas antigas inspiradas nos Unown ou símbolos elementais arcanos (Fogo, Água, Trovão, Dragão, Psíquico) flutuando de forma etérea em planos de profundidade (efeito paralaxe ou dispersão).
  - **Detalhes extras:** Uma suave constelação ou silhueta estilizada que lembra asas de Rayquaza ou cauda de Mew passando de forma muito tênue e quase invisível ao fundo a cada ciclo de tempo.

### 🎮 Opção C — A Jornada dos Cartuchos Retrô & Grama Alta Digital (Digital Tall Grass & 8-Bit Dust)
- **Conceito:** Uma celebração à nostalgia de jogar Pokémon no Game Boy, Game Boy Color e Game Boy Advance.
- **Elementos Visuais:**
  - Micro-partículas em grid sutil lembrando poeira estelar de pixel art ou vaga-lumes da Floresta de Viridian (Viridian Forest).
  - Ondulações vetoriais na parte inferior da tela que lembram o balançar da clássica "grama alta" (tall grass) onde os encontros selvagens acontecem.
  - Linhas de escaneamento translúcidas (scanlines retrô) muito suaves, combinadas com flashes de dados binários holográficos.
  - **Detalhes extras:** Ícones sutis em pixel ou símbolos de insígnias de Kanto/Johto/Hoenn que cintilam discretamente nas laterais.

---

## 5. CÓDIGO ATUAL DO ARQUIVO PARA SUA REFERÊNCIA

Este é o arquivo atual que você irá substituir por completo:

### `components/Jogos/JogosBackground.tsx` (Atual):
```tsx
'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

export default function JogosBackground() {
  const reduceMotion = useReducedMotion();
  const particles = useMemo(
    () => Array.from({ length: 22 }, (_, index) => ({
      id: index,
      left: `${(index * 37) % 100}%`,
      delay: (index * 0.6) % 8,
      duration: 9 + ((index * 3) % 6),
      size: 3 + (index % 3),
      color: index % 5 === 0 ? '#8B5CF6' : index % 3 === 0 ? '#FBBF24' : '#22D3EE',
    })),
    [],
  );

  return (
    <div aria-hidden="true" className="jogos-bg">
      <div className="jogos-bg-gradient" />
      {!reduceMotion && <div className="jogos-bg-grid" />}
      {!reduceMotion && particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            bottom: '-10px',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
          }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 0.9, 0], y: [0, -810] }}
          transition={{ duration: particle.duration, delay: particle.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
      <div className="jogos-bg-vignette" />
    </div>
  );
}
```

*(Nota: o arquivo de estilos global `app/globals.css` possui as classes `.jogos-bg` com `position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;`. Se a sua nova animação for 100% autocontida usando estilos inline/Tailwind no próprio componente, ela funcionará perfeitamente sem necessidade de alterar o CSS global).*

---

## 6. O QUE VOCÊ DEVE ENTREGAR

Entregue o código TypeScript/React completo do arquivo:  
👉 **`components/Jogos/JogosBackground.tsx`**

**Critérios de Aceite:**
- [ ] Exporta `default function JogosBackground()`.
- [ ] Visual totalmente reimaginado com temática Pokémon marcante e acabamento profissional.
- [ ] Inclui detalhes criativos / microinterações visuais / Easter eggs sutis.
- [ ] Não bloqueia interações do usuário (`pointer-events: none`).
- [ ] Suporta `useReducedMotion()`.
- [ ] Sem vazamento de memória e com alto desempenho (60fps).
- [ ] Pronto para simplesmente copiar e colar no arquivo `components/Jogos/JogosBackground.tsx`.
