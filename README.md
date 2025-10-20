# Chess Training System - Sistema Completo de Treinamento de Xadrez

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/frederico-kluser/opening-training)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-18.3.1-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.6.2-blue.svg)](https://www.typescriptlang.org/)

## 🎯 Visão Geral do Projeto

Sistema avançado de treinamento de xadrez com três módulos principais: **análise de partidas com IA**, **treinamento tático com puzzles personalizados** e **repertório de aberturas**. Agora com **Evaluation Bar em tempo real** e **validação inteligente de movimentos**.

### Funcionalidades Principais:

**1. Análise de Partidas com Stockfish 17** ✅
- Análise profunda de partidas (depth 18) com Stockfish WASM
- Importação de múltiplas partidas via PGN ou Chess.com
- **Importação direta via FEN** do Chess.com com barra de progresso
- Detecção automática do jogador mais frequente com badge 🎯
- Pré-seleção inteligente de partidas para análise
- Cálculo de ACPL (Average Centipawn Loss) separado por cor
- Classificação de movimentos em 6 categorias (brilliant, best, good, inaccuracy, mistake, blunder)
- **Exportação de análises completas** em formato JSON com todos os dados
- **Importação de análises salvas** com auto-salvamento de puzzles no localStorage
- Estatísticas detalhadas por cor (blunders, mistakes, inaccuracies)

**2. Sistema de Puzzles Táticos** 🎮
- Geração automática de puzzles a partir de blunders (>300cp)
- **🆕 Evaluation Bar em tempo real:** Veja a avaliação da posição mudando conforme você joga
- **🆕 Validação inteligente:** Aceita qualquer movimento que melhore a posição (não apenas um específico)
- **Três modos de treinamento:**
  - **Modo Normal:** Puzzles sem repetição, progresso linear
  - **Modo Rush:** 20 puzzles aleatórios com repetição permitida (treino intensivo)
  - **Modo Opening:** Foco em erros de abertura (apenas movimentos 1-10)
- **Sistema de contexto visual:** Mostra posição anterior por 1 segundo antes do puzzle
- **Avaliação progressiva:**
  - Mostra avaliação antes do movimento do oponente
  - Atualiza após seu movimento
  - Mostra transição ao desfazer movimento errado
- Feedback visual instantâneo com cores (verde #90EE90 / rosa #FFB6C1)
- Sistema de streaks e estatísticas globais persistentes
- **Máximo de 3 tentativas** com feedback progressivo
- Salvamento automático no localStorage

**3. Repertório de Aberturas** 📚
- Cadastro e edição de variantes personalizadas
- Treinamento interativo com posições aleatórias
- **Sistema de navegação em árvore** com suporte a múltiplas variantes
- Comentários personalizados por posição
- **Dica após 2 tentativas erradas** mostrando comentário da posição
- Import/Export em JSON
- Modo de edição e modo de treino com orientação automática do tabuleiro

**4. Interface e UX** 🎨
- **Tema escuro/claro** com toggle persistente (🌙/☀️)
- **🆕 Versão exibida automaticamente** no header (v1.0.0)
- **🆕 Interface home redesenhada:**
  - 3 cards principais focados (Analisar, Puzzles, Aberturas)
  - GitHub movido para footer com informação de licença
  - Layout mais limpo e objetivo
- **🆕 Navegação melhorada:**
  - Botões "← Voltar" visíveis em todos os treinamentos
  - Posicionados no topo direito para fácil acesso
- Design responsivo otimizado para mobile e tablets
- Transições suaves entre temas
- Persistência da preferência de tema no localStorage

## 📊 Status do Projeto

### ✅ Funcionalidades Implementadas:

#### **Análise de Partidas**
- ✅ Stockfish 17 WASM integrado (depth 18, timeout 10s)
- ✅ Importação de múltiplas partidas PGN com validação robusta
- ✅ Integração completa com Chess.com API (múltiplos endpoints)
- ✅ **Importação direta via FEN** do Chess.com com progresso em tempo real
- ✅ Detecção automática do jogador principal (sem threshold mínimo)
- ✅ Análise em lote com barra de progresso por partida
- ✅ Classificação detalhada: brilliant (<0cp), best (<10cp), good (<50cp), inaccuracy (<100cp), mistake (<300cp), blunder (≥300cp)
- ✅ Cálculo de ACPL separado por cor com estatísticas individuais
- ✅ **Exportação de análises** em JSON (formato: `chess-analysis-YYYY-MM-DD.json`)
- ✅ **Importação de análises** com auto-salvamento de puzzles

#### **Sistema de Puzzles**
- ✅ Geração automática de puzzles de blunders (>300cp, ignora primeiros 10 lances)
- ✅ **🆕 Evaluation Bar em tempo real:** Integração com Stockfish para mostrar avaliação
- ✅ **🆕 Validação baseada em avaliação:** Aceita qualquer movimento que melhore a posição
  - Para brancas: movimento correto se avaliação aumenta (mais positivo)
  - Para pretas: movimento correto se avaliação diminui (mais negativo)
- ✅ **🆕 Sistema de avaliação progressiva:**
  - Avalia posição de contexto (antes do movimento do oponente)
  - Avalia posição inicial (após movimento do oponente)
  - Avalia após movimento do jogador
  - Mostra transição ao desfazer movimento errado (800ms delay)
- ✅ **Modo Normal:** puzzles embaralhados sem repetição
- ✅ **Modo Rush:** 20 puzzles aleatórios com repetição (Fisher-Yates shuffle)
- ✅ **Modo Opening:** apenas erros de abertura (movimentos 1-10)
- ✅ Sistema de 3 tentativas com feedback progressivo
- ✅ **Contexto visual:** posição anterior mostrada por 1 segundo
- ✅ Feedback colorido com transição suave (0.5s)
- ✅ **🆕 Sistema de logs de debug:** Console logs detalhados para debugging
- ✅ Estatísticas globais persistentes no localStorage
- ✅ Timer em tempo real e contador de streak (máximo da sessão)
- ✅ Orientação automática do tabuleiro baseada na cor

**Modo Opening - Detalhes:**
- Filtragem automática de puzzles até o movimento 10
- Ideal para corrigir erros na fase de abertura
- Mantém sistema de 3 tentativas e feedback progressivo
- Prioriza puzzles não resolvidos, depois inclui todos
- Fisher-Yates shuffle para variedade no treinamento

#### **Repertório de Aberturas**
- ✅ Sistema completo de cadastro com navegação em árvore
- ✅ Modo treino com 20 posições aleatórias (Fisher-Yates)
- ✅ Navegação: Undo/Redo/Flip com atalhos de teclado
- ✅ Comentários personalizados por posição FEN
- ✅ **Dica automática após 2 erros** (mostra comentário)
- ✅ Import/Export JSON com validação TypeStorage
- ✅ Persistência completa no localStorage (key: `data`)
- ✅ Orientação automática baseada no turno

#### **Interface e Temas**
- ✅ **Sistema de tema escuro/claro** com toggle 🌙/☀️
- ✅ **🆕 Versão automática no header:** Importa versão do package.json dinamicamente
- ✅ **🆕 Interface home simplificada:**
  - Removidos botões: Chess.com e Stockfish Test (menos poluição visual)
  - 3 cards principais: Analisar Partidas, Treinar Puzzles, Treinar Aberturas
  - Estatísticas em card azul centralizado
  - GitHub no footer com versão e licença MIT
- ✅ **🆕 Navegação aprimorada:**
  - Botões "← Voltar" em todos os treinamentos
  - Posicionados no topo direito (header dos cards)
  - Sempre visíveis durante o treino
- ✅ Persistência da preferência de tema (localStorage: `darkMode`)
- ✅ Variáveis CSS customizáveis por tema
- ✅ Design responsivo para mobile e tablets
- ✅ Media queries otimizadas (@media para diferentes tamanhos)
- ✅ Transições suaves entre temas (0.3s ease)

### 🚧 Em Desenvolvimento:
- [ ] Sistema de spaced repetition com algoritmo SM-2
- [ ] Dashboard com gráficos de evolução temporal
- [ ] Filtros avançados para puzzles (por tipo de erro, cor, fase do jogo)
- [ ] Seleção de variante no Redo (múltiplas ramificações)
- [ ] Configuração customizável de depth/timeout do Stockfish
- [ ] Tratamento de rate limiting da API Chess.com

## 🚀 Como Usar

### Instalação

```bash
# Clone o repositório
git clone https://github.com/frederico-kluser/opening-training.git
cd opening-training

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

Acesse http://localhost:5173

### Fluxo de Uso

#### **1. Análise de Partidas**
1. Clique em "📊 Analisar Partidas"
2. Escolha uma opção:
   - **Importar PGN**: Cole suas partidas ou use o exemplo
   - **Chess.com**: Digite username e escolha:
     - Importar Todos (jogos do mês)
     - Importar Apenas Meus Jogos (filtra por username)
     - Importar Últimos 10 (importação rápida)
   - **♟️ Importar do Chess.com**: Importação direta via FEN com progresso
   - **📥 Importar Análise**: Carregue análises salvas (JSON)
3. Para múltiplas partidas:
   - Jogador mais frequente é detectado automaticamente (badge 🎯)
   - Partidas do jogador detectado são pré-selecionadas
   - Escolha a cor para análise (brancas ou pretas)
4. Aguarde a análise (depth 18, timeout 10s por posição)
5. Veja estatísticas separadas por cor (ACPL, erros)
6. **💾 Exportar Análise**: Salve para reutilizar depois
7. Puzzles são gerados automaticamente de blunders (>300cp)

#### **2. Treinamento de Puzzles**
1. Clique em "🧩 Treinar Puzzles"
2. Escolha o modo:
   - **Normal**: Puzzles embaralhados sem repetição, progresso linear
   - **Rush**: 20 puzzles aleatórios com repetição permitida
   - **Opening**: Apenas erros de abertura (movimentos 1-10) sem repetição
3. Observe o contexto (posição anterior por 1 segundo)
4. Resolva o puzzle (máximo 3 tentativas):
   - Feedback verde = correto
   - Feedback rosa = incorreto
   - Após 3 erros, avança automaticamente
5. Acompanhe suas estatísticas:
   - Progresso da sessão (X de Y)
   - Taxa de acerto e streak
   - Tentativas por puzzle
   - Timer em tempo real

#### **3. Repertório de Aberturas**
1. Clique em "📚 Repertório"
2. Opções disponíveis:
   - **Continuar**: Carrega dados salvos do localStorage
   - **Novo**: Cria novo repertório (limpa dados anteriores)
   - **Importar**: Carrega arquivo JSON com validação
3. **Modo Edição:**
   - Faça movimentos para criar variantes
   - Adicione comentários por posição
   - Use Undo/Redo para navegar na árvore
   - Exporte com botão Download
4. **Modo Treino:**
   - 20 posições aleatórias do repertório
   - Máximo 3 tentativas por posição
   - Dica automática após 2 erros (mostra comentário)
   - Orientação do tabuleiro automática

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.3.1** - Interface de usuário
- **TypeScript 5.6.2** - Type safety
- **Vite 5.4.10** - Build tool
- **React Bootstrap 2.10.5** - Componentes UI
- **React Icons 5.3.0** - Ícones

### Bibliotecas de Xadrez
- **chess.js 1.0.0-beta.8** - Engine de validação de movimentos
- **react-chessboard 4.7.2** - Tabuleiro interativo
- **Stockfish 17 WASM** - Engine de análise (integrado)

### Utilitários
- **uuid 13.0.0** - Identificadores únicos
- **events 3.3.0** - Event emitters

## 📋 Features Detalhadas

### Análise de Partidas
- **Importação Flexível**: PGN direto, arquivo .pgn, ou Chess.com API
- **Chess.com API Completa**:
  - 3 modos de importação (Todos/Meus Jogos/Últimos 10)
  - **Importação direta via FEN**: Extrai FENs de partidas em lote
  - Preview visual com badges coloridos por tipo
  - Barra de progresso em tempo real (X/Y partidas)
  - Estatísticas e ratings em tempo real
  - Múltiplos endpoints disponíveis (extended-archive, live/game)
- **Análise em Lote**: Processa múltiplas partidas com barra de progresso
- **Detecção Inteligente**: Identifica jogador mais frequente sem threshold mínimo
- **Pré-seleção Automática**: Badge 🎯 e seleção do jogador detectado
- **Classificação Precisa**:
  - Brilliant (< 0 cp loss) - Movimento excepcional
  - Best (< 10 cp loss) - Melhor movimento
  - Good (< 50 cp loss) - Movimento bom
  - Inaccuracy (< 100 cp loss) - Imprecisão
  - Mistake (< 300 cp loss) - Erro
  - Blunder (≥ 300 cp loss) - Grande erro
- **Exportação/Importação**:
  - Formato JSON completo com análises e puzzles
  - Auto-salvamento de puzzles ao importar
  - Nome padrão: `chess-analysis-YYYY-MM-DD.json`

### Sistema de Puzzles
- **Geração Inteligente**:
  - Apenas blunders >300cp viram puzzles
  - Ignora primeiros 10 lances (teoria)
  - Inclui contexto da posição anterior
- **🆕 Evaluation Bar em Tempo Real**:
  - Barra visual mostrando vantagem de brancas/pretas
  - Atualização em tempo real com Stockfish (depth 12)
  - Sequência de avaliações:
    1. Avalia `fenContext` (posição antes do oponente)
    2. Avalia `fenBefore` (posição inicial do puzzle)
    3. Avalia após movimento do jogador
    4. Restaura avaliação inicial após erro (800ms delay)
  - Fórmula de conversão: Lichess (centipawns → win percentage)
  - Animações suaves (0.6s cubic-bezier)
- **🆕 Validação Inteligente de Movimentos**:
  - Não compara com movimento específico pré-definido
  - Valida baseado em **melhoria da posição**:
    - **Brancas:** Correto se `newEval > oldEval` (mais positivo)
    - **Pretas:** Correto se `newEval < oldEval` (mais negativo)
  - Aceita múltiplas soluções corretas
  - Mais educativo: ensina a melhorar a posição, não decorar
- **Três Modos Distintos**:
  - **Normal**: Sem repetição, todos os puzzles uma vez
  - **Rush**: 20 puzzles com Fisher-Yates shuffle e repetição
  - **Opening**: Apenas erros de abertura (movimentos 1-10) sem repetição
- **Sistema de Tentativas**:
  - Máximo 3 tentativas com feedback progressivo
  - Auto-skip após 3 erros
- **Contexto Visual**:
  - Mostra `fenContext` por 1 segundo
  - Tabuleiro bloqueado durante preview
- **Feedback Colorido**:
  - Verde (#90EE90) com transição 0.5s para acerto
  - Rosa (#FFB6C1) com transição 0.5s para erro
- **🆕 Sistema de Debug**:
  - Logs detalhados no console do navegador
  - Mostra avaliações, conversões e comparações
  - Formato: 📊 AVALIAÇÃO, 🎯 MOVIMENTO, 🧮 Conversão
- **Estatísticas Completas**:
  - Taxa de acerto, streak máximo
  - Timer em tempo real
  - Persistência no localStorage

### Repertório de Aberturas
- **Editor Visual**:
  - Interface drag-and-drop para criar variantes
  - Suporte a múltiplas ramificações
  - Navegação com Undo/Redo
- **Estrutura em Árvore**:
  - TypeStorage com prevFen/nextFen[]
  - Comentários únicos por FEN
  - Validação completa na importação
- **Modo Treino Avançado**:
  - 20 posições com Fisher-Yates shuffle
  - Dica após 2 tentativas (mostra comentário)
  - Orientação automática por turno
- **Import/Export**:
  - JSON validado com TypeStorage
  - Download direto do navegador
  - Persistência em localStorage (key: `data`)


## 🏗️ Arquitetura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ChessBoard/      # Wrapper do tabuleiro
│   ├── ChessComImporter/# Importação Chess.com
│   ├── ChessGame/       # Tabuleiro interativo
│   ├── EvaluationBar/   # 🆕 Barra de avaliação em tempo real
│   │   ├── EvaluationBar.tsx      # Componente visual da barra
│   │   ├── evaluationUtils.ts     # Conversões e formatação
│   │   └── EvaluationBar.css      # Estilos Chess.com-like
│   ├── GameAnalyzer/    # Análise de partidas
│   ├── OpeningTrainer/  # Treino de aberturas
│   ├── PuzzleSession/   # Componentes de sessão
│   ├── PuzzleTrainer/   # Interface de puzzles
│   ├── StockfishTest/   # Teste do engine
│   ├── TrainingControls/# Controles de treino
│   ├── Download/        # Exportação JSON
│   ├── Gap/             # Espaçamento
│   └── Upload/          # Importação JSON
├── hooks/
│   └── useStockfish.ts  # Hook para Stockfish
├── Pages/
│   └── Register/        # Editor de repertório
├── services/
│   ├── ChessComService.ts    # API Chess.com
│   ├── OpeningTrainerService.ts # Lógica de treino
│   ├── PuzzleService.ts      # Gestão de puzzles
│   └── StockfishService.ts   # Engine de análise
├── stockfish/
│   ├── engine.ts        # Classe Engine
│   └── *.js/wasm        # Arquivos Stockfish
├── types/
│   ├── Puzzle.ts        # Interface Puzzle
│   └── TypeStorage.ts   # Schema repertório
├── utils/
│   ├── chessUtils.ts    # Utilidades xadrez
│   ├── pgnParser.ts     # Parser PGN
│   ├── timeUtils.ts     # Formatação tempo
│   └── isValidTypeStorage.ts
├── App.tsx              # Roteamento principal
└── main.tsx             # Entry point
```

## 📦 Estrutura de Dados

### Puzzle - Estrutura Completa
```typescript
interface Puzzle {
  id: string;              // UUID v4 único
  fenBefore: string;       // Posição antes do erro
  fenContext?: string;     // Posição anterior para contexto (NOVO)
  blunderMove: string;     // Movimento que foi um blunder
  solution: string;        // Movimento correto (UCI ou SAN)
  evaluation: number;      // CP loss do blunder
  moveNumber: number;      // Número do lance
  color: 'white' | 'black';
  dateCreated: string;     // ISO 8601
  attempts?: number;       // Contador de tentativas (max: 3)
  solved?: boolean;        // Status de resolução
  lastAttempt?: string;    // Último movimento tentado
}
```

### TypeStorage - Formato do Repertório
```typescript
interface TypeStorage {
  [abertura: string]: {
    [fen: string]: {
      prevFen: string;      // FEN anterior (para Undo)
      comment: string;      // Comentário da posição
      nextFen: string[];    // Próximas variantes (múltiplas)
    }
  }
}
```

### Formato de Exportação de Análise
```typescript
interface ExportedAnalysis {
  date: string;            // Data da exportação
  pgn: string;             // PGN original
  analysis: MoveAnalysis[]; // Análise detalhada de cada movimento
  blunders: Puzzle[];      // Puzzles gerados
  stats: {
    white: { acpl: number; blunders: number; mistakes: number; inaccuracies: number; };
    black: { acpl: number; blunders: number; mistakes: number; inaccuracies: number; };
  };
  selectedGames: GameSelection[]; // Partidas selecionadas
  parsedGames: ParsedGame[];      // Partidas parseadas
}
```

### 🆕 EvaluationBar - Componente de Avaliação
```typescript
// EvaluationBar.tsx
interface EvaluationBarProps {
  evaluation: number;      // Centipawns (+ brancas, - pretas)
  showNumeric?: boolean;   // Mostrar valor numérico (default: true)
  height?: number;         // Altura em pixels (default: 400)
  animated?: boolean;      // Animações suaves (default: true)
  loading?: boolean;       // Estado de carregamento
}

// evaluationUtils.ts
centipawnsToWinPercentage(cp: number): number
// Fórmula do Lichess: Win% = 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
// Retorna: 0-100 (porcentagem de vitória para brancas)

formatEvaluation(cp: number): string
// Formata: +2.5, -1.3, M#3
// Converte centipawns para pawns (divide por 100)

getEvaluationColor(cp: number): 'white' | 'black' | 'equal'
// Determina cor da avaliação (>50cp brancas, <-50cp pretas)
```

**Layout da Barra:**
- Parte branca (embaixo): altura proporcional à vantagem
- Parte preta (em cima): 100% - vantagem branca
- Linha central cinza: posição igual (0.0)
- Indicador de mate: badge fixo no topo/base
- Animação: `transition: height 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)`

## 🔧 Configuração Avançada

### Stockfish WASM
O Stockfish 17 está integrado via WASM com as seguintes configurações:

```typescript
// Em GameAnalyzer/index.tsx
const ANALYSIS_DEPTH = 18;     // Profundidade de análise (padrão: 18)

// Em StockfishService.ts
const ANALYSIS_TIMEOUT = 10000; // Timeout em ms (padrão: 10 segundos)
```

**Funcionalidades disponíveis:**
- Análise com depth configurável
- Skill level ajustável (0-20)
- Execução em Web Worker (não bloqueia UI)
- Detecção de mate convertida para ±100000 cp
- Principal Variation (PV) armazenada

### Proxy Vite para Chess.com
O projeto está configurado com proxy reverso para contornar CORS:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api/chess-com': {
      target: 'https://www.chess.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/chess-com/, '')
    }
  }
}
```

**Funcionalidades:**
- Contorna restrições de CORS da API Chess.com
- Permite acesso direto aos endpoints de callback
- Usado por `getExtendedArchiveGames()` e `getGameDetails()`

### localStorage - Chaves e Estruturas
Todos os dados são salvos automaticamente no navegador:

| Chave | Descrição | Estrutura |
|-------|-----------|-----------|
| `chess-puzzles` | Lista de puzzles gerados | `Puzzle[]` |
| `opening-training-stats` | Estatísticas do repertório | `TrainingStats` |
| `opening-training-session` | Sessão atual de treino | `TrainingSession` |
| `data` | Repertório de aberturas | `TypeStorage` |
| `darkMode` | Preferência de tema (escuro/claro) | `boolean` |

**Estatísticas do Repertório (TrainingStats):**
```typescript
{
  totalMoves: number;
  correctMoves: number;
  incorrectMoves: number;
  streak: number;
  maxStreak: number;
  sessionsCompleted: number;
  lastTrainingDate: string;
  averageAccuracy: number;
}
```

Para limpar todos os dados:
```javascript
localStorage.clear(); // Remove tudo
// Ou específico:
localStorage.removeItem('chess-puzzles');
```

## 🌐 Integração Chess.com API

### Endpoints Disponíveis
O sistema usa a API pública do Chess.com com os seguintes endpoints:

```javascript
// Base URL: https://api.chess.com/pub

