# PROMPT PARA O CLAUDE CHAT: REDESIGN VISUAL DA ABA DE FILTROS E MODAIS (CSS FOCUSED)

> **Instruções para o Usuário:**  
> 1. Copie todo o conteúdo abaixo da linha demarcada.  
> 2. Cole diretamente no **Claude Chat**.  
> 3. Envie o seu arquivo `app/globals.css` (ou peça para ele gerar o bloco de CSS para você colar no final de `app/globals.css`).  
> 4. O Claude terá a visão exata do JSX, classes HTML e contexto estético do projeto para criar um CSS incrível sem precisar de acesso ao restante do repositório.

---

### INÍCIO DO PROMPT PARA O CLAUDE CHAT

Você é um **Lead UI/UX Designer & CSS Architect Especialista em Interfaces Futuristas de Jogos** (Cyberpunk, Sci-Fi HUD, Pokédex Holo-Terminal e Glassmorphism de alto nível).

Você foi contratado para criar um **CSS impecável, moderno e cinematográfico** para a área de Pokémons de uma aplicação Next.js chamada **PokeN** (um gerenciador de Pokémon Home e Living Dex com estética espacial e cibernética).

Seu foco é **exclusivamente visual e estilização CSS**. Você **não** precisa alterar a lógica React/TypeScript nem as regras de negócio dos componentes: seu objetivo é fornecer o código CSS para ser inserido no arquivo `app/globals.css`.

---

## 1. IDENTIDADE VISUAL E PALETA DE CORES DO PROJETO

- **Background Geral da Tela:** `#1D132D` (Roxo cósmico profundo espacial).
- **Cartões e Modais:** `rgba(2, 6, 23, 0.92)` / `rgba(15, 23, 42, 0.95)` com vidro fosco (`backdrop-filter: blur(16px)`).
- **Cores de Acento Principais:**
  - **Ciano Cibernético (Neon Cyan):** `#22D3EE` / `rgba(34, 211, 238)` — Usado em detalhes do sistema, foco de inputs, badges de tipo e destaques do modal de visualização/edição.
  - **Âmbar Dourado (Shiny / Registro):** `#FBBF24` / `rgba(251, 191, 36)` — Usado no botão de registrar pokémon, filtro shiny, estrelas e destaques nobres.
  - **Violeta Neon (Cosmic Violet):** `#8B5CF6` / `rgba(139, 92, 246)`.
  - **Cores de Feedback:**
    - Sucesso / Salvo: Esmeralda `#10B981` / `#34D399`
    - Perigo / Soltar: Rosa / Crimson `#F43F5E` / `#FB7185`
- **Estilo Geral:**
  - Linhas de contorno finas e precisas (`1px solid rgba(255, 255, 255, 0.1)` ou tons com brilho sutil `rgba(34, 211, 238, 0.3)`).
  - Brilhos sutis (glow / `box-shadow: 0 0 15px rgba(...)`).
  - Cantos arredondados modernos (`border-radius: 14px` a `24px`).
  - Tipografia limpa com números tabulares/mono para dados técnicos (`Lv`, `#004`, `Box 01`).
  - Efeito holográfico/containment bay para as imagens dos Pokémons.

---

## 2. OS 3 ELEMENTOS QUE VOCÊ IRÁ ESTILIZAR VIA CSS

### 🎯 Elemento 1: Barra de Pesquisa e Filtros (Control Bar)
Fica fixada no topo da página de Pokémons (`sticky top-0`). Contém:
- Campo de busca com ícone de lupa.
- Seletor de Jogo (`select`).
- Seletor de Ordenação (`select`).
- Botão alternador de "Apenas Shinies" (com estrela `✦`).
- Botão de ação "+ Registrar Pokémon".
- Linha de pills para filtragem por Tipos elementais (Todos, Grass, Fire, Water, etc.).
- Contador de espécimes visíveis e botão "Limpar filtros".

