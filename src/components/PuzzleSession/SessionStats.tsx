import React from 'react';
import { Row, Col, Badge, ProgressBar } from 'react-bootstrap';
import { formatTime } from '../../utils/timeUtils';

interface SessionStatsProps {
  puzzleIndex: number;
  totalPuzzles: number;
  correctCount: number;
  incorrectCount: number;
  streak: number;
  maxStreak: number;
  timeElapsed: number;
  moveNumber?: number;
  color?: 'white' | 'black';
  attemptCount?: number;
}

const SessionStats: React.FC<SessionStatsProps> = ({
  puzzleIndex,
  totalPuzzles,
  correctCount,
  incorrectCount,
  streak,
  maxStreak,
  timeElapsed,
  moveNumber,
  color,
  attemptCount = 0
}) => {
  const successRate = correctCount + incorrectCount > 0
    ? Math.round(correctCount / (correctCount + incorrectCount) * 100)
    : 0;

  return (
    <>
      <Row>
        <Col xs={12} md={8}>
          <h4>
            Puzzle {puzzleIndex + 1} de {totalPuzzles}
            {moveNumber && (
              <Badge bg="secondary" className="ms-2">
                Lance {moveNumber}
              </Badge>
            )}
          </h4>
        </Col>
        <Col xs={12} md={4} className="text-end">
          <Badge bg="success" className="me-2">✓ {correctCount}</Badge>
          <Badge bg="danger" className="me-2">✗ {incorrectCount}</Badge>
          <Badge bg="info">🔥 {streak}</Badge>
        </Col>
      </Row>

      <ProgressBar
        now={(puzzleIndex + 1) / totalPuzzles * 100}
        className="mb-3"
      />

      <Row>
        <Col xs={12} md={6}>
          <p>
            <strong>Tempo:</strong> {formatTime(timeElapsed)}<br />
            <strong>Streak Máximo:</strong> {maxStreak}<br />
            <strong>Taxa de Acerto:</strong> {successRate}%
          </p>
        </Col>
        <Col xs={12} md={6} className="text-md-end text-start mt-3 mt-md-0">
          {color && (
            <div>
              <Badge bg={color === 'white' ? 'light' : 'dark'} text={color === 'white' ? 'dark' : 'light'}>
                {color === 'white' ? 'Brancas' : 'Pretas'}
              </Badge>
              {attemptCount > 0 && (
                <p className="mt-2">
                  <small>Tentativas: <strong>{attemptCount}/3</strong></small>
                </p>
              )}
            </div>
          )}
        </Col>
      </Row>
    </>
  );
};

export default SessionStats;