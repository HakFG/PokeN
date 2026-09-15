# GUIA COMPLETO PARA O CLAUDE CHAT: ADIÇÃO, EDIÇÃO, TRANSFERÊNCIA ENTRE JOGOS/BOXES E FILTRAGEM

> **Instruções para o usuário:**  
> Copie todo o conteúdo deste arquivo e cole diretamente no Claude Chat. Todo o backend (Server Actions do Prisma, transferências seguras entre jogos/boxes, cálculos de slots e rotas) **já está 100% implementado e testado no projeto**, então o Claude só precisa construir as interfaces e conexões em React/Tailwind/Framer Motion.

---

### INÍCIO DO PROMPT PARA O CLAUDE

Você é um Lead Front-end Engineer e UI/UX Designer especialista em React 19, Next.js 16 (App Router), Tailwind CSS v4 e Framer Motion.

Você foi contratado para implementar novas funcionalidades interativas na tela de **Pokémons (Pokédex / Coleção do Treinador)** da aplicação **PokeN**.  
*(Nota: A parte visual de alinhamento dos sprites e o estilo básico de Pokédex já foram concluídos).*

Toda a infraestrutura de backend (banco Prisma, regras de negócio e Server Actions) **já está pronta e testada**. Sua missão é focar nos fluxos de usuário, interfaces e modais para as seguintes **4 funcionalidades**:

1. **Adicionar Pokémon pela própria aba Home:** Um botão tecnológico com modal para registrar um novo espécime selecionando o jogo de destino, número/nome, nível, shiny e apelido.
2. **Editar Pokémon ao clicar neles:** No modal de detalhes de cada Pokémon, permitir **editar apelido, alterar nível (1-100), alternar shiny e soltar/excluir o espécime**.
3. **Sistema de Transferência entre Jogos e Boxes (Estilo Pokémon HOME na vida real):** Poder transferir um Pokémon de um jogo (ex: Jogo A) para outro jogo (Jogo B, C, etc.) e escolher a Box de destino (Box 1, 2, etc.), com cálculo automático de slot livre.
4. **Sistema Avançado de Filtragem e Busca:** Barra de controle com busca em tempo real por nome/apelido, filtros por tipo elemental, toggle para Shinies, filtro por Jogo de origem e ordenação dinâmica (por número da Dex, nível ou nome).

---

## 1. ARQUIVOS QUE VOCÊ DEVE EDITAR / CRIAR

1. `components/PokemonGrid.tsx` — Barra de controle da Pokédex (busca, filtros, ordenação, botão de adicionar e renderização dos modais).
2. `components/PokemonDetailModal.tsx` — Modal de detalhes que agora inclui:
   - Modo de visualização completo.
   - Modo de **edição** (apelido, nível, shiny, soltar).
   - Seção/Aba de **transferência entre jogos/boxes** (escolher jogo de destino e box).
3. *(Opcional / Recomendado)* `components/AddPokemonModal.tsx` — Modal para registrar um novo Pokémon (pode ser arquivo separado ou embutido).
4. *(Opcional)* `components/TransferPokemonModal.tsx` — Se preferir separar a transferência em um modal próprio em vez de dentro do `PokemonDetailModal`.

---

## 2. O QUE JÁ ESTÁ 100% PRÉ-FEITO NO BACKEND (SUAS ACTIONS PRONTAS)

Todas as Server Actions necessárias já foram criadas, tipadas e testadas em `@/lib/actions/pokemon-home`:

```typescript
import { 
  addPokemonHomeAction, 
  updatePokemonHomeAction, 
  deletePokemonHomeAction,
  transferPokemonGameAction 
} from '@/lib/actions/pokemon-home';
```

### A. Adicionar Pokémon (`addPokemonHomeAction`):
```typescript
await addPokemonHomeAction({
  gameId: string,             // ID do jogo selecionado (obrigatório)
  pokemonId: number,          // Número nacional da Pokédex (ex: 25 para Pikachu, 6 para Charizard)
  nickname?: string | null,   // Apelido opcional
  level?: number,             // Nível 1 a 100 (padrão: 5)
  isShiny?: boolean,          // Se é shiny (padrão: false)
  spriteVariant?: string | null, // 'official-artwork' ou 'dream-world'
});
// Aloca automaticamente o próximo slot livre na box do jogo e revalida a página.
```

### B. Editar Pokémon (`updatePokemonHomeAction`):
```typescript
await updatePokemonHomeAction(entry.id, {
  nickname: string | null,    // Novo apelido ou null para limpar
  level: number,              // Novo nível (1 a 100)
  isShiny: boolean,           // Marcar/desmarcar shiny
  spriteVariant?: string | null,
});
// Salva no banco e revalida a página instantaneamente.
```