### 🎯 Elemento 2: Modal de Edição e Detalhes do Pokémon (`PokemonDetailModal`)
Abre ao clicar em qualquer Pokémon da grade. Contém:
- Header com número nacional (ex: `#004`), nome do Pokémon e tipos elementais (`fire / flying`).
- Botão de fechar `✕`.
- Área central de exibição do Sprite (com estrela shiny se aplicável).
- Indicador de localização atual (`Jogo • Box X • Slot Y`).
- Abas de navegação (`Visão Geral`, `Editar`, `Transferir`).
  - **Aba Visão Geral:** Linhas de dados técnicos (`InfoRow`) e lista de golpes (`Moveset`).
  - **Aba Editar:** Campo de apelido, Slider de Nível (1 a 100), botão liga/desliga Shiny, botão "Salvar Alterações" (ciano) e botão "Soltar Pokémon" (vermelho/crimson com confirmação).
  - **Aba Transferir:** Select do jogo de destino, input do box de destino e botão "Transferir para este Jogo".

### 🎯 Elemento 3: Modal de Registrar Pokémons (`AddPokemonModal`)
Abre ao clicar no botão "+ Registrar Pokémon". Contém:
- Header temático em tons de âmbar/dourado com subtítulo "Novo Espécime" e título "Registrar Pokémon".
- Área de preview do Sprite em tempo real com estado de carregamento pulsante ou mensagem de ajuda.
- Formulário com: Seletor de Jogo de Destino, Campo para digitar número ou nome do Pokémon, Campo de apelido opcional, Slider de Nível, botão alternador Shiny e botão final "Registrar Espécime".

---

## 3. CÓDIGO FONTE DOS COMPONENTES (PARA SUA REFERÊNCIA DE CLASSES E ESTRUTURA HTML)

### 📌 Código 1: Aba de Pesquisa e Filtragem (`ControlBar` em `components/PokemonGrid.tsx`)

```tsx
<div className="pokemon-control-bar sticky top-0 z-30 mb-1 rounded-2xl border border-white/10 bg-[#0D0817]/90 p-4 backdrop-blur-md">
  <div className="pokemon-control-bar-inner flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    
    {/* Bloco de Busca e Filtros Principais */}
    <div className="pokemon-control-filters flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
      
      {/* Campo de Busca */}
      <div className="pokemon-search-wrapper relative flex-1 sm:max-w-xs">
        <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" ... />
        <input
          type="text"
          value={search}
          placeholder="Buscar por nome ou apelido..."
          className="pokemon-search-input w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/50 focus:bg-white/10"
        />
      </div>

      {/* Select de Jogos */}
      <select
        value={activeGameId}
        className="pokemon-select pokemon-game-select rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
      >
        <option value="all">Todos os Jogos</option>
        {/* opções... */}
      </select>

      {/* Select de Ordenação */}
      <select
        value={sortKey}
        className="pokemon-select pokemon-sort-select rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50"
      >
        <option value="dex-asc">Dex (menor → maior)</option>
        <option value="dex-desc">Dex (maior → menor)</option>
        <option value="level-asc">Nível (menor → maior)</option>
        <option value="level-desc">Nível (maior → menor)</option>
        <option value="name-asc">Nome (A → Z)</option>
        <option value="name-desc">Nome (Z → A)</option>
      </select>

      {/* Botão Apenas Shinies */}
      <button
        className={`pokemon-shiny-toggle flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
          shinyOnly
            ? 'pokemon-shiny-active border-amber-300/60 bg-amber-300/15 text-amber-100'
            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
        }`}
      >
        <span>✦</span> Apenas Shinies
      </button>
    </div>

    {/* Botão Registrar Pokémon */}
    <button
      className="pokemon-add-trigger flex items-center justify-center gap-2 rounded-xl border border-amber-300/50 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100 transition hover:bg-amber-300/20"
    >
      <span className="text-lg leading-none">+</span> Registrar Pokémon
    </button>
  </div>

  {/* Pills de Tipos Elementais */}
  <div className="pokemon-type-filter-bar mt-3 flex flex-wrap items-center gap-2">
    <button className="pokemon-type-pill rounded-full border px-3 py-1 text-xs font-semibold capitalize transition pokemon-type-pill-active">
      Todos
    </button>
    {/* Pills de tipos (Grass, Fire, Water, etc.) recebem cor inline dinâmica via style={{ backgroundColor: `${color}33`, borderColor: `${color}99`, color }} */}
    <button className="pokemon-type-pill rounded-full border px-3 py-1 text-xs font-semibold capitalize transition">
      Fire
    </button>
  </div>

  {/* Linha de Status de Contagem & Limpar */}
  <div className="pokemon-control-status mt-3 flex items-center justify-between text-xs text-slate-400">
    <span>
      Exibindo <span className="font-semibold text-slate-200">9</span> de <span className="font-semibold text-slate-200">9</span> espécimes
    </span>
    <button className="pokemon-clear-filters-btn font-semibold text-cyan-300 hover:text-cyan-200">
      Limpar filtros
    </button>
  </div>
</div>
```

