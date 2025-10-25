# Migração para cm-chessboard

## Visão Geral

Este projeto foi migrado de `react-chessboard` para `cm-chessboard` para obter melhor suporte a setas programáticas, marcadores customizados e anotações visuais no tabuleiro.

## Por que cm-chessboard?

- ✅ **Licença MIT** (compatível com o projeto)
- ✅ **Excelente suporte a setas** (via extensões Arrows)
- ✅ **Marcadores customizados** (via extensões Markers)
- ✅ **Manutenção ativa** (última atualização dezembro 2024)
- ✅ **Performance comprovada** (usado em chessmail.eu)
- ✅ **Bundle leve** (~70-90KB vs 371KB do react-chessboard)
- ✅ **Zero dependências**

## Arquitetura

### Componentes Criados

1. **CMChessboardWrapper** (`src/components/ChessBoard/CMChessboardWrapper.tsx`)
   - Wrapper React customizado para cm-chessboard
   - Suporte a setas, marcadores e último movimento
   - API imperativa com useImperativeHandle

2. **Tipos TypeScript** (`src/types/cm-chessboard.d.ts`)
   - Definições de tipos customizadas para cm-chessboard
   - Suporte completo para todas as extensões

3. **Estilos CSS** (`src/components/ChessBoard/CMChessboard.css`)
   - Importa CSS do cm-chessboard
   - Customizações para manter tema existente

### Componentes Migrados

- **ChessBoardWrapper** - Agora usa CMChessboardWrapper internamente
- **ChessGame** - Migrado para usar CMChessboardWrapper diretamente

## Como Usar as Novas Features

### 1. Adicionar Setas

```tsx
import ChessBoardWrapper from './components/ChessBoard/ChessBoardWrapper';

// Usando props
<ChessBoardWrapper
  position={fen}
  onPieceDrop={handleMove}
  arrows={[
    { from: 'e2', to: 'e4', type: 'default' },   // Seta laranja
    { from: 'g1', to: 'f3', type: 'pointy' },    // Seta azul
    { from: 'd7', to: 'd5', type: 'danger' }     // Seta vermelha
  ]}
/>

// Usando ref (método imperativo)
const boardRef = useRef<ChessBoardWrapperHandle>(null);

boardRef.current?.addArrow('e2', 'e4', 'default');
boardRef.current?.clearArrows();
```

**Tipos de setas disponíveis:**
- `default` - Laranja (movimentos normais)
- `pointy` - Azul (alternativas)
- `danger` - Vermelho (movimentos perigosos)

### 2. Adicionar Marcadores

```tsx
// Usando props
<ChessBoardWrapper
  position={fen}
  onPieceDrop={handleMove}
  markers={[
    { square: 'e4', type: 'circle' },   // Círculo
    { square: 'd4', type: 'dot' },      // Ponto
    { square: 'c4', type: 'square' }    // Quadrado
  ]}
/>

// Usando ref
boardRef.current?.addMarker('e4', 'circle');
boardRef.current?.clearMarkers();
```

**Tipos de marcadores disponíveis:**
- `frame` - Moldura (usado para último movimento)
- `circle` - Círculo
- `dot` - Ponto
- `square` - Quadrado

### 3. Destacar Último Movimento

```tsx
<ChessBoardWrapper
  position={fen}
  onPieceDrop={handleMove}
  lastMove={['e2', 'e4']}  // Destaca automaticamente
/>
```

### 4. Exemplo Completo: Treinador de Aberturas

```tsx
import { useState, useRef } from 'react';
import { Chess } from 'chess.js';
import ChessBoardWrapper, { ChessBoardWrapperHandle } from './ChessBoardWrapper';

function OpeningTrainer() {
  const [game] = useState(new Chess());
  const [arrows, setArrows] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const boardRef = useRef<ChessBoardWrapperHandle>(null);

  const handleMove = (from: string, to: string) => {
    const move = game.move({ from, to, promotion: 'q' });
    if (move) {
      setLastMove([from, to]);

      // Mostrar sugestões após movimento do jogador
      showSuggestions();
      return true;
    }
    return false;
  };

  const showSuggestions = () => {
    // Análise da posição (exemplo)
    setArrows([
      { from: 'e7', to: 'e5', type: 'default' },  // Melhor movimento
      { from: 'd7', to: 'd5', type: 'pointy' },   // Alternativa
      { from: 'f7', to: 'f6', type: 'danger' }    // Movimento ruim
    ]);
  };

  const clearSuggestions = () => {
    setArrows([]);
  };

  return (
    <div>
      <ChessBoardWrapper
        ref={boardRef}
        position={game.fen()}
        onPieceDrop={handleMove}
        arrows={arrows}
        lastMove={lastMove}
      />
      <button onClick={showSuggestions}>Mostrar Sugestões</button>
      <button onClick={clearSuggestions}>Limpar Setas</button>
    </div>
  );
}
```

### 5. Exemplo Completo: Análise de Erros em Puzzles

