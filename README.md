# Chess Training System - Sistema Completo de Treinamento de Xadrez

## 🎯 Visão Geral do Projeto

Sistema de treinamento de xadrez com duas vertentes principais: **treino de aberturas personalizadas** e **análise de erros com geração automática de puzzles** baseados em partidas reais.

### Funcionalidades Principais:

**1. Sistema de Repertório de Aberturas** ✅
- Cadastro completo de aberturas e variantes
- Anotações personalizadas por posição
- Sistema de navegação em árvore/grafo
- Import/Export de repertórios em JSON

**2. Análise de Partidas com Stockfish** 🚀 (Nova Feature)
- Parser de PGN integrado
- Análise lance a lance com Stockfish 17
- Detecção automática de blunders/mistakes/inaccuracies
- Cálculo de ACPL (Average Centipawn Loss)
- Classificação de movimentos (brilliant/best/good/inaccuracy/mistake/blunder)

**3. Geração Automática de Puzzles** 🎮
- Criar puzzles dos próprios erros detectados
- Sistema de pontuação e feedback
- Armazenamento de puzzles para treino futuro
- Spaced repetition baseado em performance

## 📊 Status Atual do Projeto

### ✅ Base Sólida Implementada:
- **Interface de xadrez funcional** com react-chessboard
- **Lógica de xadrez completa** com chess.js
- **Sistema de armazenamento** de posições e comentários
- **Navegação entre posições** (undo/redo)
- **Persistência local** via localStorage
- **Upload/Download** de dados JSON

### 🚀 Pronto para Implementar (com código exemplo):
- **Engine Stockfish** preparado mas não integrado
- **GameAnalyzer Component** com análise completa
- **Detecção de blunders** e classificação de movimentos
- **Geração de puzzles** a partir dos erros

### ⚠️ Próximas Implementações:
- **PuzzleTrainer Component** para resolver puzzles
- **Integração Chess.com API** para importar partidas
- **Sistema de spaced repetition** para otimizar aprendizado
- **Dashboard de estatísticas** e progresso

## 🚀 NOVO ROADMAP - Foco em Análise de Erros

### **FASE 1: Integração do Stockfish** ✅ [1-2 dias]
**Objetivo**: Ter o engine funcionando e analisando posições

- [ ] Baixar e configurar Stockfish WASM em `/public`
- [ ] Criar `StockfishService.ts` com singleton pattern
- [ ] Implementar comunicação UCI via Web Workers
- [ ] Adicionar hook `useStockfish` para componentes
- [ ] Testar análise básica de posições

### **FASE 2: Analisador de Partidas** 🚀 [2-3 dias]
**Objetivo**: Analisar PGN e detectar erros automaticamente

- [ ] Implementar `GameAnalyzer` component (código fornecido)
- [ ] Parser de PGN com chess.js
- [ ] Análise lance a lance com classificação
- [ ] Cálculo de ACPL (Average Centipawn Loss)
- [ ] Interface para mostrar estatísticas

### **FASE 3: Geração de Puzzles** 🎮 [2-3 dias]
**Objetivo**: Criar puzzles dos erros detectados

- [ ] Detectar blunders (>300 centipawns loss)
- [ ] Gerar estrutura de puzzle com solução
- [ ] Salvar puzzles no localStorage
- [ ] Interface para listar puzzles gerados
- [ ] Exportar puzzles para compartilhar

### **FASE 4: Puzzle Trainer** 🧩 [3-4 dias]
**Objetivo**: Interface para resolver puzzles

- [ ] Componente `PuzzleTrainer`
- [ ] Sistema de feedback visual (verde/vermelho)
- [ ] Contador de acertos/erros
- [ ] Timer e pontuação
- [ ] Modo "Rush" com puzzles em sequência

### **FASE 5: Integração Chess.com** 🌐 [3-4 dias]
**Objetivo**: Importar partidas automaticamente

- [ ] Integrar API pública do Chess.com
- [ ] Buscar partidas por username
- [ ] Filtrar partidas recentes
- [ ] Análise em batch de múltiplas partidas
- [ ] Gerar relatório consolidado