---

### 📌 Código 2: Modal de Edição dos Pokémons (`components/PokemonDetailModal.tsx`)

```tsx
<div
  className="pokemon-modal-overlay fixed inset-0 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
  style={{ zIndex: 2147483647 }}
>
  <div className="pokemon-modal-window pokemon-detail-modal-card relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-cyan-300/25 bg-slate-950/90 p-6 text-slate-100">
    
    {/* Header */}
    <div className="pokemon-modal-header flex items-start justify-between">
      <div>
        <p className="pokemon-modal-subtitle text-xs font-semibold uppercase tracking-wide text-cyan-300/70">
          #004
        </p>
        <h2 className="pokemon-modal-title text-2xl font-bold capitalize">
          charmander
        </h2>
        <p className="pokemon-modal-types text-sm text-cyan-200">
          fire
        </p>
      </div>
      <button className="pokemon-modal-close rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-slate-400 hover:text-slate-200">
        ✕
      </button>
    </div>

    {/* Imagem / Holograma do Pokémon */}
    <div className="pokemon-modal-sprite-wrap relative mx-auto my-4 w-40">
      <span className="pokemon-modal-shiny-indicator absolute -right-1 -top-1 text-lg text-amber-300">✦</span>
      <img src="..." alt="" className="pokemon-modal-sprite w-full object-contain" />
    </div>

    {/* Localização */}
    <p className="pokemon-modal-location text-center text-xs text-slate-400">
      Localização atual: <span className="font-semibold text-slate-200">Red</span> • Box 1 (Slot 4)
    </p>

    {/* Abas */}
    <div className="pokemon-modal-tabs mt-5 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
      <button className="pokemon-modal-tab-btn pokemon-tab-active rounded-lg py-1.5 text-xs font-bold transition bg-cyan-300/20 text-cyan-100">
        Visão Geral
      </button>
      <button className="pokemon-modal-tab-btn rounded-lg py-1.5 text-xs font-bold transition text-slate-400 hover:text-slate-200">
        Editar
      </button>
      <button className="pokemon-modal-tab-btn rounded-lg py-1.5 text-xs font-bold transition text-slate-400 hover:text-slate-200">
        Transferir
      </button>
    </div>

    <div className="pokemon-modal-body mt-5">
      {/* Conteúdo Aba Visão Geral */}
      <div className="space-y-3">
        <div className="pokemon-modal-info-row flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
          <span className="text-slate-400">Nível</span>
          <span className="font-semibold capitalize text-slate-100">5</span>
        </div>
        <div className="pokemon-modal-info-row flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
          <span className="text-slate-400">Apelido</span>
          <span className="font-semibold capitalize text-slate-100">—</span>
        </div>
        <div className="pokemon-modal-info-row flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm">
          <span className="text-slate-400">Shiny</span>
          <span className="font-semibold capitalize text-slate-100">Não</span>
        </div>
        <div className="pokemon-modal-moveset rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Moveset</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs capitalize text-slate-200">scratch</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs capitalize text-slate-200">growl</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Aba Editar */}
      <div className="space-y-4">
        <label className="pokemon-modal-field block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Apelido</span>
          <input type="text" className="pokemon-modal-input w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100" />
        </label>
        
        <label className="pokemon-modal-field block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nível (5)</span>
          <input type="range" min="1" max="100" className="pokemon-modal-slider w-full accent-cyan-300" />
        </label>

        <button className="pokemon-modal-shiny-btn flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition border-white/10 bg-white/5 text-slate-300">
          <span>✦ Forma Shiny</span>
          <span>Desativada</span>
        </button>

        <button className="pokemon-modal-save-btn w-full rounded-xl border border-cyan-300/50 bg-cyan-300/10 py-2.5 font-bold text-cyan-100 transition hover:bg-cyan-300/20">
          Salvar Alterações
        </button>
        <button className="pokemon-modal-delete-btn w-full rounded-xl border border-rose-400/50 bg-rose-400/10 py-2.5 font-bold text-rose-200 transition hover:bg-rose-400/20">
          Soltar Pokémon
        </button>
      </div>

      {/* Conteúdo Aba Transferir */}
      <div className="space-y-4">
        <label className="pokemon-modal-field block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Jogo de Destino</span>
          <select className="pokemon-modal-select w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50">...</select>
        </label>
        <label className="pokemon-modal-field block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Box de Destino</span>
          <input type="number" className="pokemon-modal-input w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100" />
        </label>
        <button className="pokemon-modal-transfer-btn w-full rounded-xl border border-amber-300/50 bg-amber-300/10 py-2.5 font-bold text-amber-100 transition hover:bg-amber-300/20">
          Transferir para este Jogo
        </button>
      </div>
    </div>

    <button className="pokemon-modal-close-btn mt-6 w-full rounded-xl border border-amber-300/50 bg-amber-300/10 py-2 font-bold text-amber-100">
      Fechar
    </button>
  </div>
</div>
```

