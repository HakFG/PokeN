# PROMPT PARA O CLAUDE CHAT: CRIAÇÃO DA INTERFACE VISUAL ESTILO POKÉDEX

> **Instruções para o usuário:**  
> Copie todo o conteúdo deste arquivo e cole diretamente no chat do Claude. Ele terá 100% das conexões, tipos, arquivos e regras técnicas necessárias para criar a página visual estilo Pokédex perfeitamente alinhada sem quebrar nada do projeto.

---

### INÍCIO DO PROMPT PARA O CLAUDE

Você é um UI/UX Designer e Desenvolvedor Front-end especializado em React, Tailwind CSS e Framer Motion. Você foi contratado para criar a interface visual da tela de **Pokémons (Coleção do Treinador)** em um projeto Next.js chamado **PokeN**.

Atualmente, a tela renderiza os Pokémons em uma fileira com plataformas/blobs ovais soltos, mas os sprites possuem alturas e proporções muito desiguais (por exemplo, um Bulbasaur é baixo e largo, um Charizard é alto e esvoaçante, etc.), o que causa uma sensação de desalinhamento visual e falta de acabamento.

Seu objetivo é **redesenhar completamente a camada visual dessa lista**, transformando-a em uma **verdadeira Pokédex** — com identidade visual marcante, temática, imersiva e com todos os Pokémons **perfeitamente alinhados e organizados**.

Você só precisa alterar **um ou dois arquivos de componentes visuais** já existentes. Toda a parte de backend, banco de dados e rotas já está pronta. Você **não deve quebrar nenhuma conexão de dados, tipagem ou lógica de modal**.

---

## 1. STACK E TECNOLOGIAS DO PROJETO

- **Framework:** Next.js 16 (App Router)
- **React:** React 19 (`'use client'`)
- **Estilização:** Tailwind CSS v4 (suporta classes utilitárias modernas do Tailwind, gradients, backdrop-blur, etc.)
- **Animações:** `framer-motion` (já instalado e configurado, inclusive com suporte a `useReducedMotion`)
- **Linguagem:** TypeScript 5
- **Paleta de Cores e Atmosfera do Site:**
  - Fundo principal: `#1D132D` (roxo espacial escuro)
  - Cores de destaque padrão: ciano (`cyan-400`), âmbar/dourado (`amber-300`), violeta/púrpura
  - Cores dos tipos de Pokémon são dinâmicas em hexadecimal (`typeColor`)
- **Ícones:** Não utilize pacotes externos como Lucide. Se precisar de ícones ou setas, utilize SVGs inline nativos ou elementos CSS/Unicode.

---

## 2. ARQUITETURA E FLUXO DE DADOS (CONEXÕES)

A rota é `/pokemons` (`app/pokemons/page.tsx`).  
Ela é um Server Component que busca os Pokémons no banco (Prisma) e resolve os sprites da PokeAPI.  
Em seguida, ela chama o componente cliente `<PokemonGrid entries={entries} />`.

### A interface dos dados recebidos:
Cada item da lista é um objeto do tipo `PokemonGridEntry`:

```typescript
export interface PokemonGridEntry {
  id: string;              // ID único no banco de dados (ex: UUID)
  pokemonId: number;       // Número nacional da Pokédex (ex: 1 para Bulbasaur, 6 para Charizard)
  name: string;            // Nome original da espécie (ex: "bulbasaur")
  nickname: string | null; // Apelido dado pelo usuário (ex: "Brutus"), ou null se não tiver
  level: number;           // Nível do pokémon (ex: 5, 99)
  isShiny: boolean;        // Se o pokémon é brilhante (true / false)
  typeNames: string[];     // Array com nomes dos tipos (ex: ['grass', 'poison'] ou ['fire'])
  typeName: string;        // Nome do tipo primário (ex: 'grass', 'fire', 'water')
  typeColor: string;       // Cor hexadecimal correspondente ao tipo (ex: '#7AC74C', '#EE8130')
  spriteUrl: string | null;// URL customizada (caso seja Hack Rom) ou null
  spriteVariant: string | null; // Variante de sprite (ex: 'official-artwork', 'dream-world')
  moveset: unknown;        // Golpes aprendidos (repassado para o modal de detalhes)
}
```

