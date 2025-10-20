# 🌐 Guia: Download Automático do Chess.com

## 🚀 Uso Ultra-Rápido

```bash
# Baixar e analisar suas partidas
npm run analyze:user SEU_USUARIO

# Ou diretamente
node scripts/analyze-pgn.js --username SEU_USUARIO
```

---

## 📋 Exemplos Reais

### Analisar Usuário Famoso
```bash
npm run analyze:user hikaru
npm run analyze:user MagnusCarlsen
npm run analyze:user GothamChess
```

### Suas Próprias Partidas
```bash
npm run analyze:user seu_usuario_chesscom
```

### Com Opções Personalizadas
```bash
# Últimos 6 meses
npm run analyze:user seu_usuario -- --months 6

# Análise profunda
npm run analyze:user seu_usuario -- --depth 20

# Apenas erros graves
npm run analyze:user seu_usuario -- --threshold 200

# Tudo combinado
npm run analyze:user seu_usuario -- --months 12 --depth 22 --threshold 150 --output minha-analise.json
```

---

## ⚡ Performance

| Meses | Partidas (aprox.) | Tempo Estimado |
|-------|-------------------|----------------|
| 1 | ~50 | 2-3 minutos |
| 3 | ~150 | 5-8 minutos |
| 6 | ~300 | 10-15 minutos |
| 12 | ~600 | 20-30 minutos |

*Tempo varia com profundidade de análise e CPU*

---

## 📊 Output do Console

### Exemplo Real
```
🚀 ANÁLISE ULTRA-RÁPIDA DE PGN - STOCKFISH NATIVO

Configuração:
  📊 Profundidade: 18
  🧵 Threads: 16 (16x mais rápido que WASM)
  📉 Threshold: 100cp
  💾 Output: puzzles-output.json

🌐 Baixando partidas do Chess.com...
🔍 Buscando partidas de hikaru...
✅ 12 arquivo(s) mensal(is) encontrado(s)
📌 Baixando apenas os últimos 3 mês(es)

📥 Baixando: [████████████████████] 100% (3/3) - 2025/01
✅ 142 partida(s) baixada(s)
💾 PGN salvo temporariamente: temp-hikaru-1737388200000.pgn

🔍 Parseando partidas...
✅ 142 partida(s) encontrada(s)

🔧 Inicializando Stockfish nativo...
✅ Stockfish iniciado: 16 threads, 2048MB hash

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Partida 1/142
  ⬜ Brancas: Hikaru
  ⬛ Pretas: MagnusCarlsen
  📅 Data: 2025.01.18
  🎯 Movimentos: 34
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⬜ Analisando: 17. [████████████████████] 100% (34/34)
  💥 ERRO ENCONTRADO! Perda de 245cp - Puzzle #1 criado
✅ Partida analisada! Erros encontrados: 2

...

╔════════════════════════════════════════════════════════════╗
║                    ✅ ANÁLISE COMPLETA!                    ║
╚════════════════════════════════════════════════════════════╝

Estatísticas:
  🎮 Partidas analisadas: 142
  📊 Posições analisadas: 3,456
  💥 Erros encontrados: 187
  ⏱️  Tempo decorrido: 384.2s (6.4 minutos)
  📁 Arquivo salvo: puzzles-output.json

Performance:
  🚀 Velocidade: ~9.0 posições/segundo
  ⚡ Speedup: 16x mais rápido que WASM
```

---

## 🎯 Opções Disponíveis

| Opção | Descrição | Padrão | Exemplo |
|-------|-----------|--------|---------|
| `--username` | Usuário Chess.com | - | `--username hikaru` |
| `--months` | Meses a baixar | 3 | `--months 6` |
| `--depth` | Profundidade Stockfish | 18 | `--depth 20` |
| `--threshold` | CP mínimo para puzzle | 100 | `--threshold 150` |
| `--output` | Arquivo de saída | puzzles-output.json | `--output analise.json` |
| `--threads` | Threads CPU | Todos | `--threads 8` |

---

## ⚙️ Rate Limiting (Segurança)

O script implementa **rate limiting automático**:

- ✅ **1 segundo** entre cada request ao Chess.com
- ✅ Previne banimento de IP
- ✅ Respeita a API pública do Chess.com
- ✅ Detecta erro 429 (Too Many Requests)

**Nota**: Nunca faça múltiplas execuções simultâneas! Aguarde o script terminar antes de executar novamente.

---

## 📁 Arquivos Gerados

### PGN Temporário
```
temp-USUARIO-TIMESTAMP.pgn
```
Salvo automaticamente para backup. Pode deletar após análise.

### Arquivo JSON de Puzzles
```json
{
  "metadata": {
    "analyzedAt": "2025-01-20T...",
    "gamesAnalyzed": 142,
    "blundersFound": 187
  },
  "puzzles": [...]
}
```

---

## 🛡️ Troubleshooting

### ❌ "Usuário não encontrado"
**Causa**: Username incorreto ou não existe no Chess.com