---

### 📌 Código 3: Modal de Registrar Pokémons (`components/AddPokemonModal.tsx`)

```tsx
<div
  className="pokemon-modal-overlay fixed inset-0 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
  style={{ zIndex: 2147483647 }}
>
  <div className="pokemon-modal-window pokemon-add-modal-card relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-amber-300/25 bg-slate-950/90 p-6 text-slate-100">
    
    {/* Header com tom dourado */}
    <div className="pokemon-modal-header flex items-start justify-between">
      <div>
        <p className="pokemon-modal-subtitle text-xs font-semibold uppercase tracking-wide text-amber-300/70">
          Novo Espécime
        </p>
        <h2 className="pokemon-modal-title text-2xl font-bold">
          Registrar Pokémon
        </h2>
      </div>
      <button className="pokemon-modal-close rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-slate-400 hover:text-slate-200">
        ✕
      </button>
    </div>

    {/* Baia de Pré-visualização do Sprite */}
    <div className="pokemon-modal-preview my-4 flex h-32 items-center justify-center">
      <div className="pokemon-modal-sprite-wrap relative">
        <span className="pokemon-modal-shiny-indicator absolute -right-1 -top-1 text-lg text-amber-300">✦</span>
        <img src="..." alt="" className="pokemon-modal-sprite w-28 object-contain" />
      </div>
    </div>

    {/* Formulário */}
    <div className="pokemon-modal-form space-y-4">
      <label className="pokemon-modal-field block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Jogo de Destino</span>
        <select className="pokemon-modal-select w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/50">...</select>
      </label>

      <label className="pokemon-modal-field block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Número ou Nome da Espécie</span>
        <input type="text" placeholder="Ex: 25 ou pikachu" className="pokemon-modal-input w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-300/50" />
      </label>

      <label className="pokemon-modal-field block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Apelido (opcional)</span>
        <input type="text" placeholder="Sem apelido" className="pokemon-modal-input w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100" />
      </label>

      <label className="pokemon-modal-field block space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Nível (5)</span>
        <input type="range" min="1" max="100" className="pokemon-modal-slider w-full accent-amber-300" />
      </label>

      <button className="pokemon-modal-shiny-btn flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-semibold transition border-white/10 bg-white/5 text-slate-300">
        <span>✦ Forma Shiny</span>
        <span>Desativada</span>
      </button>

      <button className="pokemon-modal-submit-btn w-full rounded-xl border border-amber-300/50 bg-amber-300/10 py-2.5 font-bold text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-50">
        Registrar Espécime
      </button>
    </div>
  </div>
</div>
```