### Importações de utilitários disponíveis:
Para obter o sprite correto de cada Pokémon com suporte a fallback de erro e shiny:

```typescript
import { getPreferredSprite, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';
```

A lógica de resolução de imagem testada e aprovada é:
```typescript
const [failed, setFailed] = useState(false);

const src = spriteUrl
  ? spriteUrl
  : failed
    ? getFallbackSprite(pokemonId, isShiny)
    : getPreferredSprite(pokemonId, spriteVariant, isShiny);
```

### Modal de Detalhes existente:
Existe um modal já implementado em `./PokemonDetailModal`. Ao clicar em um Pokémon, esse modal deve ser aberto:

```typescript
import PokemonDetailModal from './PokemonDetailModal';

// Estado no componente pai:
const [selected, setSelected] = useState<PokemonGridEntry | null>(null);

// Ao clicar no card/slot:
onClick={() => setSelected(entry)}

// Renderização do modal condicional:
{selected && (
  <PokemonDetailModal
    pokemonId={selected.pokemonId}
    nickname={selected.nickname}
    level={selected.level}
    moveset={selected.moveset}
    isShiny={selected.isShiny}
    onClose={() => setSelected(null)}
  />
)}
```

---

## 3. OS DOIS ARQUIVOS QUE VOCÊ DEVE EDITAR / SUBSTITUIR

Você pode concentrar suas mudanças em:
1. `components/PokemonGrid.tsx` (Container da Pokédex, grid, filtros/abas se desejar, e modal de detalhes)
2. `components/PokemonGridItem.tsx` (Card ou compartimento individual do Pokémon na Pokédex)

*(Observação: Se preferir, você pode juntar o item dentro do próprio `PokemonGrid.tsx`, ou manter os dois arquivos separados. O importante é o resultado final funcionar perfeitamente quando colocado no projeto).*

---

## 4. O DESAFIO VISUAL: IDENTIDADE DE POKÉDEX E ALINHAMENTO PERFEITO

### Problema de alinhamento atual:
- Imagens oficiais de Pokémon variam drasticamente de tamanho (largura x altura). Quando soltos sobre uma base oval sem delimitação rígida, alguns parecem flutuar mais alto, outros ficam afundados, quebrando o ritmo visual da página.

### O que você deve construir:
Crie uma estética inspirada em uma **Pokédex moderna e sofisticada** (aparelho de alta tecnologia, display digital / holográfico / tático):
1. **Alinhamento impecável:** Crie compartimentos, slots, cards ou baias tecnológicas com dimensões consistentes. A área de exibição do sprite deve ter um ponto de ancoragem estável (por exemplo, base alinhada ou moldura centrada com altura fixa, flex items-center justify-center ou ancoragem inferior precisa), garantindo que todos os Pokémons fiquem na mesma linha visual com harmonia milimétrica.
2. **Identidade Pokédex autêntica:**
   - Detalhes visuais temáticos: display digital, grade de dados, número de registro formatado (`#001`, `#025`), níveis, badges com o tipo do Pokémon coloridos pela `typeColor`, indicador shiny especial.
   - Molduras ou painéis com estética sci-fi/tecnológica (bordas chanfradas, acentos luminosos, linhas de circuito, vidro escurecido `backdrop-blur`, gradientes elegantes condizentes com o tema dark `#1D132D`).
3. **Interatividade e refinamento:**
   - Efeitos ao passar o mouse (hover): iluminação sutil da cor do tipo (`box-shadow` ou borda brilhante), leve elevação, transição suave.
   - Animação de entrada fluida com Framer Motion (respeitando `useReducedMotion`).
   - Clique abrindo o modal de detalhes já existente.
