import React from 'react';
import { centipawnsToWinPercentage, formatEvaluation } from './evaluationUtils';
import './EvaluationBar.css';

interface EvaluationBarProps {
  evaluation: number; // Centipawns (positivo = brancas, negativo = pretas)
  showNumeric?: boolean; // Mostrar valor numérico
  height?: number; // Altura em pixels (modo vertical) ou largura (modo horizontal)
  animated?: boolean; // Animações suaves
  loading?: boolean; // Estado de carregamento
  orientation?: 'vertical' | 'horizontal'; // Orientação da barra
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evaluation,
  showNumeric = true,
  height = 400,
  animated = true,
  loading = false,
  orientation = 'vertical'
}) => {
  // Converte centipawns para porcentagem (0-100)
  const whitePercentage = centipawnsToWinPercentage(evaluation);
  const blackPercentage = 100 - whitePercentage;

  // Formata para display
  const evalText = formatEvaluation(evaluation);

  // Detecta mate
  const isMate = Math.abs(evaluation) >= 100000;
  const isWhiteMate = isMate && evaluation > 0;

  // Determina onde mostrar o texto (na seção maior)
  const showInWhiteSection = whitePercentage > 50;
  const showInBlackSection = blackPercentage > 50;

  // Calcular transforms - GPU accelerated
  // Para vertical: scaleY, para horizontal: scaleX
  const whiteScale = whitePercentage / 100;
  const blackScale = blackPercentage / 100;

  const isHorizontal = orientation === 'horizontal';

  // Estilos dinâmicos baseados na orientação
  const containerStyle: React.CSSProperties = isHorizontal
    ? { width: `${height}px`, height: '40px' }
    : { height: `${height}px` };

  return (
    <div
      className={`evaluation-bar-container ${loading ? 'loading' : ''} ${isHorizontal ? 'horizontal' : 'vertical'}`}
      style={containerStyle}
    >
      {/* Barra Visual */}
      <div className="evaluation-bar">
        {/* Parte Branca - usa scaleY (vertical) ou scaleX (horizontal) */}
        <div
          className={`eval-section white-section ${animated ? 'animated' : ''}`}
          style={{
            transform: isHorizontal ? `scaleX(${whiteScale})` : `scaleY(${whiteScale})`
          }}
        >
          {showNumeric && showInWhiteSection && !isMate && (
            <span className="eval-text white-text">{evalText}</span>
          )}
        </div>

        {/* Parte Preta - usa scaleY (vertical) ou scaleX (horizontal) */}
        <div
          className={`eval-section black-section ${animated ? 'animated' : ''}`}
          style={{
            transform: isHorizontal ? `scaleX(${blackScale})` : `scaleY(${blackScale})`
          }}
        >
          {showNumeric && showInBlackSection && !isMate && (
            <span className="eval-text black-text">{evalText}</span>
          )}
        </div>
      </div>

      {/* Linha Divisória Central (0.0) */}
      {!isMate && (
        <div
          className="eval-center-line"
          style={isHorizontal ? { left: `${whitePercentage}%` } : { bottom: `${whitePercentage}%` }}
        />
      )}

      {/* Indicador de Mate */}
      {isMate && showNumeric && (
        <div className={`eval-mate-indicator ${isWhiteMate ? 'white-mate' : 'black-mate'}`}>
          {evalText}
        </div>
      )}
    </div>
  );
};

export default EvaluationBar;