---

## 4. O QUE VOCÊ DEVE FAZER NO CSS

Crie um bloco completo e refinado de CSS para o arquivo `app/globals.css`. Ele deve conter:

1. **Estilização da Control Bar (`.pokemon-control-bar`):**
   - Fundo com gradiente sutil escuro de vidro (`rgba(13, 8, 23, 0.88)`), bordas iluminadas, sombra de profundidade (`box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5)`).
   - Estilização premium para os inputs (`.pokemon-search-input`) e selects (`.pokemon-select`): visual moderno, foco com halo neon sutil (`box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.25)`), ícone de seta customizado para os selects se apropriado.
   - Botão Shiny (`.pokemon-shiny-toggle` e `.pokemon-shiny-active`): destaque especial com brilho dourado e leve pulso ou gradiente dourado metálico.
   - Botão de Registrar (`.pokemon-add-trigger`): estilo botão cibernético com borda dourada âmbar, efeito hover com leve elevação (`translateY(-1px)`) e brilho suave.
   - Pills de Tipos (`.pokemon-type-pill` e `.pokemon-type-pill-active`): visual de cápsula moderna, feedback de hover suave e aura de brilho na cor do tipo quando ativo.

2. **Estilização dos Modais (`.pokemon-detail-modal-card` e `.pokemon-add-modal-card`):**
   - Superfície com bordas duplas sutis ou brilho perimetral (Ciano para o modal de detalhes, Dourado para o de adicionar).
   - Scrollbar customizada e elegante (`.pokemon-modal-window::-webkit-scrollbar`).
   - Pedestal / Baia holográfica para o sprite do Pokémon (`.pokemon-modal-sprite-wrap` e `.pokemon-modal-preview`): adicione um sutil brilho radial de fundo simulando um feixe holográfico ou plataforma cibernética.
   - Abas (`.pokemon-modal-tabs`, `.pokemon-modal-tab-btn`, `.pokemon-tab-active`): estilo switcher futurista com fundo escuro e botão ativo em destaque luminoso.
   - Sliders de nível (`.pokemon-modal-slider`): estilização de barra e knob (`::-webkit-slider-thumb`) de alta precisão com glow neon.
   - Botões de Ação:
     - Salvar (`.pokemon-modal-save-btn`): tema neon ciano.
     - Soltar (`.pokemon-modal-delete-btn`): tema danger crimson com efeito hover de alerta.
     - Transferir / Registrar (`.pokemon-modal-transfer-btn`, `.pokemon-modal-submit-btn`): tema âmbar de autorização.
   - Microinterações em hover e active (`transform: scale(0.99)`, transições fluidas de cor e sombra).

3. **Formato de Entrega:**
   - Retorne o código em um único bloco de CSS com comentários organizados por seção (ex: `/* 1. CONTROL BAR & FILTROS */`, `/* 2. MODAL BASE & JANELAS */`, etc.).
   - Certifique-se de que as regras sobrescrevam ou complementem harmonicamente as classes utilitárias do Tailwind existentes no código fornecido.