4. **Estado Vazio (`EmptyPokemonState`):**
   - Caso `entries.length === 0`, renderize uma tela estilizada de "Pokédex vazia: nenhum espécime registrado ainda", com botão convidativo para navegar até `/jogos`.

---

## 5. CÓDIGO ATUAL DOS DOIS ARQUIVOS (PARA SUA REFERÊNCIA)

### Arquivo 1: `components/PokemonGrid.tsx`
```tsx
'use client';

import Link from 'next/link';
import PokemonGridItem from './PokemonGridItem';
import PokemonDetailModal from './PokemonDetailModal';
import { useState } from 'react';

export interface PokemonGridEntry {
  id: string;
  pokemonId: number;
  nickname: string | null;
  name: string;
  level: number;
  moveset: unknown;
  isShiny: boolean;
  typeNames: string[];
  typeName: string;
  typeColor: string;
  spriteUrl: string | null;
  spriteVariant: string | null;
}

interface Props {
  entries: PokemonGridEntry[];
}

export default function PokemonGrid({ entries }: Props) {
  const [selected, setSelected] = useState<PokemonGridEntry | null>(null);

  if (entries.length === 0) {
    return <EmptyPokemonState />;
  }

  return (
    <div className="mx-auto grid w-full max-w-[1500px] grid-cols-2 justify-items-center gap-x-8 gap-y-12 px-5 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
      {entries.map((entry, index) => (
        <PokemonGridItem
          key={entry.id}
          pokemonId={entry.pokemonId}
          nickname={entry.nickname}
          name={entry.name}
          level={entry.level}
          isShiny={entry.isShiny}
          typeNames={entry.typeNames}
          typeName={entry.typeName}
          typeColor={entry.typeColor}
          spriteUrl={entry.spriteUrl}
          spriteVariant={entry.spriteVariant}
          index={index}
          onClick={() => setSelected(entry)}
        />
      ))}
      {selected && (
        <PokemonDetailModal
          pokemonId={selected.pokemonId}
          nickname={selected.nickname}
          level={selected.level}
          moveset={selected.moveset}
          isShiny={selected.isShiny}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function EmptyPokemonState() {
  return (
    <div className="mx-6 my-10 flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-cyan-300/20 bg-slate-950/25 px-6 text-center text-slate-100 backdrop-blur-md">
      <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-cyan-300/70 text-cyan-200">
        <span className="absolute h-1/2 w-full border-b-2 border-cyan-300/70" />
        <span className="z-10 h-8 w-8 rounded-full border-2 border-cyan-300/70 bg-slate-950/80 shadow-[0_0_24px_rgba(34,211,238,0.4)]" />
      </div>
      <h2 className="font-display text-2xl font-bold">Sua coleção está vazia</h2>
      <p className="mt-2 max-w-md text-sm text-slate-300">
        Escolha um jogo e adicione seu primeiro Pokémon para começar sua jornada.
      </p>
      <Link href="/jogos" className="mt-5 rounded-xl border border-amber-300/60 bg-amber-300/10 px-5 py-2 text-sm font-bold text-amber-100 transition hover:-translate-y-0.5 hover:bg-amber-300/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300">
        Ir para Jogos
      </Link>
    </div>
  );
}
```