getPlayerProfile(username)     // Perfil completo do jogador
getPlayerArchives(username)    // Lista de arquivos mensais
getMonthlyGames(username, year, month) // Jogos de um mês específico
getMonthlyPGN(username, year, month)   // PGN direto do mês
getLatestGames(username, count)        // Últimos N jogos
getAllGames(username, limit)           // Batch com paginação
getPlayerStats(username)               // Estatísticas e ratings

// Endpoints via Proxy (contornam CORS)
getExtendedArchiveGames(username, page) // Lista de partidas com IDs e FENs
getGameDetails(gameId)                  // Detalhes completos de uma partida
fetchGamesAndExtractFENs(username, page, onProgress) // Extrai FENs em lote
```

### Funcionalidades da Integração
- **Rate limiting:** Delay de 1s entre requisições batch
- **User-Agent customizado:** "ChessTrainingSystem/1.0"
- **Filtros disponíveis:**
  - Por controle de tempo (Bullet/Blitz/Rapid/Daily)
  - Apenas jogos ranqueados
- **Dados extras capturados:**
  - Accuracies (precisão de brancas/pretas)
  - Ratings de ambos jogadores
  - URLs das partidas

## ⚙️ Algoritmos e Utilitários

### Fisher-Yates Shuffle
Usado para embaralhamento verdadeiramente aleatório de puzzles e posições:

```typescript
// OpeningTrainerService.ts e PuzzleService.ts
for (let i = array.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [array[i], array[j]] = [array[j], array[i]];
}
```

### Conversão UCI ↔ SAN
Utilitários para compatibilidade entre Stockfish (UCI) e chess.js (SAN):

```typescript
// chessUtils.ts
convertUCItoSAN('e2e4', fen) // => 'e4'
moveToUCI('e2', 'e4', 'q')   // => 'e2e4q'
executeMove(game, from, to, promotion)
```

### Parser PGN Robusto
Validação e parsing de múltiplas partidas:

```typescript
// pgnParser.ts
validatePGN(pgn)              // Validação com mensagens específicas
extractGamesInfo(pgn)         // Extração de metadados
detectMostFrequentPlayer(games) // Detecção inteligente sem threshold
getPlayerColors(games, username) // Identificação de cores jogadas
```

### Cálculo de ACPL
Average Centipawn Loss por cor:

```typescript
// GameAnalyzer/index.tsx
const calculateACPL = (moves) => {
  const totalCPL = moves.reduce((sum, m) => sum + m.centipawnLoss, 0);
  return Math.round(totalCPL / moves.length);
};
```

## 🎨 Personalização Visual

### Sistema de Temas
O sistema suporta tema claro e escuro com variáveis CSS customizáveis:

```css
/* Tema Claro (padrão) */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-card: #ffffff;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #dee2e6;
  --shadow: rgba(0, 0, 0, 0.1);
  --gradient-start: #667eea;
  --gradient-end: #764ba2;
}