### C. Excluir / Soltar Pokémon (`deletePokemonHomeAction`):
```typescript
await deletePokemonHomeAction(entry.id);
// Remove do banco e revalida a página.
```

### D. Transferir Pokémon para Outro Jogo e Box (`transferPokemonGameAction`):
Simula exatamente o **Pokémon HOME / Pokémon Bank**:
```typescript
await transferPokemonGameAction({
  pokemonId: entry.id,       // ID do Pokémon (UUID da captura)
  targetGameId: string,      // ID do jogo de destino
  targetBoxNumber?: number,  // Número da box de destino (ex: 1, 2, 3... padrão: 1)
});
// Encontra o próximo slot livre na box de destino, move o registro no banco e revalida tanto a Home quanto as Living Dexes dos dois jogos!
```

---

## 3. PROPS E DADOS QUE O `PokemonGrid` JÁ RECEBE

A página `app/pokemons/page.tsx` já injeta em `<PokemonGrid entries={entries} games={games} />`:

```typescript
export interface PokemonGameOption {
  id: string;
  name: string;
  type: string; // 'FRANCHISE' | 'HACK_ROM'
}

export interface PokemonGridEntry {
  id: string;              // ID único no banco de dados
  gameId: string;          // ID do jogo atual onde o Pokémon está guardado
  boxNumber: number;       // Número da box onde está (ex: 1)
  boxSlot: number;         // Slot dentro da box (ex: 4)
  pokemonId: number;       // Número nacional (#001 a #1025)
  nickname: string | null; // Apelido ou null
  name: string;            // Nome da espécie (ex: "charmander")
  level: number;           // Nível (ex: 5)
  moveset: unknown;        // Array de golpes (string[])
  isShiny: boolean;        // Se é shiny
  typeNames: string[];     // Tipos (ex: ['fire'])
  typeName: string;        // Tipo primário (ex: 'fire')
  typeColor: string;       // Cor hexadecimal do tipo (ex: '#EE8130')
  spriteUrl: string | null;// URL customizada se houver
  spriteVariant: string | null;
}

interface Props {
  entries: PokemonGridEntry[];
  games?: PokemonGameOption[];
}
```

---

## 4. DETALHAMENTO DAS 4 FUNCIONALIDADES PARA O FRONT-END

### 1. Adicionar Pokémon pela própria aba Home
- Botão no topo do painel: `[ + Registrar Pokémon ]` ou `[ + Novo Espécime ]`.
- Abre um modal elegante com:
  - **Jogo de Destino:** Select com os jogos vindos de `games` (padrão no primeiro jogo).
  - **Número ou Nome da Espécie:** Input numérico (1-1025) ou texto. Dica: mostre um preview instantâneo da imagem usando `getPreferredSprite(pokemonId, null, isShiny)` conforme o usuário digita.
  - **Apelido:** Input de texto opcional.
  - **Nível:** Input numérico (1 a 100, padrão 5).
  - **Shiny:** Checkbox estilizado `✦ Forma Shiny`.
  - Botão de submissão com estado de carregamento chamando `addPokemonHomeAction`.

### 2. Editar Pokémon ao clicar nele (Dentro do `PokemonDetailModal`)
- Ao clicar no Pokémon no grid, o modal exibe as informações atuais (nome, número, imagem, tipo, nível, box e jogo atual).
- Incluir uma aba ou botão **"Editar Dados"**:
  - Modificar **Apelido** (texto).
  - Modificar **Nível** (1-100).
  - Alternar **Shiny** (toggle).
  - Botão **"Salvar Alterações"** chamando `updatePokemonHomeAction`.
  - Botão de perigo **"Soltar Pokémon"** (exclusão) com confirmação simples antes de chamar `deletePokemonHomeAction`.

### 3. Transferir Pokémon para outro Jogo e Box (Estilo Pokémon HOME)
- No modal de detalhes (ou em um submenu "Transferir"), exibir a localização atual do Pokémon:
  - Ex: *"Localização atual: Pokémon FireRed • Box 1 (Slot 4)"*
- Interface de transferência:
  - **Jogo de Destino:** Dropdown listando os outros jogos disponíveis (filtrando para não mostrar o jogo em que o Pokémon já está).
  - **Box de Destino:** Input numérico ou seletor de Box (ex: Box 1, Box 2, Box 3...).
  - Botão de ação: **"Transferir para este Jogo"**.
  - Chama `transferPokemonGameAction({ pokemonId: entry.id, targetGameId, targetBoxNumber })`.
  - Exibe mensagem de sucesso (ex: *"Transferido com sucesso para [Nome do Jogo] • Box X (Slot Y)!"*) e fecha o modal.

