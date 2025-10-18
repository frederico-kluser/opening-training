import React from 'react';
import { centipawnsToWinPercentage, formatEvaluation } from './evaluationUtils';
import './EvaluationBar.css';

interface EvaluationBarProps {
  evaluation: number; // Centipawns (positivo = brancas, negativo = pretas)
  showNumeric?: boolean; // Mostrar valor numérico
  height?: number; // Altura em pixels
  animated?: boolean; // Animações suaves
  loading?: boolean; // Estado de carregamento
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({
  evaluation,
  showNumeric = true,
  height = 400,
  animated = true,
  loading = false
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

  return (
    <div
      className={`evaluation-bar-container ${loading ? 'loading' : ''}`}
      style={{ height: `${height}px` }}
    >
      {/* Barra Visual */}
      <div className="evaluation-bar">
        {/* Parte Branca (bottom) */}
        <div
          className={`eval-section white-section ${animated ? 'animated' : ''}`}
          style={{ height: `${whitePercentage}%` }}
        >
          {showNumeric && showInWhiteSection && !isMate && (
            <span className="eval-text white-text">{evalText}</span>
          )}
        </div>

        {/* Parte Preta (top) */}
        <div
          className={`eval-section black-section ${animated ? 'animated' : ''}`}
          style={{ height: `${blackPercentage}%` }}
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
          style={{ bottom: `${whitePercentage}%` }}
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