**Solução**:
1. Verifique o nome de usuário em Chess.com
2. Use exatamente como aparece na URL: `chess.com/member/USUARIO`
3. É case-insensitive (maiúsculas/minúsculas não importam)

### ❌ "Rate limit excedido"
**Causa**: Muitas requisições em pouco tempo

**Solução**:
1. Aguarde 5-10 minutos
2. Não execute múltiplas instâncias simultaneamente
3. Reduza `--months` se necessário

### ❌ "Nenhuma partida encontrada"
**Causa**: Usuário não tem partidas ou perfil privado

**Solução**:
1. Verifique se o perfil é público
2. Verifique se há partidas no período selecionado
3. Tente aumentar `--months`

### ⚠️ Download muito lento
**Normal**: Chess.com limita velocidade de download por segurança

**Otimizações**:
- Reduza `--months` para baixar menos arquivos
- O script já usa rate limiting otimizado (1s/request)
- Não há como acelerar mais sem risco de banimento

---

## 💡 Dicas Profissionais

### 1. Análise Semanal
```bash
# Crie um alias no seu shell
alias analise-semanal="npm run analyze:user SEU_USUARIO -- --months 1"

# Execute toda semana
analise-semanal
```

### 2. Análise Completa do Ano
```bash
npm run analyze:user SEU_USUARIO -- --months 12 --output analise-2024.json
```

### 3. Apenas Erros Críticos
```bash
npm run analyze:user SEU_USUARIO -- --threshold 300
```
Detecta apenas blunders graves (>300cp)

### 4. Análise Ultra-Profunda
```bash
npm run analyze:user SEU_USUARIO -- --depth 25 --months 1
```
Mais lento, mas detecta erros sutis

---

## 📊 Comparação de Configurações

### Rápida (Muitas Partidas)
```bash
npm run analyze:user USUARIO -- --depth 12 --months 12
```
- ⚡ Mais rápido
- ✅ Detecta erros óbvios
- 📊 Boa para grande volume

### Balanceada (Recomendado)
```bash
npm run analyze:user USUARIO -- --depth 18 --months 3
```
- ⚖️ Equilíbrio perfeito
- ✅ Detecta maioria dos erros
- 📊 Uso geral

### Profunda (Partidas Importantes)
```bash
npm run analyze:user USUARIO -- --depth 22 --months 1
```
- 🔬 Máxima precisão
- ✅ Detecta erros sutis
- 📊 Análise detalhada

---

## 🌟 Casos de Uso

### 1. Estudar Jogador Profissional
```bash
# Analisar últimas 100+ partidas do Hikaru
npm run analyze:user hikaru -- --months 6

# Focar nos erros graves
npm run analyze:user hikaru -- --threshold 200
```

### 2. Revisar Seu Próprio Jogo
```bash
# Últimas partidas
npm run analyze:user SEU_USUARIO -- --months 1

# Apenas erros significativos
npm run analyze:user SEU_USUARIO -- --threshold 150
```

### 3. Análise de Torneio
Se jogou um torneio no Chess.com recentemente:
```bash
# Último mês com análise profunda
npm run analyze:user SEU_USUARIO -- --months 1 --depth 20
```

---

## 🔐 Privacidade

**O que o script acessa?**
- ✅ Apenas dados públicos da API do Chess.com
- ✅ Partidas públicas do usuário
- ✅ Não precisa de login/senha
- ✅ Não acessa dados privados

**O script envia dados?**
- ❌ Não envia nada para nenhum servidor
- ❌ Não faz tracking
- ✅ Tudo roda 100% localmente
- ✅ Open source - código auditável

---

## 📚 Referências

- [Chess.com Public API](https://www.chess.com/news/view/published-data-api)
- [Rate Limiting Guidelines](https://support.chess.com/en/articles/9650547-published-data-api)
- [PGN Format Specification](https://en.wikipedia.org/wiki/Portable_Game_Notation)

---

## 🎓 FAQ

**P: Posso analisar qualquer usuário?**
R: Sim, desde que o perfil seja público.

**P: Há limite de partidas?**
R: Não pelo script, mas baixar muitos meses pode demorar.

**P: Posso usar com Lichess?**
R: Atualmente apenas Chess.com. Lichess planejado para futuro.

**P: O Chess.com permite isso?**
R: Sim! Usamos a API pública oficial deles.

**P: Vai funcionar com perfil privado?**
R: Não, apenas perfis públicos.

**P: Posso baixar partidas de clubes/torneios?**
R: Atualmente apenas partidas de usuários individuais.

---

## ✅ Checklist de Primeiro Uso

- [ ] Stockfish instalado (`brew install stockfish`)
- [ ] Sabe seu username do Chess.com
- [ ] `npm install` executado
- [ ] Testou com exemplo: `npm run analyze:user hikaru`
- [ ] Funcionou? Agora use seu username!

---

**🎉 Pronto para começar!**

```bash
npm run analyze:user SEU_USUARIO_AQUI
```
