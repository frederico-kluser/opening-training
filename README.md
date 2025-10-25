<div align="center">

# ♟️ Chess Training System

### Sistema Completo de Treinamento de Xadrez com IA

[![Version](https://img.shields.io/badge/version-3.2.0-blue.svg)](https://github.com/frederico-kluser/opening-training)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.6.2-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node.js-18+-339933.svg?logo=node.js)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/vite-5.4.10-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Stockfish](https://img.shields.io/badge/stockfish-17-000000.svg)](https://stockfishchess.org/)

<p align="center">
  <strong>Análise de partidas com Stockfish 17 • Puzzles táticos inteligentes • Repertório de aberturas com sincronização automática</strong>
</p>

[Começar](#-quick-start) •
[Documentação](#-documentação-técnica) •
[Features](#-features-v300) •
[CLI Tool](#-cli-tool-análise-ultra-rápida) •
[Changelog](#-changelog)

---

</div>

## 🎯 Visão Geral

Plataforma completa para treino de xadrez que combina análise automatizada de partidas com **Stockfish 17**, geração inteligente de puzzles táticos personalizados e sistema avançado de repertório de aberturas. A **v3.2.0** adiciona sistema profissional de sons de movimento e funcionalidades avançadas de navegação.

### 🌟 Novidades da v3.2.0

- **🔊 Sistema de Sons Realísticos**: Sons profissionais de movimento estilo Lichess/Chess.com com Web Audio API
- **🎵 Sons para Todos os Movimentos**: Feedback auditivo para seus movimentos E dos adversários
- **🎯 Modal de Seleção de Variações**: Escolha entre múltiplos avanços cadastrados de forma intuitiva
- **📋 Exibição de FEN**: Copie o FEN atual com um clique em todos os modos
- **🎨 Sons Sintéticos Inteligentes**: Cliques realísticos tipo "peça batendo no tabuleiro"

### 🌟 Novidades da v3.1.1

- **✏️ Anotações Editáveis**: Edite comentários diretamente no modal com salvamento automático
- **🎯 Feedback Visual Completo**: Tabuleiro atualiza visualmente mesmo em movimentos incorretos
- **📱 Layout Ultra-Responsivo**: Botões com quebra automática, barra de avaliação adaptativa
- **🪟 Modal Minimizável**: Minimize anotações com botão flutuante para maximizar
- **🎨 Melhor Contraste**: Badge "Brancas" com texto escuro no tema dark (acessibilidade)

### 🌟 Destaques da v3.1.0

- **🔍 Zoom Avançado**: Controle total do tamanho do tabuleiro (até 1000px, 7 níveis)
- **📱 Barra Adaptativa**: Avaliação horizontal automática em telas portrait
- **💬 Comentários Contextuais**: Aparecem APÓS o movimento, não antes (melhor pedagogia)
- **🌙 Modais Dark**: Suporte completo ao tema escuro em todos os modais
- **🎨 Interface Limpa**: Barra de avaliação sem marcador numérico (visual mais limpo)

### 🌟 Destaques da v3.0.0

- **🚫 Sistema Anti-Dancing**: Algoritmo inteligente que evita repetição de posições recém-praticadas
- **🔄 Sincronização de Anotações**: Comentários compartilhados entre transposições (mesmo FEN)
- **🌓 Tema Dark Perfeito**: Contraste otimizado (WCAG AA) e 100% consistente
- **⚖️ Balanceamento Inteligente**: Posições menos vistas têm prioridade no treino
- **🎯 Validação Aprimorada**: Sistema que aceita qualquer movimento que melhore a posição
- **🔥 16.67x Mais Rápido**: Análise via CLI com Stockfish nativo e multi-threading
- **🌐 Integração Chess.com**: Download automático de partidas por username
- **📊 Evaluation Bar em Tempo Real**: Visualização da avaliação conforme você joga

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Features v3.1.0](#-features-v310)
- [CLI Tool - Análise Ultra-Rápida](#-cli-tool-análise-ultra-rápida)
- [Instalação](#-instalação)
- [Uso - Interface Web](#-uso---interface-web)
- [Uso - CLI](#-uso---cli)
- [Stack Tecnológico](#-stack-tecnológico)
- [Documentação Técnica](#-documentação-técnica)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [FAQ](#-faq)
- [Changelog](#-changelog)
- [Licença](#-licença)

---

## ⚡ Quick Start

```bash
# Clone o repositório
git clone https://github.com/frederico-kluser/opening-training.git
cd opening-training

# Instale as dependências
npm install

# Execute a interface web
npm run dev
# Acesse http://localhost:5173

# OU use a CLI ultra-rápida (requer Stockfish instalado)
npm run analyze:user hikaru
```

---

## ✨ Features v3.1.1

### ✏️ Anotações Editáveis com Salvamento Automático (NOVO v3.1.1!)

<details>
<summary><strong>Ver detalhes completos</strong></summary>

Sistema completo de edição e salvamento de anotações de posições durante o treino.

**Funcionalidades:**
- **Textarea editável** no modal de movimento correto (5 linhas)
- **Salvamento automático** ao avançar para próxima posição
- **Persistência** no OpeningService (localStorage)
- **Dicas em textarea somente leitura** no modal de erro
- **Limpeza de estados** ao avançar

**Exemplo de uso:**
1. Faça movimento correto
2. Modal aparece com textarea editável
3. Edite ou adicione suas anotações
4. Clique "Próximo Movimento" → salvo automaticamente

</details>

### 🎯 Feedback Visual Completo (NOVO v3.1.1!)

<details>
<summary><strong>Ver detalhes completos</strong></summary>

Tabuleiro agora mostra visualmente todos os movimentos antes da validação.

**Comportamentos:**
- **✅ Movimento correto**: Peça fica na posição + fundo verde + modal
- **❌ Movimento incorreto (1ª-2ª tentativa)**: Peça fica 2s + fundo vermelho + reset
- **❌ Movimento incorreto (3ª tentativa)**: Peça fica + fundo vermelho + modal com dica

**Benefícios:**
- Feedback visual imediato
- Usuário vê o erro cometido
- Melhor compreensão de movimentos incorretos
- Experiência mais natural e intuitiva

</details>

### 🪟 Modal Minimizável com Botão Flutuante (NOVO v3.1.1!)

<details>
<summary><strong>Ver detalhes completos</strong></summary>

Modal de anotações pode ser minimizado liberando espaço na tela.

**Funcionalidades:**
- **Botão minimizar** no header do modal (ícone `-`)
- **Modal fullscreen** para melhor visualização
- **Botão flutuante circular** no canto inferior direito quando minimizado
- **Restauração** com um clique no botão flutuante

**Design:**
- Botão flutuante: 60x60px, circular, com sombra
- Z-index 9999 para ficar sempre visível
- Ícone de maximizar para indicar ação
- Posicionamento fixo (não move com scroll)

</details>

### 📱 Layout Ultra-Responsivo (NOVO v3.1.1!)

<details>
<summary><strong>Ver detalhes completos</strong></summary>

Interface totalmente adaptável para todos os tamanhos de tela.

**Melhorias:**
- **Botões com quebra automática** (flexWrap em Gap horizontal)
- **Barra de avaliação responsiva** (largura adaptativa em portrait)
- **Texto "Analisando..." oculto** quando barra está horizontal
- **Header com flex-wrap** para quebrar em telas pequenas
- **Card.Body sem overflow** horizontal
- **Melhor contraste** no badge "Brancas" no tema dark

**Otimizações CSS:**
- `maxWidth: 90vw` na barra horizontal
- `overflowX: hidden` nos cards
- `flex-wrap gap-2` nos headers
- Badge com `text="dark"/"light"` para contraste

</details>

---

## ✨ Features v3.1.0

### 🔍 Sistema de Zoom Avançado (NOVO v3.1.0!)

<details>
<summary><strong>Ver detalhes completos</strong></summary>

Controle total do tamanho do tabuleiro com 7 níveis de zoom personalizáveis.

#### Níveis de Zoom Disponíveis
- **xs**: 350px (Extra pequeno)
- **sm**: 400px (Pequeno)
- **md**: 500px (Médio - padrão)
- **lg**: 600px (Grande)
- **xl**: 700px (Extra grande)
- **2xl**: 850px (2X grande)
- **3xl**: 1000px (3X grande)

#### Funcionalidades
- ✅ Botões de zoom em todas as telas de treino (Register, OpeningTrainer, PuzzleTrainer)
- ✅ Ícones intuitivos: 🔍+ (aumentar) e 🔍- (diminuir)
- ✅ Persistência no localStorage (preferência salva entre sessões)
- ✅ Responsivo: mantém `min(Npx, 90vw, 70vh)` para telas pequenas
- ✅ Estados desabilitados nos limites (xs mínimo, 3xl máximo)
- ✅ Hook customizado `useBoardSize` para fácil integração

#### Implementação
```typescript
const { boardWidth, zoomIn, zoomOut, canZoomIn, canZoomOut } = useBoardSize();
// boardWidth: "min(500px, 90vw, 70vh)" - pronto para usar!
```

</details>

### 📱 Barra de Avaliação Adaptativa (NOVO v3.1.0!)

<details>
<summary><strong>Ver detalhes completos</strong></summary>

Detecção automática de orientação da tela com barra horizontal em dispositivos portrait.

#### Comportamento Inteligente
**Tela Landscape (horizontal - desktop/tablet):**
- 📊 Barra vertical ao lado do tabuleiro
- ⬜ Brancas embaixo, ⬛ Pretas em cima

**Tela Portrait (vertical - celular em pé):**
- 📊 Barra horizontal acima do tabuleiro
- ⬜ Brancas à esquerda, ⬛ Pretas à direita

#### Funcionalidades
- ✅ Detecção automática via `useScreenOrientation` hook
- ✅ Listeners de resize e screen.orientation
- ✅ Transições suaves (GPU-accelerated)
- ✅ Linha central adaptativa (horizontal ou vertical)
- ✅ Suporte a `scaleX` e `scaleY` para performance
- ✅ CSS adaptativo para ambas orientações

#### Visual Limpo
- ❌ Removido marcador numérico de vantagem
- ✅ Apenas cores (branco/preto) para interface mais limpa
- ✅ Foco no visual, não em números

</details>

### 💬 Comentários Contextuais Melhorados (NOVO v3.1.0!)

<details>
<summary><strong>Ver detalhes completos</strong></summary>

Comentários agora aparecem no momento pedagogicamente correto: APÓS o movimento.

#### Antes (Problemático)
```
Posição → [Comentário da posição atual] → Usuário faz movimento
         ↑ Spoiler! O usuário lê antes de pensar
```

#### Depois (Correto)
```
Posição → Usuário faz movimento → [Comentário da posição alcançada]
                                   ↑ Explicação do que acabou de fazer
```

#### Comportamento
**Movimento Correto:**
- ✅ Modal aparece mostrando "📝 Anotações da Posição Alcançada"
- ✅ Exibe comentário do FEN resultante (não do FEN atual)
- ✅ Reforça aprendizado: "por que esse movimento é bom?"

**Movimento Errado (3 tentativas):**
- ✅ Modal aparece mostrando "💡 Dica para esta posição"
- ✅ Exibe comentário da posição atual como ajuda
- ✅ Contexto útil após falhar

**Durante o jogo:**
- ❌ Não mostra mais dicas antes do movimento
- ✅ Interface limpa, foco no raciocínio

</details>

### 🌙 Tema Dark para Modais (NOVO v3.1.0!)

<details>
<summary><strong>Ver detalhes completos</strong></summary>

Todos os modais agora respeitam o tema dark/light escolhido.

#### Correções Implementadas
- ✅ `modal-content`, `modal-header`, `modal-body`, `modal-footer` adaptados
- ✅ Cores de texto e fundo usando variáveis CSS (`--bg-card`, `--text-primary`)
- ✅ Bordas temáticas (`--border-color`)
- ✅ Backdrop mais escuro no tema dark (rgba(0,0,0,0.7))
- ✅ Botão de fechar (X) invertido no tema dark
- ✅ Títulos e parágrafos com cores corretas

#### Modais Afetados
- OpeningTrainer: Modal de anotações
- GameAnalyzer: Modais de seleção de cor, partidas, sucesso, Chess.com
- Todos os futuros modais do sistema

</details>

### 🚫 Sistema Anti-Dancing (v3.0.0)

<details>
<summary><strong>Ver detalhes completos</strong></summary>

O maior problema dos sistemas de treinamento de aberturas: **repetir as mesmas posições infinitamente** enquanto outras nunca aparecem.

#### O Problema do "Dancing"
```
Sessão 1: A → B → C → D → A → B → C → D
Sessão 2: A → B → C → D → A → B → C → D
                ↑
        Sempre as mesmas 4!
```

#### Nossa Solução: Algoritmo Inteligente

✅ **Rastreamento Temporal**: Sistema armazena quando cada posição foi vista pela última vez

✅ **Cooldown Adaptativo**: Posições recém-vistas têm prioridade reduzida (50% por padrão)

✅ **Balanceamento Estatístico**: Posições menos vistas têm 2x mais chance de aparecer

✅ **Decaimento Temporal**: Cooldown expira após 24h (configurável)

#### Algoritmo de Seleção

```typescript
// 1. Filtra posições treináveis
const trainable = positions.filter(pos => isUserTurn(pos));

// 2. Calcula scores baseado em:
//    - Tempo desde última visualização
//    - Contador de visualizações total
//    - Cooldown se visto recentemente
const scored = trainable.map(pos => ({
  position: pos,
  score: calculateScore(pos.fen, viewHistory)
}));

// 3. Weighted Random Selection
const selected = weightedSample(scored, count);
```

#### Resultados Comprovados

**Antes (v2.x):**
```
20 posições disponíveis → Sessão treina 8 delas repetidamente
```

**Depois (v3.0):**
```
20 posições disponíveis → Sessão treina 18 diferentes!
```

#### Configurações

| Parâmetro | Padrão | Descrição |
|-----------|--------|-----------|
| `recentPenalty` | 0.5 | Reduz score em 50% se vista recentemente |
| `cooldownHours` | 24 | Tempo até cooldown expirar |
| `lowFreqBoost` | 2.0 | Boost para posições pouco vistas |

📖 **Documentação completa:** [ANTI_DANCING_IMPLEMENTATION.md](docs/ANTI_DANCING_IMPLEMENTATION.md)

</details>

### 🔄 Sincronização de Anotações por FEN (NOVO!)

<details>
<summary><strong>Ver detalhes completos</strong></summary>

Em transposições, o mesmo FEN aparece em múltiplos caminhos. Agora as anotações são **verdadeiramente por posição**, não por caminho!

#### O Problema das Transposições

```
Caminho A: 1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Bf5
Caminho B: 1.e4 c6 2.Nc3 d5 3.d4 dxe4 4.Nxe4 Bf5
                                        ↑
                                  MESMO FEN!
```

**Antes (v2.x):** Anotar duas vezes, comentários inconsistentes
**Agora (v3.0):** Anotar uma vez, sincroniza automaticamente!

#### Features

✅ **População Automática**: Ao chegar em FEN sem anotação, busca em duplicatas

✅ **Sincronização em Tempo Real**: Editar comentário atualiza todos os FENs iguais

✅ **Normalização Inteligente**: Compara FENs ignorando contadores de movimentos

✅ **Logs Detalhados**: Console mostra quantas posições foram sincronizadas

#### Exemplo de Uso

```typescript
// 1. Você anota o Caminho A:
"4...Bf5 - Variante Clássica ⚔️"

// 2. Navega pelo Caminho B até mesma posição
// ✅ Comentário aparece automaticamente!

// 3. Edita o comentário:
"Variante Clássica - Cuidado com Bg4!"

// ✅ Console mostra:
📝 Comentário sincronizado em 2 FEN(s) duplicados
```

#### Utilitários Disponíveis

```typescript
// Buscar FENs duplicados
findDuplicateFens(variant, targetFen, storage): string[]

// Buscar comentário de duplicata
findCommentForFen(variant, targetFen, storage): string

// Sincronizar comentário
syncCommentToAllFens(variant, targetFen, comment, storage): TypeStorage

// Popular comentário vazio
populateEmptyComment(variant, targetFen, storage): [TypeStorage, string]

// Relatório de transposições
logTranspositionsReport(variant, storage): void
```

📖 **Guia completo:** [FEN_SYNC_SOLUTION.md](FEN_SYNC_SOLUTION.md)
📖 **Exemplo visual:** [TRANSPOSITION_EXAMPLE.md](TRANSPOSITION_EXAMPLE.md)

</details>

### 🌓 Tema Dark Totalmente Funcional (NOVO!)

<details>
<summary><strong>Ver detalhes</strong></summary>

Tema escuro completamente refatorado com contraste otimizado para todas as situações.

#### Melhorias Implementadas

✅ **Contraste WCAG AA**: Todos os textos atendem ou excedem 4.5:1 (pequeno) e 3:1 (grande)

✅ **Alerts Temáticos**: 4 variantes (warning, info, danger, success) otimizadas para dark mode

✅ **Placeholders Visíveis**: Cor de placeholder ajustada para `#b8b8b8` (contraste 5.1:1)

✅ **Forms Consistentes**: Inputs, selects, textareas totalmente adaptados

✅ **Badges Inteligentes**: Substituídos `light/dark` por `success/danger` (evita conflitos)

✅ **Títulos e Labels**: Todos respeitam variável `--text-primary`

#### Variáveis CSS

```css
/* Light Theme */
--bg-primary: #ffffff;
--bg-card: #ffffff;
--text-primary: #212529;
--text-secondary: #6c757d;

/* Dark Theme */
--bg-primary: #1a1a1a;
--bg-card: #2d2d2d;
--text-primary: #e0e0e0;
--text-secondary: #b8b8b8; /* Melhorado de #a0a0a0 */
```

#### Componentes Adaptados

- ✅ Todos os cards
- ✅ Evaluation Bar
- ✅ Forms (inputs, textareas, selects)
- ✅ Alerts (warning, info, danger, success)
- ✅ Tables
- ✅ ListGroup items
- ✅ Placeholders
- ✅ Modal de anotações

</details>

### ⚖️ Balanceamento Inteligente de Posições

<details>
<summary><strong>Ver detalhes</strong></summary>

Sistema estatístico que garante distribuição equilibrada de posições no treino.

#### Features

✅ **Contador de Visualizações**: Rastreia quantas vezes cada posição foi vista

✅ **Prioridade Baseada em Frequência**: Posições menos vistas têm 2x mais chance

✅ **Histórico Persistente**: Salvo no localStorage (`position-view-history`)

✅ **Weighted Random Sampling**: Seleção probabilística, não determinística

#### Algoritmo

```typescript
// Score base = 1000
let score = 1000;

// Penalidade por visualizações
const viewCount = viewHistory[fen]?.count || 0;
score /= Math.log2(viewCount + 2);

// Boost para posições pouco vistas
if (viewCount < 3) {
  score *= 2.0; // lowFreqBoost
}

// Cooldown temporal
const lastSeen = viewHistory[fen]?.lastSeen;
if (lastSeen && isRecent(lastSeen)) {
  score *= 0.5; // recentPenalty
}
```

</details>

### 🎯 Validação de Turnos (NOVO!)

<details>
<summary><strong>Ver detalhes</strong></summary>

Sistema que garante que apenas posições do turno correto aparecem no treino.

#### Validação Tripla

✅ **1. Geração**: Filtra posições onde é o turno do usuário
```typescript
const isUserTurn = (fen.turn === 'w' && color === 'white') ||
                   (fen.turn === 'b' && color === 'black');
```

✅ **2. Carregamento**: Valida novamente antes de mostrar posição
```typescript
if (currentTurn !== expectedTurn) {
  console.error('Cor errada detectada! Pulando...');
  skipToNextPosition();
}
```

✅ **3. Drag & Drop**: Só permite arrastar peças da cor do usuário
```typescript
canDragPiece({ piece, sourceSquare }) {
  const pieceColor = piece[0] === 'w' ? 'white' : 'black';
  return pieceColor === session.openingColor;
}
```

#### Logs de Debug

```javascript
✅ Posição válida! Cor correta: white
❌ ERRO: Posição com cor errada detectada!
   expectedColor: white
   actualTurn: black
   ⏭️ Pulando posição automaticamente...
```

</details>

### 📝 Modal de Anotações (NOVO!)

<details>
<summary><strong>Ver detalhes</strong></summary>

Modal que exibe anotações após cada movimento no treino de aberturas.

#### Features

✅ **Exibição Automática**: Aparece após movimento correto ou 3 erros

✅ **Backdrop Estático**: Não fecha clicando fora (garante leitura)

✅ **Keyboard Disabled**: Não fecha com ESC (evita pular acidentalmente)

✅ **Botão Destacado**: "Próximo Movimento →" em tamanho grande

✅ **Contexto Visual**: Mostra se foi correto (✅) ou esgotou tentativas (❌)

#### Tipos de Modal

**Correto:**
```
✅ Movimento Correto!
📝 Anotações do Movimento:
"4...Bf5 - Variante Clássica. Desenvolve peça e ataca cavalo."

[Próximo Movimento →]
```

**Falhado:**
```
❌ Fim das Tentativas
📝 Anotações do Movimento:
"4...Bf5 - Variante Clássica. Desenvolve peça e ataca cavalo."

⚠️ Você esgotou as 3 tentativas. Revise esta posição!

[Próximo Movimento →]
```

</details>

### 📊 Análise de Partidas com Stockfish 17

<details>
<summary><strong>Ver detalhes</strong></summary>

#### Interface Web (WASM)
- ✅ Análise profunda (depth 18) com Stockfish WASM
- ✅ Importação de múltiplas partidas via PGN ou Chess.com
- ✅ **Importação direta via FEN** com barra de progresso
- ✅ Detecção automática do jogador mais frequente (badge 🎯)
- ✅ Pré-seleção inteligente de partidas para análise
- ✅ Cálculo de **ACPL** (Average Centipawn Loss) separado por cor
- ✅ Classificação em **6 categorias**:
  - 💎 **Brilliant** (< 0 cp loss)
  - ✨ **Best** (< 10 cp loss)
  - ✅ **Good** (< 50 cp loss)
  - ⚠️ **Inaccuracy** (< 100 cp loss)
  - ❌ **Mistake** (< 300 cp loss)
  - 💥 **Blunder** (≥ 300 cp loss)
- ✅ **Exportação/Importação** de análises em JSON
- ✅ Auto-salvamento de puzzles no localStorage

#### CLI Tool (Native)
- ✅ **16.67x mais rápido** com Stockfish nativo
- ✅ Multi-threading completo
- ✅ Download automático Chess.com
- ✅ Feedback em tempo real com barra de progresso
- ✅ Output compatível com interface web

</details>

### 🧩 Sistema de Puzzles Táticos Inteligentes

<details>
<summary><strong>Ver detalhes</strong></summary>

#### Geração Automática
- ✅ Puzzles criados a partir de **blunders** (> 100cp - configurável)
- ✅ **Analisa TODOS os movimentos** (incluindo aberturas!)
- ✅ Sistema de contexto visual (mostra posição anterior)

#### Evaluation Bar em Tempo Real
- ✅ Barra visual mostrando vantagem de brancas/pretas
- ✅ Integração com Stockfish (depth 20) para avaliação em tempo real
- ✅ Fórmula de conversão Lichess (centipawns → win percentage)
- ✅ Animações suaves (0.6s cubic-bezier)
- ✅ Suporte a mate (M#X)

#### Validação Inteligente de Movimentos
- ✅ **Não compara com movimento específico pré-definido**
- ✅ Valida baseado em **melhoria da posição**:
  - **Brancas**: Correto se avaliação aumenta (mais positivo)
  - **Pretas**: Correto se avaliação diminui (mais negativo)
- ✅ Aceita **múltiplas soluções corretas**
- ✅ Mais educativo: ensina a melhorar, não decorar

#### Três Modos de Treinamento
- **🎯 Modo Normal**: Puzzles embaralhados sem repetição
- **⚡ Modo Rush**: 20 puzzles aleatórios com repetição (treino intensivo)
- **♟️ Modo Opening**: Foco em erros de abertura (movimentos 1-10)

#### Sistema de Tentativas e Feedback
- ✅ Máximo **3 tentativas** com feedback progressivo
- ✅ Auto-skip após 3 erros
- ✅ Feedback colorido com transição suave
- ✅ Estatísticas globais persistentes

</details>

### 📚 Repertório de Aberturas v2.0

<details>
<summary><strong>Ver detalhes</strong></summary>

#### Cadastro e Edição
- ✅ **Escolha de cor** (branco/preto) no cadastro
- ✅ **Orientação automática** do tabuleiro pela cor escolhida
- ✅ Sistema de navegação em árvore com múltiplas variantes
- ✅ **Sincronização de comentários** em transposições (v3.0!)
- ✅ Undo/Redo com histórico em memória
- ✅ Import/Export em JSON com validação
- ✅ Persistência completa no localStorage

#### Modo Treino Personalizado
- ✅ **Sistema Anti-Dancing** com balanceamento inteligente (v3.0!)
- ✅ **Validação de turnos** (v3.0!)
- ✅ **Modal de anotações** (v3.0!)
- ✅ **Respeita a cor escolhida** no cadastro
- ✅ **Mostra movimento do oponente** primeiro (quando aplicável)
- ✅ 20 posições com weighted random sampling
- ✅ Máximo 3 tentativas por posição
- ✅ **Dica automática após 2 erros** (mostra comentário)
- ✅ Orientação automática do tabuleiro

#### Estrutura de Dados v2.0

```typescript
interface Opening {
  id: string;
  name: string;
  description?: string;
  color: 'white' | 'black';  // Cor escolhida
  dateCreated: string;
  lastModified: string;
  positions: {
    [fen: string]: {
      prevFen: string;
      comment: string;      // Sincronizado entre transposições!
      nextFen: string[];
    };
  };
  stats?: {
    totalPositions: number;
    correctMoves: number;
    incorrectMoves: number;
    accuracy: number;
    timesCompleted: number;
  };
}
```

</details>

---

## 🚀 CLI Tool: Análise Ultra-Rápida

### 16.67x Mais Rápido que WASM!

Analise suas partidas usando **Stockfish nativo** diretamente no terminal com multi-threading completo.

#### Performance Comparativa

| Método | Velocidade | Tempo (40 movimentos) | Speedup |
|--------|------------|----------------------|---------|
| **WASM (Browser)** | 900 knodes/s | ~10 minutos | 1x |
| **Native 1 thread** | 1,500 knodes/s | ~6 minutos | 1.67x |
| **Native 16 threads** | **15,000 knodes/s** | **~36 segundos** | **16.67x** ⚡ |

#### Uso da CLI

```bash
# Analisar arquivo PGN local
npm run analyze partidas.pgn

# Download automático do Chess.com
npm run analyze:user SEU_USUARIO

# Exemplos com jogadores famosos
npm run analyze:user hikaru
npm run analyze:user MagnusCarlsen
npm run analyze:user GothamChess

# Com opções personalizadas
npm run analyze:user hikaru -- --months 6 --depth 20 --threshold 150 --threads 8
```

#### Opções Disponíveis

| Opção | Descrição | Padrão |
|-------|-----------|--------|
| `--username` | Usuário Chess.com | - |
| `--months` | Meses a baixar | 3 |
| `--depth` | Profundidade Stockfish | 18 |
| `--threshold` | CP mínimo para puzzle | 100 |
| `--threads` | Threads CPU | Todos |
| `--output` | Arquivo de saída | puzzles-output.json |
| `--verbose, -v` | Modo debug detalhado | false |

📖 **Documentação CLI completa:** [scripts/README.md](scripts/README.md)

---

## 🛠️ Instalação

### Pré-requisitos

- **Node.js** 18+ e npm
- **Navegador moderno** com suporte a Web Workers (para interface web)
- **Stockfish nativo** (opcional, apenas para CLI ultra-rápida)

### Interface Web

```bash
# Clone o repositório
git clone https://github.com/frederico-kluser/opening-training.git
cd opening-training

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm run preview
```

Acesse http://localhost:5173

### CLI Tool (Análise Ultra-Rápida)

#### macOS (Homebrew)
```bash
brew install stockfish
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt install stockfish
```

#### Linux (Fedora)
```bash
sudo dnf install stockfish
```

#### Windows
1. Baixe de https://stockfishchess.org/download/
2. Adicione ao PATH do sistema

---

## 📖 Uso - Interface Web

### 1. Análise de Partidas

1. Clique em **"📊 Analisar Partidas"**
2. Escolha uma opção de importação:
   - **Importar PGN**: Cole suas partidas
   - **Chess.com**: Digite username e escolha modo
   - **Importar Análise**: Carregue análises salvas (JSON)
3. Para múltiplas partidas:
   - Jogador mais frequente detectado automaticamente (badge 🎯)
   - Partidas pré-selecionadas
   - Escolha a cor para análise
4. Aguarde a análise (depth 18)
5. **💾 Exportar Análise** para reutilizar depois

### 2. Treinamento de Puzzles

1. Clique em **"🧩 Treinar Puzzles"**
2. Escolha o modo: Normal, Rush ou Opening
3. Observe o contexto (posição anterior por 1 segundo)
4. Resolva o puzzle (máximo 3 tentativas)
5. Acompanhe evaluation bar em tempo real

### 3. Repertório de Aberturas

1. Clique em **"📚 Treinar Aberturas"**
2. **Modo Edição**:
   - Faça movimentos para criar variantes
   - **Escolha a cor** (branco/preto)
   - Adicione comentários por posição
   - **Comentários sincronizam** em transposições automaticamente!
   - Use Undo/Redo
   - Exporte com botão Download
3. **Modo Treino**:
   - **Sistema Anti-Dancing** garante variedade
   - **Balanceamento inteligente** de posições
   - Máximo 3 tentativas
   - **Modal de anotações** após cada movimento
   - Dica após 2 erros

---

## 🏗️ Stack Tecnológico

### Frontend

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 18.3.1 | Interface de usuário |
| **TypeScript** | 5.6.2 | Type safety |
| **Vite** | 5.4.10 | Build tool |
| **React Bootstrap** | 2.10.5 | Componentes UI |
| **Bootstrap** | 5.3.3 | CSS framework |
| **React Icons** | 5.3.0 | Ícones |

### Bibliotecas de Xadrez

| Biblioteca | Versão | Uso |
|------------|--------|-----|
| **chess.js** | 1.0.0-beta.8 | Engine de validação de movimentos |
| **react-chessboard** | 4.7.2 | Tabuleiro interativo |
| **Stockfish 17 WASM** | 17 | Engine de análise (browser) |

### Backend/CLI

| Tecnologia | Uso |
|------------|-----|
| **Node.js** | Runtime para CLI tool |
| **Stockfish Native** | Engine de análise (nativo) |
| **Chess.com Public API** | Download de partidas |

---

## 📚 Documentação Técnica

### Documentação Principal

- 📖 **[TECH_STACK.md](TECH_STACK.md)** - Stack tecnológico completo e avaliação de bibliotecas
- 📖 **[scripts/README.md](scripts/README.md)** - Documentação completa da CLI (6000+ palavras)
- 📖 **[PERFORMANCE_ANALYSIS.md](PERFORMANCE_ANALYSIS.md)** - Análise de performance WASM vs Native

### Documentação v3.0.0 (NOVO!)

- 📖 **[ANTI_DANCING_IMPLEMENTATION.md](docs/ANTI_DANCING_IMPLEMENTATION.md)** - Sistema Anti-Dancing
- 📖 **[FEN_SYNC_SOLUTION.md](FEN_SYNC_SOLUTION.md)** - Sincronização de anotações por FEN
- 📖 **[TRANSPOSITION_EXAMPLE.md](TRANSPOSITION_EXAMPLE.md)** - Exemplo visual de transposições
- 📖 **[OPENING_ANNOTATIONS_ANALYSIS.md](OPENING_ANNOTATIONS_ANALYSIS.md)** - Análise profunda do sistema de anotações
- 📖 **[REFACTORING_GUIDE.md](docs/REFACTORING_GUIDE.md)** - Guia de refatoração e boas práticas

---

## 🚀 Roadmap

### v3.1.0 - Q2 2025

- [ ] **Setas no Tabuleiro**: Implementar `customArrows` para indicar variantes
- [ ] **Highlights de Casas**: Destacar casa de origem/destino
- [ ] **Breadcrumb de Navegação**: Mostrar caminho completo na edição
- [ ] **Estatísticas de Transposições**: Quantas posições têm duplicatas
- [ ] **Export melhorado**: PGN com anotações

### v3.2.0 - Q3 2025

- [ ] **Sistema de Spaced Repetition** com algoritmo SM-2
- [ ] **Dashboard com gráficos** de evolução temporal
- [ ] **Filtros avançados** para puzzles (tipo, cor, fase, rating)
- [ ] **Configuração de Stockfish** via UI
- [ ] **Temas customizáveis** (cores, peças)

### v3.3.0 - Q4 2025

- [ ] **Integração com Lichess API**
- [ ] **Análise de padrões** de erro recorrentes
- [ ] **Sistema de tags** para puzzles
- [ ] **Modo multiplayer** para competições

### v4.0.0 - 2026

- [ ] **App mobile** (React Native)
- [ ] **Integração com Leela Chess Zero**
- [ ] **Sistema de coaching** com IA
- [ ] **Marketplace de repertórios**
- [ ] **Backend próprio** (Node.js + PostgreSQL)

---

## 🤝 Contribuindo

Contribuições são muito bem-vindas! Este projeto é open-source e cresce com a comunidade.

### Como Contribuir

1. **Fork** o projeto
2. Crie uma **feature branch**: `git checkout -b feature/MinhaNovaFeature`
3. **Commit** suas mudanças: `git commit -m 'feat: adiciona nova funcionalidade'`
4. **Push** para a branch: `git push origin feature/MinhaNovaFeature`
5. Abra um **Pull Request**

### Convenção de Commits

Seguimos a [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração de código
- `perf:` Melhoria de performance
- `test:` Adição de testes

---

## ❓ FAQ

<details>
<summary><strong>Ver perguntas frequentes</strong></summary>

**P: O projeto é gratuito?**
R: Sim! Totalmente gratuito e open-source sob licença MIT.

**P: Preciso criar uma conta?**
R: Não! Tudo funciona localmente no seu navegador usando localStorage.

**P: Meus dados são enviados para algum servidor?**
R: Não! Tudo roda 100% localmente. A única conexão externa é para a API pública do Chess.com.

**P: Por que a análise web é lenta?**
R: A versão web usa Stockfish WASM que é ~16x mais lento que nativo. Use a CLI tool para análise rápida!

**P: Como funciona o Sistema Anti-Dancing?**
R: Algoritmo que rastreia visualizações e aplica cooldown temporal + balanceamento estatístico. Veja [ANTI_DANCING_IMPLEMENTATION.md](docs/ANTI_DANCING_IMPLEMENTATION.md).

**P: Como sincronizar anotações em transposições?**
R: Automático! Ao anotar uma posição, todas as ocorrências do mesmo FEN recebem a anotação. Veja [FEN_SYNC_SOLUTION.md](FEN_SYNC_SOLUTION.md).

</details>

---

## 📝 Changelog

### [v3.2.0](https://github.com/frederico-kluser/opening-training/releases/tag/v3.2.0) - 2025-10-24 🔊

#### ✨ Sistema de Sons Profissional

**🔊 SoundService com Web Audio API**
- ✅ Serviço completo de áudio (`src/services/SoundService.ts`) usando Web Audio API
- ✅ Sons sintéticos realísticos tipo "clique" (peça batendo no tabuleiro)
- ✅ Geração de ruído branco com filtro passa-banda para som natural
- ✅ Envelope de decaimento exponencial para sons orgânicos
- ✅ Persistência de preferências no localStorage (volume, ativado/desativado)
- ✅ Controle de volume (0.0 a 1.0) configurável

**🎵 Tipos de Sons Implementados**
- ✅ `playMoveSound()` - Clique agudo em 800Hz (movimento normal)
- ✅ `playCaptureSound()` - Clique grave em 600Hz (captura)
- ✅ `playCheckSound()` - Tom sustentado em 600Hz (xeque)
- ✅ `playCorrectSound()` - Feedback positivo (tons duplos ascendentes)
- ✅ `playIncorrectSound()` - Feedback negativo (tom descendente)
- ✅ `playSuccessSound()` - Som de vitória (sequência de 3 tons)

**🎮 Integração Completa em Todos os Modos**
- ✅ **Modo Edição (Register)**: Som ao mover peças, capturar e dar xeque
- ✅ **Modo Treinamento (OpeningTrainer)**:
  - Som nos movimentos do jogador (movimento, captura, xeque)
  - Som automático nos movimentos do adversário
  - Feedback sonoro ao acertar/errar
- ✅ **Modo Puzzles (PuzzleTrainer)**:
  - Som ao mover e capturar
  - Som de sucesso ao resolver puzzle
  - Som de erro ao falhar

#### 🎯 Modal de Seleção de Variações

**📋 MoveSelectionModal Component**
- ✅ Novo componente `src/components/MoveSelectionModal/index.tsx`
- ✅ Modal que aparece quando há múltiplos avanços possíveis
- ✅ Lista interativa de movimentos em notação SAN (ex: e4, Nf3, O-O)
- ✅ Detecção automática do movimento a partir de FENs
- ✅ Backdrop estático para evitar cliques acidentais
- ✅ Botões grandes e clicáveis para cada variação

**🔀 Integração no Modo Edição**
- ✅ Função `handleRedo()` atualizada com detecção de múltiplos avanços
- ✅ Se 1 avanço: navega diretamente (comportamento anterior mantido)
- ✅ Se 2+ avanços: abre modal para seleção
- ✅ Estados gerenciados: `showMoveSelectionModal`, `availableMoves`

#### 📋 Exibição de FEN em Todos os Modos

**💾 Campo FEN Clicável**
- ✅ Campo de texto somente leitura com FEN atual
- ✅ Clique para selecionar e copiar automaticamente
- ✅ Fonte monoespaçada para melhor legibilidade
- ✅ Tooltip informativo: "Clique para copiar o FEN"
- ✅ Mensagem de ajuda: "Clique para copiar o FEN para a área de transferência"
- ✅ Estilo otimizado: fundo cinza claro, cursor pointer, 12px

**🎯 Integração Completa**
- ✅ **Register (Edição)**: Campo após comentários (`src/Pages/Register/index.tsx:349-376`)
- ✅ **OpeningTrainer (Treino)**: Campo após controles (`src/components/OpeningTrainer/index.tsx:727-752`)
- ✅ **PuzzleTrainer (Puzzles)**: Campo após controles (`src/components/PuzzleTrainer/index.tsx:672-697`)

#### 🔧 Melhorias Técnicas

**Arquivos Criados (3)**
- ✅ `src/services/SoundService.ts` - Serviço de áudio completo (~200 linhas)
- ✅ `src/components/MoveSelectionModal/index.tsx` - Modal de seleção de variações
- ✅ `public/sounds/` - Diretório para sons (vazio, sons são sintéticos)

**Arquivos Modificados (4)**
- ✅ `src/Pages/Register/index.tsx` - Import SoundService, sons nos movimentos, campo FEN, modal de seleção
- ✅ `src/components/OpeningTrainer/index.tsx` - Import SoundService, sons em movimentos (jogador e adversário), feedback, campo FEN
- ✅ `src/components/PuzzleTrainer/index.tsx` - Import SoundService, sons em puzzles, campo FEN
- ✅ `package.json` - Versão atualizada para 3.2.0

#### 🎨 Características Técnicas Avançadas

**Web Audio API**
- ✅ AudioContext para síntese de som
- ✅ BiquadFilter (bandpass) para filtrar frequências
- ✅ BufferSource para playback de ruído gerado
- ✅ Envelope ADSR simples para naturalidade
- ✅ Síntese procedural de cliques (sem arquivos externos)

**Performance**
- ✅ Sons gerados em tempo real (zero latência)
- ✅ Nenhum arquivo de áudio externo necessário
- ✅ ~5KB de código JavaScript apenas
- ✅ Funciona 100% offline

**Compatibilidade**
- ✅ Todos os navegadores modernos com Web Audio API
- ✅ Política de autoplay respeitada (resume on interaction)
- ✅ Fallback gracioso se áudio não disponível

---

### [v3.1.1](https://github.com/frederico-kluser/opening-training/releases/tag/v3.1.1) - 2025-10-24 ✏️

#### ✨ Melhorias de Interatividade e UX

**✏️ Sistema de Anotações Editáveis**
- ✅ Modal com `Form.Control as="textarea"` editável (5 linhas)
- ✅ Estado `editableComment` para edição em tempo real
- ✅ Salvamento automático ao clicar em "Próximo Movimento"
- ✅ Integração com `OpeningService` para persistência
- ✅ Campo somente leitura para dicas (modal de erro)
- ✅ Mensagem informativa: "💡 Suas anotações serão salvas automaticamente ao avançar"
- ✅ Limpeza de estados ao avançar (`editableComment`, `reachedPositionFen`)

**🎯 Feedback Visual de Movimentos**
- ✅ Tabuleiro atualiza visualmente ANTES da validação
- ✅ Movimento correto: peça fica na nova posição + fundo verde + modal
- ✅ Movimento incorreto: peça fica na nova posição + fundo vermelho por 2s
- ✅ Reset automático após erro (1ª e 2ª tentativa)
- ✅ Mantém posição visível no modal de erro (3ª tentativa)
- ✅ Lógica melhorada em `onDrop`: move primeiro, valida depois
- ✅ Retorna `true` para atualizar o tabuleiro visualmente

**📱 Melhorias de Responsividade**
- ✅ Componente `Gap` com `flexWrap: 'wrap'` em modo horizontal
- ✅ Botões de treino quebram linha automaticamente em telas pequenas
- ✅ Header com `flex-wrap gap-2` para melhor adaptação
- ✅ Card.Body com `overflowX: 'hidden'` para prevenir scroll horizontal
- ✅ Container do tabuleiro com `maxWidth: '100%'`
- ✅ Barra de avaliação com altura adaptativa: `Math.min(500, window.innerWidth * 0.85)`
- ✅ Texto "Analisando..." oculto quando barra está horizontal (portrait)

**🪟 Modal Minimizável com Botão Flutuante**
- ✅ Estado `isModalMinimized` para controlar minimização
- ✅ Modal com prop `fullscreen` para ocupar tela inteira
- ✅ Botão de minimizar (`FaWindowMinimize`) no header do modal
- ✅ Modal.show atualizado: `showAnnotationModal && !isModalMinimized`
- ✅ Botão flutuante circular para maximizar (canto inferior direito)
- ✅ Estilização: `position: fixed`, `borderRadius: 50%`, `zIndex: 9999`
- ✅ Ícone `FaWindowMaximize` para restaurar modal
- ✅ Reset do estado ao fechar modal

**🎨 Melhorias de Acessibilidade**
- ✅ Badge "Brancas" com `text="dark"` para contraste no tema dark
- ✅ Badge "Pretas" com `text="light"` para legibilidade
- ✅ Label de cor com `opacity: 0.8` ao invés de `text-muted` (funciona em ambos os temas)
- ✅ Melhor contraste visual em componentes de estatísticas

#### 🔧 Melhorias Técnicas
- 6 arquivos modificados (~320 linhas modificadas)
- 3 novos estados: `editableComment`, `reachedPositionFen`, `isModalMinimized`
- Nova função `handleSaveComment` para persistência
- Importado componente `Form` do react-bootstrap
- Refatoração de `onDrop` para melhor fluxo visual
- Refatoração de `handleIncorrectMove` com reset de posição

---

### [v3.1.0](https://github.com/frederico-kluser/opening-training/releases/tag/v3.1.0) - 2025-01-24 🎨

#### ✨ Melhorias de UX e Interface

**🔍 Sistema de Zoom Avançado**
- ✅ 7 níveis de zoom (350px a 1000px)
- ✅ Botões de zoom em Register, OpeningTrainer e PuzzleTrainer
- ✅ Hook customizado `useBoardSize` com persistência no localStorage
- ✅ Ícones intuitivos: 🔍+ (aumentar) e 🔍- (diminuir)
- ✅ Estados desabilitados nos limites (xs e 3xl)
- ✅ Responsivo: `min(Npx, 90vw, 70vh)`

**📱 Barra de Avaliação Adaptativa**
- ✅ Detecção automática de orientação da tela
- ✅ Hook `useScreenOrientation` com listeners de resize e screen.orientation
- ✅ Barra horizontal automática em telas portrait (celular em pé)
- ✅ Barra vertical em telas landscape (desktop/tablet)
- ✅ Transform scaleX/scaleY para performance (GPU-accelerated)
- ✅ Linha central adaptativa (horizontal ou vertical)
- ✅ CSS adaptativo em `EvaluationBar.css`
- ✅ Removido marcador numérico (interface mais limpa)

**💬 Timing Correto de Comentários**
- ✅ Estado `reachedPositionComment` para armazenar comentário da posição alcançada
- ✅ onDrop modificado para buscar comentário do FEN resultante
- ✅ Modal de movimento correto mostra comentário da posição alcançada
- ✅ Modal de movimento errado (3 tentativas) mostra comentário como dica
- ✅ Removida exibição de dica antes do movimento (UI limpa)
- ✅ Limpeza de estado ao avançar para próxima posição
- ✅ Pedagogicamente correto: comentário APÓS ação, não antes

**🌙 Tema Dark para Modais**
- ✅ Estilos adaptados em `App.css` para `.modal-content`, `.modal-header`, `.modal-body`, `.modal-footer`
- ✅ Variáveis CSS respeitadas (`--bg-card`, `--text-primary`, `--border-color`)
- ✅ Backdrop escuro no tema dark: `rgba(0,0,0,0.7)`
- ✅ Botão de fechar (X) invertido no tema dark
- ✅ Títulos e parágrafos com cores corretas
- ✅ Todos os modais do sistema (OpeningTrainer, GameAnalyzer) funcionais

#### 🔧 Melhorias Técnicas
- 12 arquivos modificados (+517 linhas, -68 linhas)
- 2 novos hooks: `useBoardSize.ts` e `useScreenOrientation.ts`
- Modificação em ChessBoardWrapper para aceitar `width` prop
- Atualização de NavigationBar e PuzzleControls com botões de zoom
- CSS responsivo para orientações vertical e horizontal

---

### [v3.0.0](https://github.com/frederico-kluser/opening-training/releases/tag/v3.0.0) - 2025-01-24 🚀

#### 🎉 Features Revolucionárias

**🚫 Sistema Anti-Dancing**
- ✅ Algoritmo inteligente que evita repetição de posições recém-vistas
- ✅ Rastreamento temporal com cooldown adaptativo (24h padrão)
- ✅ Balanceamento estatístico (posições menos vistas têm 2x prioridade)
- ✅ Weighted random sampling para seleção natural
- ✅ Persistência em localStorage (`position-view-history`)
- ✅ Documentação completa: [ANTI_DANCING_IMPLEMENTATION.md](docs/ANTI_DANCING_IMPLEMENTATION.md)

**🔄 Sincronização de Anotações por FEN**
- ✅ Comentários compartilhados entre transposições (mesmo FEN)
- ✅ População automática de comentários vazios de duplicatas
- ✅ Sincronização em tempo real ao editar
- ✅ Normalização inteligente de FEN (ignora contadores)
- ✅ Biblioteca `fenSyncUtils.ts` com 6 funções utilitárias
- ✅ Logs detalhados no console
- ✅ Documentação: [FEN_SYNC_SOLUTION.md](FEN_SYNC_SOLUTION.md)

**🌓 Tema Dark Totalmente Funcional**
- ✅ Contraste otimizado WCAG AA (todos os textos ≥4.5:1)
- ✅ Alerts temáticos (warning, info, danger, success) para dark mode
- ✅ Placeholders visíveis (#b8b8b8 - contraste 5.1:1)
- ✅ Forms 100% adaptados (inputs, selects, textareas)
- ✅ Badges inteligentes (substituídos light/dark por success/danger)
- ✅ Variável `--text-secondary` melhorada: #a0a0a0 → #b8b8b8

**⚖️ Balanceamento Inteligente de Posições**
- ✅ Contador de visualizações por FEN
- ✅ Prioridade baseada em frequência (baixa = 2x chance)
- ✅ Integração com sistema anti-dancing
- ✅ Histórico persistente em localStorage

**🎯 Validação de Turnos**
- ✅ Validação tripla: geração, carregamento, drag & drop
- ✅ Auto-skip de posições com cor errada
- ✅ Logs de debug detalhados
- ✅ Restrição de peças arrastáveis ao jogador correto

**📝 Modal de Anotações**
- ✅ Exibição automática após movimento correto ou 3 erros
- ✅ Backdrop estático (garante leitura)
- ✅ Keyboard disabled (evita pular acidentalmente)
- ✅ Contexto visual (✅ correto / ❌ esgotou tentativas)

**🎨 Melhorias de UX**
- ✅ Orientação automática do tabuleiro pela cor escolhida
- ✅ Sincronização automática de cor ao alterar seleção
- ✅ Evaluation bar não reseta ao digitar comentários
- ✅ Placeholder de comentários visível no dark mode

#### 🔧 Refatorações Técnicas

- ✅ Biblioteca `trainerUtils.ts` expandida com balanceamento
- ✅ Biblioteca `fenSyncUtils.ts` (nova) para sincronização
- ✅ Função `recordPositionShown()` para rastreamento
- ✅ Função `applyAntiDancing()` para seleção ponderada
- ✅ CSS modular para tema dark (50+ regras)
- ✅ TypeScript strict mode em novos arquivos

#### 📚 Documentação Expandida

- ✅ [TECH_STACK.md](TECH_STACK.md) - Stack completo + avaliação de libs
- ✅ [ANTI_DANCING_IMPLEMENTATION.md](docs/ANTI_DANCING_IMPLEMENTATION.md) - Sistema anti-dancing
- ✅ [FEN_SYNC_SOLUTION.md](FEN_SYNC_SOLUTION.md) - Sincronização de anotações
- ✅ [TRANSPOSITION_EXAMPLE.md](TRANSPOSITION_EXAMPLE.md) - Exemplo visual
- ✅ [OPENING_ANNOTATIONS_ANALYSIS.md](OPENING_ANNOTATIONS_ANALYSIS.md) - Análise profunda
- ✅ [REFACTORING_GUIDE.md](docs/REFACTORING_GUIDE.md) - Guia de refatoração
- ✅ README.md completamente reescrito (3.0.0)

#### 🐛 Correções

- ✅ Barra de avaliação não reseta mais ao digitar comentários
- ✅ Tema dark 100% consistente em todos os componentes
- ✅ Badges não conflitam mais com background escuro
- ✅ Placeholders legíveis em ambos os temas
- ✅ Forms funcionam perfeitamente no dark mode

#### ⚡ Performance

- ✅ Weighted sampling otimizado com memoization
- ✅ localStorage usage reduzido (normalização de FEN)
- ✅ Menos re-renders ao editar comentários

---

### [v2.1.2] - 2025-10-20

- 🐛 Parser PGN corrigido (comentários com timestamps)
- 🆕 Modo verbose para debug (`--verbose`)
- 📚 Documentação expandida

### [v2.1.0] - 2025-10-20

- 🚀 CLI Tool ultra-rápida (16.67x speedup)
- 📚 Sistema de Aberturas v2.0
- 🎨 Interface home redesenhada

### [v1.0.0] - 2025-10-20

- 🆕 Evaluation Bar em tempo real
- 🆕 Validação inteligente de movimentos
- 📄 Licença MIT

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

### O que você pode fazer:

- ✅ **Usar comercialmente**
- ✅ **Modificar** o código
- ✅ **Distribuir** cópias
- ✅ **Uso privado**

---

## 👥 Autor

**Frederico Kluser**

- GitHub: [@frederico-kluser](https://github.com/frederico-kluser)
- Projeto: [opening-training](https://github.com/frederico-kluser/opening-training)

---

## 🙏 Agradecimentos

Este projeto não seria possível sem:

- **[Stockfish](https://stockfishchess.org/)** - O mais forte engine de xadrez open-source
- **[Chess.js](https://github.com/jhlywa/chess.js)** - Biblioteca JavaScript para validação de movimentos
- **[React Chessboard](https://github.com/Clariity/react-chessboard)** - Componente React do tabuleiro
- **[Chess.com](https://chess.com)** - API pública para download de partidas
- **[Lichess](https://lichess.org)** - Fórmula de conversão de evaluation bar

---

<div align="center">

**Desenvolvido com ♟️ por Frederico Kluser**

⭐ **Se este projeto te ajudou, considere dar uma estrela!** ⭐

[⬆ Voltar ao topo](#-chess-training-system)

---

**Última atualização**: 24/10/2025 | **Versão**: 3.2.0 🔊

</div>