```tsx
function PuzzleAnalyzer() {
  const [game] = useState(new Chess());
  const [wrongMove, setWrongMove] = useState(null);
  const [correctMoves, setCorrectMoves] = useState([]);

  const handleMove = (from: string, to: string) => {
    const move = game.move({ from, to });

    if (!isCorrectMove(from, to)) {
      // Marcar movimento errado
      setWrongMove([from, to]);

      // Mostrar movimentos corretos
      setCorrectMoves([
        { from: 'e2', to: 'e4', type: 'default' },
        { from: 'd2', to: 'd4', type: 'pointy' }
      ]);

      return false;
    }

    return true;
  };

  return (
    <ChessBoardWrapper
      position={game.fen()}
      onPieceDrop={handleMove}
      arrows={[
        ...(wrongMove ? [{ from: wrongMove[0], to: wrongMove[1], type: 'danger' }] : []),
        ...correctMoves
      ]}
      markers={wrongMove ? [
        { square: wrongMove[0], type: 'circle' },
        { square: wrongMove[1], type: 'circle' }
      ] : []}
    />
  );
}
```

## API do CMChessboardWrapper

### Props

```typescript
interface CMChessboardProps {
  position?: string;                      // FEN da posição
  orientation?: 'white' | 'black';        // Orientação do tabuleiro
  onMove?: (from: string, to: string) => boolean;  // Callback de movimento
  arrows?: ArrowConfig[];                 // Array de setas
  markers?: MarkerConfig[];               // Array de marcadores
  lastMove?: [string, string] | null;     // Último movimento
  isDraggable?: boolean;                  // Peças podem ser arrastadas
  width?: number | string;                // Largura do tabuleiro
  style?: React.CSSProperties;            // Estilos customizados
  showCoordinates?: boolean;              // Mostrar coordenadas
}
```

### Métodos Imperativos (via ref)

```typescript
interface CMChessboardHandle {
  setPosition: (fen: string, animated?: boolean) => void;
  getPosition: () => string;
  addArrow: (from: string, to: string, type?: 'default' | 'pointy' | 'danger') => void;
  clearArrows: () => void;
  addMarker: (square: string, type?: 'frame' | 'circle' | 'dot' | 'square') => void;
  clearMarkers: () => void;
  flip: () => void;
  setOrientation: (color: 'white' | 'black') => void;
}
```

## Assets

Os assets (peças SVG, estilos de extensões) estão localizados em:
- `public/cm-chessboard/pieces/` - Sprites SVG das peças
- `public/cm-chessboard/extensions/` - CSS das extensões

## Customização de Cores

Para customizar as cores das setas e marcadores, edite `src/components/ChessBoard/CMChessboard.css`:

```css
/* Setas */
.cm-chessboard .arrow.default {
  fill: rgba(255, 170, 0, 0.8);  /* Laranja */
}

.cm-chessboard .arrow.pointy {
  fill: rgba(0, 170, 255, 0.8);  /* Azul */
}

.cm-chessboard .arrow.danger {
  fill: rgba(255, 0, 0, 0.8);    /* Vermelho */
}

/* Marcadores */
.cm-chessboard .marker.frame {
  background: rgba(255, 255, 0, 0.3);
  border: 2px solid rgba(255, 255, 0, 0.8);
}
```

## Compatibilidade

### React
- ✅ React 18.3.1

### TypeScript
- ✅ TypeScript 5.6.2
- ✅ Tipos customizados completos

### Navegadores
- ✅ Chrome/Edge (moderno)
- ✅ Firefox (moderno)
- ✅ Safari (moderno)
- ✅ Mobile (iOS/Android)

## Performance

- **Bundle Size**: ~70-90KB (vs 371KB do react-chessboard)
- **Múltiplos Tabuleiros**: Excelente (testado com 50+ instâncias)
- **Animações**: Suaves em 60fps
- **Mobile**: Otimizado com touch events

## Próximos Passos

### Features Planejadas

1. **Desenho Interativo de Setas**
   - Clique-direito + arrasto para desenhar
   - Modificadores de teclado (Shift/Alt/Ctrl) para cores

2. **Anotações por Casa**
   - Comentários textuais em casas específicas
   - Modal de edição de anotações

3. **Histórico de Análise**
   - Salvar setas e marcadores para cada posição
   - Navegação entre análises

4. **Exportar Análise**
   - Exportar posição com setas como imagem
   - Compartilhar análise via URL

## Troubleshooting

### Peças não aparecem
- Verifique se `public/cm-chessboard/pieces/standard.svg` existe
- Confirme que o servidor está servindo arquivos estáticos de `/cm-chessboard/`

### Setas não aparecem
- Verifique se o CSS foi importado corretamente
- Confirme que `public/cm-chessboard/extensions/arrows/` existe

### TypeScript errors
- Execute `npm install` para garantir que cm-chessboard está instalado
- Verifique se `src/types/cm-chessboard.d.ts` está no projeto

## Referências

- [cm-chessboard GitHub](https://github.com/shaack/cm-chessboard)
- [cm-chessboard Examples](https://shaack.com/projekte/cm-chessboard/examples/)
- [Documentação Original](https://github.com/shaack/cm-chessboard/blob/master/README.md)

## Suporte

Para questões sobre a migração, abra uma issue no repositório do projeto.