### **FASE 6: Sistema de Repetição Espaçada** 📈 [4-5 dias]
**Objetivo**: Otimizar aprendizado com algoritmo SM-2

- [ ] Implementar algoritmo de repetição espaçada
- [ ] Tracking de performance por puzzle
- [ ] Calendário de revisão
- [ ] Notificações de puzzles para revisar
- [ ] Ajuste de dificuldade dinâmico

### **FASE 7: Dashboard e Estatísticas** 📊 [3-4 dias]
**Objetivo**: Visualizar progresso e insights

- [ ] Gráficos de evolução temporal
- [ ] Heatmap de tipos de erro
- [ ] Estatísticas por abertura
- [ ] Comparação antes/depois
- [ ] Exportar relatórios PDF

## 🛠️ Stack Tecnológico

[![React](https://img.shields.io/badge/React-18.3.1-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178c6)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4.10-646cff)](https://vitejs.dev)
[![Chess.js](https://img.shields.io/badge/Chess.js-1.0.0--beta.8-green)](https://github.com/jhlywa/chess.js)

### Bibliotecas de Xadrez
- **chess.js**: Validação de movimentos e regras
- **react-chessboard**: Tabuleiro interativo
- **Stockfish WASM**: Engine de análise (a ser integrado)

## 🚀 Setup Imediato - Passo a Passo

### 1️⃣ **Instalar Dependências** (2 minutos)
```bash
# Clone e instale
git clone https://github.com/seu-usuario/opening-training.git
cd opening-training
npm install

# Dependências adicionais para análise
npm install events uuid
npm install --save-dev @types/events @types/uuid
```

### 2️⃣ **Baixar Stockfish WASM** (5 minutos)
```bash
# Na pasta public
cd public
wget https://github.com/nmrugg/stockfish.js/raw/master/src/stockfish.wasm
wget https://github.com/nmrugg/stockfish.js/raw/master/src/stockfish.wasm.js
cd ..
```

### 3️⃣ **Criar Estrutura de Pastas** (1 minuto)
```bash
mkdir -p src/services
mkdir -p src/hooks
mkdir -p src/components/GameAnalyzer
```

### 4️⃣ **Iniciar Desenvolvimento** (Imediato)
```bash
npm run dev
# Acesse http://localhost:5173
```

## ✅ Checklist de Validação da POC

**O sistema está funcionando quando:**
- [ ] Stockfish carrega sem erros no console
- [ ] Consegue colar PGN e analisar
- [ ] Detecta blunders corretamente
- [ ] Gera puzzles dos erros
- [ ] Salva puzzles no localStorage

## 💻 Código de Exemplo - StockfishService.ts

```typescript
// src/services/StockfishService.ts
import EventEmitter from 'events';

interface StockfishAnalysis {
  bestMove: string;
  evaluation: number; // em centipawns
  depth: number;
  pv: string[]; // principal variation
}

class StockfishService extends EventEmitter {
  private worker: Worker | null = null;
  private isReady = false;
  private analysisCallbacks = new Map<string, (result: StockfishAnalysis) => void>();

  constructor() {
    super();
    this.initEngine();
  }

  private initEngine() {
    try {
      this.worker = new Worker('/stockfish.wasm.js');

      this.worker.onmessage = (e) => {
        const message = e.data;

        // Engine ready
        if (message === 'readyok') {
          this.isReady = true;
          this.emit('ready');
        }

        // Best move found
        if (message.startsWith('bestmove')) {
          const parts = message.split(' ');
          const bestMove = parts[1];
          const fen = this.getCurrentAnalysisFen();

          if (fen && this.analysisCallbacks.has(fen)) {
            const callback = this.analysisCallbacks.get(fen)!;
            callback({
              bestMove,
              evaluation: this.lastEvaluation || 0,
              depth: this.lastDepth || 0,
              pv: this.lastPV || []
            });
            this.analysisCallbacks.delete(fen);
          }
        }

        // Evaluation info
        if (message.startsWith('info')) {
          this.parseInfo(message);
        }
      };

      // Initialize UCI
      this.send('uci');
      this.send('isready');

    } catch (error) {
      console.error('Failed to initialize Stockfish:', error);
    }
  }

  private lastEvaluation = 0;
  private lastDepth = 0;
  private lastPV: string[] = [];
  private currentFen = '';

  private getCurrentAnalysisFen() {
    return this.currentFen;
  }

  private parseInfo(message: string) {
    // Parse depth
    const depthMatch = message.match(/depth (\d+)/);
    if (depthMatch) {
      this.lastDepth = parseInt(depthMatch[1]);
    }

    // Parse evaluation
    const cpMatch = message.match(/cp (-?\d+)/);
    if (cpMatch) {
      this.lastEvaluation = parseInt(cpMatch[1]);
    }

    // Parse mate
    const mateMatch = message.match(/mate (-?\d+)/);
    if (mateMatch) {
      const mateIn = parseInt(mateMatch[1]);
      this.lastEvaluation = mateIn > 0 ? 100000 - mateIn : -100000 + mateIn;
    }

    // Parse PV
    const pvMatch = message.match(/pv (.+)/);
    if (pvMatch) {
      this.lastPV = pvMatch[1].split(' ');
    }
  }

  private send(command: string) {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }

  async analyze(fen: string, depth: number = 15): Promise<StockfishAnalysis> {
    return new Promise((resolve) => {
      this.currentFen = fen;
      this.analysisCallbacks.set(fen, resolve);

      this.send(`position fen ${fen}`);
      this.send(`go depth ${depth}`);

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.analysisCallbacks.has(fen)) {
          this.analysisCallbacks.delete(fen);
          resolve({
            bestMove: '',
            evaluation: 0,
            depth: 0,
            pv: []
          });
        }
      }, 10000);
    });
  }

  setSkillLevel(level: number) {
    // 0-20, where 0 is weakest
    this.send(`setoption name Skill Level value ${level}`);
  }

  stop() {
    this.send('stop');
  }

  quit() {
    this.send('quit');
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Singleton instance
let stockfishInstance: StockfishService | null = null;

export const getStockfish = (): StockfishService => {
  if (!stockfishInstance) {
    stockfishInstance = new StockfishService();
  }
  return stockfishInstance;
};
```

## 🏗️ Arquitetura do Projeto

```
src/
├── components/        # Componentes React reutilizáveis
│   ├── ChessGame/    # Tabuleiro interativo
│   ├── Download/     # Exportação JSON
│   ├── Gap/          # Espaçamento
│   └── Upload/       # Importação JSON
├── Pages/
│   ├── Computer/     # ⚠️ Duplicado (precisa refatorar)
│   └── Register/     # Cadastro de variantes
├── stockfish/
│   └── engine.ts     # Classe Engine (não utilizada ainda)
├── types/
│   └── TypeStorage.ts # Schema de dados
├── utils/
│   └── isValidTypeStorage.ts
├── App.tsx           # Roteamento principal
└── main.tsx          # Entry point
```

## 📦 Estrutura de Dados

### TypeStorage - Formato do Repertório
```typescript
interface TypeStorage {
  [abertura: string]: {
    [fen: string]: {
      prevFen: string;      // Posição anterior
      comment: string;      // Anotações do usuário
      nextFen: string[];    // Próximas variantes
    }
  }
}
```

### Exemplo de dados reais:
```json
{
  "Caro-Kann": {
    "rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2": {
      "prevFen": "posição_anterior",
      "comment": "Defesa sólida contra e4",
      "nextFen": ["próxima_posição_1", "próxima_posição_2"]
    }
  }
}
```

## 🎯 Próximos Passos Imediatos

### DIA 1: Setup Stockfish
```bash
# Manhã: Baixar e configurar
cd public && wget https://github.com/nmrugg/stockfish.js/raw/master/src/stockfish.wasm.js
npm install events uuid

# Tarde: Implementar StockfishService
# Copiar código fornecido acima
# Testar análise básica
```

### DIA 2: GameAnalyzer Component
```bash
# Criar componente com código fornecido
# Adicionar rota no App.tsx
# Testar com PGN de exemplo
```

### DIA 3: PuzzleTrainer
```bash
# Implementar interface de puzzles
# Sistema de feedback visual
# Salvar progresso
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License

---

**Última atualização**: 03/01/2025