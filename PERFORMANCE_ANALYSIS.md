# Análise de Performance - Sistema de Análise de Partidas com Stockfish

**Data**: 2025-01-20
**Versão**: 2.0.0
**Objetivo**: Avaliar se análise de partidas pode ser mais rápida usando Node.js nativo vs WASM no navegador

---

## 📊 Benchmarks de Performance

### Comparação WASM vs Native Stockfish

| Implementação | Performance (knodes/s) | Velocidade Relativa |
|---------------|------------------------|---------------------|
| **Browser WASM** (single-thread) | 900 | 1x (baseline) |
| **Stockfish Nativo** (1 thread) | 1,500 | **1.67x mais rápido** |
| **Stockfish Nativo** (16 threads) | 15,000 | **16.67x mais rápido** |

**Fonte**: [Lichess Forum - Browser vs UCI Stockfish](https://lichess.org/forum/game-analysis/lichess-browser-stockfish-vs-uci-stockfish-speed)

### Performance Geral: WASM vs Native em Node.js

- **Native Node.js modules**: 1.75x - 2.5x mais rápidos que WASM
- **WASM**: Melhor portabilidade, mas menor performance bruta

**Fonte**: [WASM and Native Node Module Performance Comparison](https://nickb.dev/blog/wasm-and-native-node-module-performance-comparison/)

---

## 🔍 Análise da Situação Atual

### Nossa Implementação (v2.0.0)

**Tecnologia Atual**:
- ✅ React (frontend)
- ✅ Stockfish WASM (via hooks/useStockfish)
- ✅ Análise roda no navegador (single-thread limitado)
- ✅ Interface visual em tempo real

**Limitações**:
- ⚠️ **Performance**: ~900 knodes/s (baseline)
- ⚠️ **Single-thread**: Limitado a 1 thread no browser
- ⚠️ **Recursos**: Usa recursos do browser do usuário
- ⚠️ **Análise profunda**: Demorada para partidas longas

---

## 🚀 Soluções Propostas

### Opção 1: Servidor Local Node.js com Stockfish Nativo
**Performance esperada**: **15-16x mais rápido** (multi-thread)

#### Arquitetura

```
┌─────────────────────────────────────────┐
│  React Frontend (Browser)               │
│  - Interface visual                     │
│  - Upload de PGN                        │
│  - Visualização de resultados           │
└────────────┬────────────────────────────┘
             │ HTTP/WebSocket
             ▼
┌─────────────────────────────────────────┐
│  Node.js Backend (Local Server)         │
│  - Express API                          │
│  - Job Queue                            │
│  - Stockfish UCI via node-uci           │
└────────────┬────────────────────────────┘
             │ UCI Protocol
             ▼
┌─────────────────────────────────────────┐
│  Stockfish Native Binary                │
│  - Multi-thread (todos os cores CPU)   │
│  - Hash otimizado                       │
│  - Performance máxima                   │
└─────────────────────────────────────────┘
```

#### Bibliotecas Necessárias

**Node.js**:
- `node-uci` - Wrapper UCI para binários nativos
  - [GitHub](https://github.com/ebemunk/node-uci)
  - Comunica diretamente com Stockfish nativo
  - Suporte a UCI completo

**Ou alternativa Python**:
- `python-chess` - Library completa para xadrez
  - [Documentação](https://python-chess.readthedocs.io/)
  - Otimizada para análise em batch
  - Ajuste de threads e hash

#### Vantagens
✅ **16x mais rápido** que browser WASM
✅ Multi-threading (usa todos os cores da CPU)
✅ Hash configurável para melhor performance
✅ Análise em background (não trava UI)
✅ Pode processar múltiplas partidas em paralelo
✅ Stockfish mais recente (17.1)

#### Desvantagens
⚠️ Requer servidor local rodando
⚠️ Setup mais complexo
⚠️ Binário específico por plataforma (Windows/Mac/Linux)
⚠️ Usuário precisa ter Node.js ou Python instalado

---

### Opção 2: Aplicação Electron (Desktop App)
**Performance esperada**: **15-16x mais rápido** (multi-thread)

#### Arquitetura

```
┌─────────────────────────────────────────┐
│  Electron App                           │
│  ┌───────────────────────────────────┐  │
│  │ Renderer Process (React UI)       │  │
│  └─────────────┬─────────────────────┘  │
│                │ IPC                     │
│  ┌─────────────▼─────────────────────┐  │
│  │ Main Process (Node.js)            │  │
│  │ - child_process.spawn()           │  │
│  │ - Stockfish UCI wrapper           │  │
│  └─────────────┬─────────────────────┘  │
└────────────────┼─────────────────────────┘
                 │ UCI Protocol
                 ▼
      ┌──────────────────────┐
      │ Stockfish Native     │
      │ (bundled in app)     │
      └──────────────────────┘
```

#### Vantagens
✅ **Performance nativa** (16x mais rápido)
✅ Interface React preservada
✅ Binários bundled (não precisa instalação separada)
✅ Distribuição como app desktop (.exe, .dmg, .AppImage)
✅ Offline-first
✅ Melhor integração com sistema operacional

#### Desvantagens
⚠️ App maior (~150-200MB com Electron + Stockfish)
⚠️ Precisa builds separados para cada plataforma
⚠️ Mais complexo que web app puro
⚠️ Atualizações requerem download de nova versão

---

### Opção 3: Híbrido - Web + API Externa
**Performance esperada**: Depende do servidor

#### Arquitetura

```
React App (Browser) ─HTTP─→ API Externa (chess-api.com ou própria)
                              ↓
                         Stockfish na nuvem
```

#### APIs Disponíveis

**chess-api.com**:
- REST API e WebSocket
- Stockfish 17
- Free tier disponível
- Endpoint: `https://chess-api.com/v1`

**Vantagens**:
✅ Sem setup local
✅ Escalável
✅ Sempre atualizado
✅ Funciona em qualquer dispositivo

**Desvantagens**:
⚠️ Requer internet
⚠️ Limite de requisições (free tier)
⚠️ Custo para uso intensivo
⚠️ Latência de rede

---

## 📈 Comparação de Tempo de Análise

### Cenário: Analisar 1 partida de 40 movimentos (80 posições)

**Parâmetros**:
- Depth: 18
- Cada posição avaliada 2x (movimento jogado + melhor movimento)
- Total: 160 avaliações

| Solução | Tempo Estimado | Speedup |
|---------|----------------|---------|
| **Atual (WASM Browser)** | ~10 minutos | 1x |
| **Node.js + Native (1 thread)** | ~6 minutos | 1.67x |
| **Node.js + Native (16 threads)** | ~36 segundos | **16.67x** |
| **Electron + Native (16 threads)** | ~36 segundos | **16.67x** |
| **Python + Native (16 threads)** | ~36 segundos | **16.67x** |

---

## 🎯 Recomendação

### **Opção Recomendada: Electron App**

#### Por quê?
1. **Performance máxima** (16x mais rápido)
2. **Mantém a UI React** existente
3. **UX melhor** - parece app nativo
4. **Distribuição simples** - usuário baixa e instala
5. **Não depende de internet**

#### Implementação Gradual

**Fase 1 - Proof of Concept** (1-2 dias):
```bash
npm install electron electron-builder
```

- Migrar app React atual para Electron
- Testar comunicação Main ↔ Renderer
- Testar spawn de Stockfish nativo

**Fase 2 - Integração Stockfish** (2-3 dias):
```bash
npm install node-uci
```

- Baixar binários Stockfish (Windows/Mac/Linux)
- Criar serviço de análise no Main Process
- IPC para comunicação React ↔ Stockfish
- Progress tracking

**Fase 3 - Build & Distribuição** (1-2 dias):
```bash
npm run build:electron
```

- Configurar electron-builder
- Criar builds para todas as plataformas
- Testar instaladores
- Auto-updater (opcional)

---

## 💻 Exemplo de Código - Electron

### Main Process (análise.ts)
```typescript
import { spawn } from 'child_process';
import { ipcMain } from 'electron';
import path from 'path';

class StockfishAnalyzer {
  private stockfish: any;

  constructor() {
    // Binário bundled na app
    const stockfishPath = path.join(
      __dirname,
      '../resources/stockfish',
      process.platform === 'win32' ? 'stockfish.exe' : 'stockfish'
    );

    this.stockfish = spawn(stockfishPath);
  }

  async analyzePosition(fen: string, depth: number) {
    return new Promise((resolve) => {
      let bestMove = '';
      let evaluation = 0;

      this.stockfish.stdout.on('data', (data: Buffer) => {
        const output = data.toString();

        // Parse UCI output
        if (output.includes('bestmove')) {
          const match = output.match(/bestmove (\w+)/);
          if (match) bestMove = match[1];
        }

        if (output.includes('score cp')) {
          const match = output.match(/score cp (-?\d+)/);
          if (match) evaluation = parseInt(match[1]);
        }
      });

      // Comandos UCI
      this.stockfish.stdin.write('uci\n');
      this.stockfish.stdin.write('setoption name Threads value 16\n');
      this.stockfish.stdin.write('setoption name Hash value 2048\n');
      this.stockfish.stdin.write(`position fen ${fen}\n`);
      this.stockfish.stdin.write(`go depth ${depth}\n`);

      setTimeout(() => {
        resolve({ bestMove, evaluation });
      }, 5000);
    });
  }
}

// IPC handlers
ipcMain.handle('analyze-game', async (event, pgn: string) => {
  const analyzer = new StockfishAnalyzer();
  // ... processar PGN e analisar cada posição
});
```

### Renderer Process (React)
```typescript
import { ipcRenderer } from 'electron';

function GameAnalyzer() {
  const [progress, setProgress] = useState(0);

  const analyzeGame = async (pgn: string) => {
    const result = await ipcRenderer.invoke('analyze-game', pgn);
    console.log('Análise completa:', result);
  };

  // ... rest of component
}
```

---

## 🔧 Configuração Stockfish para Máxima Performance

### Parâmetros UCI Otimizados

```javascript
// Threads: usar todos os cores disponíveis
setoption name Threads value ${os.cpus().length}

// Hash: 2GB (ajustar conforme RAM disponível)
setoption name Hash value 2048

// MultiPV: avaliar múltiplas variações
setoption name MultiPV value 3

// Ponder: continuar pensando durante movimento adversário
setoption name Ponder value true
```

### Batch Processing Otimizado

Para análise de múltiplas partidas:

```typescript
async function analyzeBatch(games: string[]) {
  // Pool de workers paralelos
  const workers = os.cpus().length;
  const queue = [...games];

  const promises = Array(workers).fill(null).map(async () => {
    while (queue.length > 0) {
      const game = queue.shift();
      if (game) {
        await analyzeGame(game);
      }
    }
  });

  await Promise.all(promises);
}
```

---

## 📦 Alternativa Python (Script Separado)

Se preferir Python para análise batch:

### analyzer.py
```python
import chess
import chess.engine
import chess.pgn
import sys
import json

def analyze_game(pgn_path, depth=18):
    # Stockfish engine
    engine = chess.engine.SimpleEngine.popen_uci("./stockfish")

    # Configurações
    engine.configure({
        "Threads": 16,
        "Hash": 2048
    })

    # Ler PGN
    with open(pgn_path) as pgn_file:
        game = chess.pgn.read_game(pgn_file)

    results = []
    board = game.board()

    for move in game.mainline_moves():
        # Análise antes do movimento
        info_before = engine.analyse(board, chess.engine.Limit(depth=depth))

        # Fazer movimento
        board.push(move)

        # Análise depois
        info_after = engine.analyse(board, chess.engine.Limit(depth=depth))

        results.append({
            "move": move.uci(),
            "eval_before": info_before["score"].relative.score(),
            "eval_after": info_after["score"].relative.score(),
            "best_move": info_before["pv"][0].uci()
        })

    engine.quit()
    return results

if __name__ == "__main__":
    pgn = sys.argv[1]
    results = analyze_game(pgn)
    print(json.dumps(results))
```

### Chamada do Node.js
```typescript
import { exec } from 'child_process';

function analyzeWithPython(pgnPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec(`python3 analyzer.py ${pgnPath}`, (error, stdout) => {
      if (error) reject(error);
      else resolve(JSON.parse(stdout));
    });
  });
}
```

---

## 📊 Comparação Final

| Critério | Atual (WASM) | Electron | Node Server | API Externa |
|----------|--------------|----------|-------------|-------------|
| **Performance** | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **UX** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Offline** | ✅ | ✅ | ✅ | ❌ |
| **Distribuição** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Manutenção** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 Conclusão

**SIM, análise pode ser MUITO mais rápida (até 16x)** usando Stockfish nativo ao invés de WASM!

**Melhor opção**: **Electron App**
- Performance máxima
- Mantém UI React
- UX superior
- Viável tecnicamente

**Próximos passos**:
1. Criar branch `feature/electron-migration`
2. Setup básico do Electron
3. Migrar componentes React
4. Integrar Stockfish nativo via child_process
5. Testar performance
6. Build e distribuição

**Tempo estimado**: 5-7 dias de desenvolvimento

---

## 📚 Referências

- [Stockfish Official](https://stockfishchess.org/)
- [node-uci GitHub](https://github.com/ebemunk/node-uci)
- [python-chess Documentation](https://python-chess.readthedocs.io/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [WASM Performance Analysis](https://nickb.dev/blog/wasm-and-native-node-module-performance-comparison/)
- [Lichess Stockfish Benchmark](https://lichess.org/forum/game-analysis/lichess-browser-stockfish-vs-uci-stockfish-speed)