### 4. Barra de Filtragem e Busca Avançada
No topo do `PokemonGrid.tsx`, monte uma barra de filtros dinâmica:
- **Busca em tempo real:** Campo de pesquisa filtrando por nome da espécie ou apelido (case-insensitive).
- **Filtro por Tipo:** Badges/Pills clicáveis com os tipos existentes na coleção (Fogo, Água, etc.) com cores personalizadas.
- **Filtro por Jogo:** Dropdown para visualizar apenas os Pokémons guardados em determinado jogo (ou "Todos os Jogos").
- **Toggle Shiny:** Botão `✦ Apenas Shinies`.
- **Ordenação (Sort):**
  - Número da Pokédex (Crescente / Decrescente).
  - Nível (Maior / Menor).
  - Nome (A-Z / Z-A).
- **Contador:** Exibe a quantidade visível vs total (ex: `"Exibindo 8 de 8 espécimes"`).

---

## 5. CÓDIGO ATUAL DOS COMPONENTES (PARA SUA BASE)

### `components/PokemonGrid.tsx`
```tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import PokemonGridItem from './PokemonGridItem';
import PokemonDetailModal from './PokemonDetailModal';

export interface PokemonGameOption {
  id: string;
  name: string;
  type: string;
}

export interface PokemonGridEntry {
  id: string;
  gameId: string;
  boxNumber: number;
  boxSlot: number;
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
  games?: PokemonGameOption[];
}

export default function PokemonGrid({ entries, games = [] }: Props) {
  const [selected, setSelected] = useState<PokemonGridEntry | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);

  const typeIndex = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of entries) {
      for (const t of entry.typeNames) {
        if (!map.has(t)) map.set(t, entry.typeColor);
      }
    }
    return map;
  }, [entries]);

  const visibleEntries = activeType
    ? entries.filter((entry) => entry.typeNames.includes(activeType))
    : entries;

  if (entries.length === 0) {
    return <EmptyPokemonState />;
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
        {visibleEntries.map((entry, index) => (
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
      </div>

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
    <div className="mx-6 my-10 flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#120B1E] px-6 text-center">
      <h2 className="text-xl font-bold text-slate-100">Nenhum espécime registrado</h2>
      <Link href="/jogos" className="mt-5 rounded-lg border border-amber-300/50 bg-amber-300/10 px-5 py-2 text-sm font-bold text-amber-100">
        Ir para Jogos
      </Link>
    </div>
  );
}
```

### `components/PokemonDetailModal.tsx`
```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getPokemon } from '@/lib/pokeapi/client';
import type { PokemonDetail } from '@/lib/pokeapi/types';
import { getOfficialArtwork, getFallbackSprite } from '@/lib/pokeapi/sprite-variants';

interface Props {
  pokemonId: number;
  nickname: string | null;
  level: number;
  moveset: unknown;
  isShiny?: boolean;
  onClose: () => void;
}

export default function PokemonDetailModal({
  pokemonId,
  nickname,
  level,
  moveset,
  isShiny = false,
  onClose,
}: Props) {
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getPokemon(pokemonId).then(setDetail).catch(() => {});
  }, [pokemonId]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const src = failed
    ? getFallbackSprite(pokemonId, isShiny)
    : getOfficialArtwork(pokemonId, isShiny);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.82, opacity: 0, y: 18 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl border border-cyan-300/25 bg-slate-950/90 p-6 text-slate-100"
        >
          <h2 className="text-2xl font-bold capitalize">
            {nickname ?? detail?.name ?? `#${pokemonId}`}
          </h2>
          {detail && (
            <p className="text-cyan-200">{detail.types.map((t) => t.type.name).join(' / ')}</p>
          )}
          <img src={src} alt="" className="mx-auto my-4 w-40 object-contain" onError={() => setFailed(true)} />
          <p className="font-semibold">Nível {level}</p>
          <button onClick={onClose} className="mt-6 w-full rounded-xl border border-amber-300/50 bg-amber-300/10 py-2 font-bold text-amber-100">
            Fechar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 6. O QUE VOCÊ DEVE ENTREGAR

Por favor, forneça o código TypeScript/React completo e pronto para colar para:
1. `components/PokemonGrid.tsx` (com barra de busca, filtros de tipo/shiny/jogo, ordenação, botão de adicionar e modais).
2. `components/PokemonDetailModal.tsx` (com abas ou seções para: visualização de dados, **edição** de apelido/nível/shiny/exclusão, e **transferência para outro jogo/box** com a lista de `games`).
3. `components/AddPokemonModal.tsx` (modal para adicionar novo Pokémon com seleção de jogo).

**Dica para o `PokemonDetailModal`:**  
Passe o objeto inteiro `entry: PokemonGridEntry` e a lista `games: PokemonGameOption[]` para dentro dele como props. Assim o modal tem o `entry.id`, `entry.gameId`, `entry.boxNumber`, `entry.boxSlot` e a lista de jogos disponíveis para realizar a edição e a transferência sem nenhuma complicação.