### Arquivo 2: `components/PokemonGridItem.tsx`
```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { getPreferredSprite, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';

interface Props {
  pokemonId: number;
  nickname: string | null;
  name: string;
  level: number;
  isShiny: boolean;
  typeNames: string[];
  typeName: string;
  typeColor: string;
  spriteUrl: string | null;
  spriteVariant: string | null;
  index?: number;
  onClick?: () => void;
}

export default function PokemonGridItem({
  pokemonId,
  nickname,
  name,
  level,
  isShiny,
  typeNames,
  typeName,
  typeColor,
  spriteUrl,
  spriteVariant,
  onClick,
  index = 0,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const displayName = nickname ?? name;
  const src = spriteUrl
    ? spriteUrl
    : failed
      ? getFallbackSprite(pokemonId, isShiny)
      : getPreferredSprite(pokemonId, spriteVariant, isShiny);
  const effectGlyphs: Record<string, string> = {
    fire: '•', water: '◦', grass: '✦', electric: '⚡', psychic: '◌', ghost: '◒',
    ice: '✧', ground: '·', rock: '·', flying: '⌁', poison: '○', dragon: '◆',
    fighting: '+', normal: '·', bug: '•', steel: '◇', dark: '◒', fairy: '✦',
  };
  const glyph = effectGlyphs[typeName] ?? '·';
  const effects = reduceMotion ? [] : Array.from({ length: 4 }, (_, effectIndex) => effectIndex);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`${displayName}, nível ${level}, Pokédex número ${pokemonId}`}
      whileTap={{ scale: 0.97 }}
      initial={reduceMotion ? undefined : { opacity: 0, y: 14, scale: 0.94 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 1.2), ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.04 }}
      className="group relative flex min-w-0 flex-col items-center rounded-3xl p-2 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
    >
      <div className={`pokemon-card-stage ${typeNames.map((type) => `pokemon-type-${type}`).join(' ')} relative flex h-32 w-full min-w-[128px] items-end justify-center sm:h-36`}>
        <div
          className={`pokemon-blob absolute bottom-1 h-16 w-full max-w-[154px] rounded-[50%] border bg-slate-200/15 backdrop-blur-sm transition duration-300 group-hover:scale-105 group-hover:bg-slate-200/25 group-hover:shadow-[0_0_30px_var(--type-color)] ${isShiny ? 'pokemon-blob-shiny' : ''}`}
          style={{ borderColor: `${typeColor}88`, '--type-color': `${typeColor}99` } as CSSProperties}
        />
        {effects.map((effectIndex) => (
          <span
            key={effectIndex}
            className="pokemon-type-particle absolute z-20 text-sm font-black"
            style={{
              '--particle-index': effectIndex,
              '--type-color': typeColor,
            } as CSSProperties}
            aria-hidden="true"
          >
            {glyph}
          </span>
        ))}
        <motion.img
          src={src}
          alt={displayName}
          className="relative z-10 h-32 w-full object-contain drop-shadow-[0_12px_12px_rgba(8,15,45,0.35)] transition duration-300 group-hover:scale-105 sm:h-36"
          loading="lazy"
          onError={() => setFailed(true)}
          animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 3.6, delay: (index % 5) * 0.23, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span className="absolute bottom-0 right-1 z-20 rounded-full bg-amber-300 px-1.5 py-0.5 text-[9px] font-black text-slate-950 shadow-md">Lv {level}</span>
        {isShiny && <span className="absolute left-1 top-1 text-sm text-amber-200 drop-shadow-[0_0_6px_rgba(253,230,138,0.9)]" aria-label="Shiny">✦</span>}
      </div>
      <span className="mt-3 max-w-[170px] whitespace-normal break-words text-xs font-bold text-slate-100 md:text-sm group-hover:text-white">
        {displayName} <span className="text-amber-200">Lv {level}</span>
      </span>
    </motion.button>
  );
}
```

---

## 6. O QUE VOCÊ DEVE ENTREGAR

Por favor, forneça o código TypeScript/React completo e pronto para colar para:
1. `components/PokemonGrid.tsx`
2. `components/PokemonGridItem.tsx` (ou arquivo único caso decida unificar)

**Checklist essencial:**
- [ ] Preserva a interface `PokemonGridEntry` e todas as propriedades que ela contém.
- [ ] Preserva o comportamento de abrir o `PokemonDetailModal` ao clicar no Pokémon.
- [ ] Preserva a chamada a `getPreferredSprite` / `getFallbackSprite` com tratamento de erro `onError`.
- [ ] Cria um design visual autêntico de Pokédex com perfeito alinhamento vertical e horizontal dos Pokémon.
- [ ] Código 100% autossuficiente (sem dependências ausentes de ícones externos, usando classes Tailwind e Framer Motion).
