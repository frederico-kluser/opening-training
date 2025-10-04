import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

interface GlobalStatsData {
  totalPuzzles: number;
  solvedPuzzles: number;
  successRate: number;
  averageAttempts: number;
}

interface GlobalStatsProps {
  stats: GlobalStatsData;
}

const GlobalStats: React.FC<GlobalStatsProps> = ({ stats }) => {
  return (
    <Card>
      <Card.Body>
        <h5>Estatísticas Globais</h5>
        <Row>
          <Col xs={6} md={3}>
            <p><strong>Total de Puzzles:</strong> {stats.totalPuzzles}</p>
          </Col>
          <Col xs={6} md={3}>
            <p><strong>Resolvidos:</strong> {stats.solvedPuzzles}</p>
          </Col>
          <Col xs={6} md={3}>
            <p><strong>Taxa de Sucesso:</strong> {stats.successRate.toFixed(1)}%</p>
          </Col>
          <Col xs={6} md={3}>
            <p><strong>Média de Tentativas:</strong> {stats.averageAttempts.toFixed(1)}</p>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default GlobalStats;