/* Tema Escuro */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --bg-card: #2d2d2d;
  --text-primary: #e0e0e0;
  --text-secondary: #a0a0a0;
  --border-color: #404040;
  --shadow: rgba(0, 0, 0, 0.3);
  --gradient-start: #4a5568;
  --gradient-end: #2d3748;
}
```

**Funcionalidades do Tema:**
- Toggle visual com ícones 🌙 (escuro) / ☀️ (claro)
- Transições suaves (0.3s ease) entre temas
- Persistência da preferência no localStorage
- Aplicação automática via `document.documentElement.setAttribute('data-theme')`
- Botão fixo no canto superior direito com efeitos hover

### Códigos de Cores
```css
/* Feedback de Movimentos */
--correct-bg: #90EE90;  /* Verde claro - movimento correto */
--incorrect-bg: #FFB6C1; /* Rosa claro - movimento incorreto */
--transition: 0.5s;      /* Duração da transição */

/* Badges de Tipo de Jogo */
--bullet-badge: danger;  /* Vermelho - Bullet */
--blitz-badge: warning;  /* Amarelo - Blitz */
--rapid-badge: primary;  /* Azul - Rapid */
```

### Responsividade Mobile
O sistema é totalmente responsivo com breakpoints otimizados:

```css
/* Tablets e smartphones */
@media (max-width: 768px) {
  .h2 { font-size: 1.5rem !important; }
  .card-body { padding: 1.25rem !important; }
  .theme-toggle { width: 45px; height: 45px; }
}

