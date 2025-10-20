# 🔍 Modo Verbose - Guia de Debug

## Ativação

Use a flag `--verbose` ou `-v` para ativar logs detalhados:

```bash
# Via npm script
npm run analyze:user fredericokluser -- --verbose

# Direto
node scripts/analyze-pgn.js --username fredericokluser --verbose

# Com arquivo PGN
node scripts/analyze-pgn.js partidas.pgn -v
```

## O Que o Modo Verbose Mostra

### 1. **Parser PGN**
```
[DEBUG] Movimentos parseados: ["e3","c6","c3","d5","h3","Bf5","Na3","e6","b4","a5"]...
[DEBUG] Total de movimentos: 118
[DEBUG] Processando movimento 1: "e3"
[DEBUG] Posições geradas: 119
```

### 2. **Inicialização Stockfish**
```
[UCI →] uci
[UCI →] setoption name Threads value 8
[UCI →] setoption name Hash value 2048
[UCI →] isready
```

### 3. **Análise de Posições**
```
[Análise #1] Iniciando (depth: 18)
[Análise #1] FEN: rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq...
[Análise #1] depth 1/18 ... depth 18/18
[Análise #1] Completa! bestmove: e2e4, eval: 34cp

[DEBUG] Eval ANTES: 34cp, bestMove: e2e4
[DEBUG] Eval DEPOIS: -14cp
[DEBUG] CP Loss: 48cp (threshold: 100)
```

### 4. **Erros e Problemas**
```
❌ Movimento inválido 42: "O-O-O"
   FEN atual: r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq

❌ Erro na análise ANTES (pos 15): Análise timeout após 15s
   FEN: rnbqkb1r/pp1ppppp/5n2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq

❌ [Análise #127] TIMEOUT após 15s!
```

## Quando Usar

### ✅ Use quando:
- A análise trava ou fica muito lenta
- Movimentos não estão sendo parseados corretamente
- Quer entender exatamente o que está acontecendo
- Debugging de problemas com Stockfish
- Validar se erros estão sendo detectados

### ❌ Não use quando:
- Análise normal está funcionando (muito output!)
- Analisando muitas partidas (> 50)
- Performance é crítica (verbose adiciona ~5% overhead)

## Resolução de Problemas Comuns

### Problema: "Timeout após 15s"
**Causa**: Posição muito complexa ou Stockfish travado  
**Solução**:
```bash
# Reduzir profundidade
npm run analyze:user usuario -- --depth 12 --verbose

# Aumentar threshold (menos posições analisadas)
npm run analyze:user usuario -- --threshold 200 --verbose
```

### Problema: "Movimento inválido"
**Causa**: PGN mal formatado ou parser com bug  
**Solução**: Verbose mostra exatamente qual movimento e o FEN  
```
❌ Movimento inválido 42: "O-O-O"
   FEN atual: r1bqkb1r/...
```

### Problema: "Stockfish não encontrado"
**Causa**: Binário não instalado ou não no PATH  
**Solução**: Verbose mostra todos os caminhos tentados
```
🔍 Tentando Stockfish em: /opt/homebrew/bin/stockfish
🔍 Tentando Stockfish em: /usr/local/bin/stockfish
❌ Stockfish não encontrado!
```

## Combinando com Outras Opções

```bash
# Debug análise rápida (depth 10)
npm run analyze:user usuario -- -v --depth 10

# Debug com menos threads (para isolar problemas)
npm run analyze:user usuario -- -v --threads 1

# Debug apenas erros graves
npm run analyze:user usuario -- -v --threshold 300

# Debug 1 mês apenas
npm run analyze:user usuario -- -v --months 1
```

## Redirecionando Output

```bash
# Salvar logs em arquivo
npm run analyze:user usuario -- -v > debug.log 2>&1

# Ver apenas erros
npm run analyze:user usuario -- -v 2> errors.log

# Apenas primeiras 100 linhas
npm run analyze:user usuario -- -v 2>&1 | head -100
```

## Níveis de Log

| Nível | O Que Mostra | Quando Ver |
|-------|--------------|------------|
| **Normal** | Progresso, estatísticas finais | Uso normal |
| **Verbose** | Parser, UCI, análises, CP loss | Debug geral |
| **Stockfish Raw** | UCI completo (requer modificação) | Debug Stockfish |

## Performance

Com verbose ativado:
- **CPU**: +2-5% uso (logs para console)
- **Tempo**: +3-7% mais lento (I/O)
- **Memória**: Igual (logs não são armazenados)

**Recomendação**: Use apenas para debug!

---

**Criado em**: 2025-10-20  
**Versão**: 2.1.1