/* Smartphones pequenos */
@media (max-width: 576px) {
  .btn { font-size: 0.9rem !important; }
  .card-body h5 { font-size: 1rem !important; }
}

/* Tablets landscape */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .container-fluid { padding-top: 2rem !important; }
}
```

### Ícones Utilizados
- 🎯 Jogador detectado automaticamente
- 💾 Exportar análise
- 📥 Importar análise
- ♟️ Importar do Chess.com
- 🧩 Puzzles
- 📊 Análise
- 📚 Repertório
- ✅ Acerto
- ❌ Erro
- 🔥 Streak
- 💡 Dica
- 🌙 Tema escuro
- ☀️ Tema claro
- ♟️ Modo Opening

## 🚀 Roadmap Futuro

### Curto Prazo
- [ ] Sistema de spaced repetition com algoritmo SM-2
- [ ] Dashboard com gráficos de evolução temporal
- [ ] Filtros avançados para puzzles (por tipo de erro)
- [ ] Exportação de estatísticas em PDF

### Médio Prazo
- [ ] Integração com Lichess API
- [ ] Análise de padrões de erro recorrentes
- [ ] Sugestões personalizadas de estudo
- [ ] Modo multiplayer para competições

### Longo Prazo
- [ ] App mobile (React Native)
- [ ] Integração com engines alternativos (Leela, etc)
- [ ] Sistema de coaching com IA
- [ ] Marketplace de repertórios

## 🐛 Problemas Conhecidos e Limitações

### Problemas de Performance
- Performance pode degradar com >1000 puzzles salvos no localStorage
- Análise de partidas muito longas (>100 movimentos) pode ser lenta
- Re-embaralhamento frequente em bibliotecas pequenas de puzzles (<20)

### Limitações Técnicas
- Chess.com API tem limite de taxa (delay fixo de 1s entre requisições)
- Timeout do Stockfish fixo em 10 segundos (não configurável via UI)
- Seleção de cor exclusiva em múltiplas partidas (não permite analisar ambas)
- Redo sempre seleciona primeira variante (falta UI para escolher)
- Primeiros 10 lances são ignorados na geração de puzzles (teoria de abertura)

### TODOs Identificados no Código
- Implementar seleção de variante no Redo (Register/index.tsx:106)
- Adicionar configuração de depth/timeout do Stockfish via UI
- Implementar tratamento adequado de rate limiting Chess.com

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Convenção de Commits
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes

**Você pode:**
- ✅ Copiar e modificar o código
- ✅ Usar comercialmente
- ✅ Distribuir

**Você deve:**
- 📝 Dar créditos ao autor original
- 📝 Incluir a licença MIT em cópias

Copyright © 2025 Frederico Kluser

## 👥 Autor

**Frederico Kluser**
- GitHub: [@frederico-kluser](https://github.com/frederico-kluser)
- Projeto: [opening-training](https://github.com/frederico-kluser/opening-training)

## 🙏 Agradecimentos

- [Stockfish](https://stockfishchess.org/) - Engine de análise
- [Chess.js](https://github.com/jhlywa/chess.js) - Biblioteca de xadrez
- [React Chessboard](https://github.com/Clariity/react-chessboard) - Componente do tabuleiro
- [Chess.com](https://chess.com) - API de partidas

---

**Última atualização**: 20/10/2025 | **Versão**: 1.0.0 🎉

## 📝 Changelog

### v1.0.0 - Release Oficial (20/10/2025) 🎉

**🆕 Evaluation Bar em Tempo Real**
- ✅ Barra visual mostrando vantagem de brancas/pretas
- ✅ Integração com Stockfish (depth 12) para avaliação em tempo real
- ✅ Sequência progressiva de avaliações:
  - Avalia posição de contexto (antes do oponente)
  - Avalia posição inicial (após oponente)
  - Avalia após movimento do jogador
  - Mostra transição ao desfazer erro (800ms)
- ✅ Fórmula de conversão Lichess (centipawns → win percentage)
- ✅ Componente `EvaluationBar` com props configuráveis
- ✅ Utilities: `centipawnsToWinPercentage()`, `formatEvaluation()`

**🆕 Validação Inteligente de Movimentos**
- ✅ Não compara com movimento específico pré-definido
- ✅ Valida baseado em **melhoria da posição**:
  - Brancas: correto se avaliação aumenta (mais positivo)
  - Pretas: correto se avaliação diminui (mais negativo)
- ✅ Aceita múltiplas soluções corretas
- ✅ Mais educativo: ensina a melhorar, não decorar
- ✅ Logs de debug detalhados no console

**🎨 Interface e UX**
- ✅ **Versão automática no header:** Importa de `package.json`
- ✅ **Home redesenhada:**
  - Removidos: Chess.com e Stockfish Test
  - 3 cards principais: Analisar, Puzzles, Aberturas
  - GitHub movido para footer com licença
- ✅ **Navegação melhorada:**
  - Botões "← Voltar" em todos os treinamentos
  - Posicionados no topo direito (sempre visíveis)
- ✅ "Repertório" renomeado para "Treinar Aberturas"

**📄 Licença e Documentação**
- ✅ **Licença MIT adicionada:** Arquivo LICENSE criado
- ✅ Copyright © 2025 Frederico Kluser
- ✅ Permissões claras: pode copiar, modificar, usar comercialmente
- ✅ Requer: dar créditos ao autor original
- ✅ README completamente atualizado com novas features
- ✅ Badges adicionados (versão, licença, React, TypeScript)

**🔧 Melhorias Técnicas**
- ✅ TypeScript: declaração de módulos JSON em `vite-env.d.ts`
- ✅ Importação automática da versão do package.json
- ✅ Build otimizado: 2.54s (382KB JS, 237KB CSS)
- ✅ Todos os testes passando sem erros

---

### v3.2.0 (18/10/2025)
- ✅ Modo Opening - Treino focado em erros de abertura (movimentos 1-10)
- ✅ Novo método `getOpeningPuzzles()` no PuzzleService
- ✅ Filtro inteligente por moveNumber <= 10

### v3.1.0
- ✅ Sistema de tema escuro/claro com toggle persistente
- ✅ Importação direta via FEN do Chess.com
- ✅ Design responsivo melhorado

### v3.0.0
- ✅ Sistema de importação/exportação de análises
- ✅ Sistema de contexto visual para puzzles
- ✅ Modo Rush com 20 puzzles aleatórios
- ✅ Integração completa com Chess.com API