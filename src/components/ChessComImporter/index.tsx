import React, { useState } from 'react';
import { Button, Card, Form, Alert, Spinner, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import Gap from '../Gap';
import chessComService, { ChessComGame } from '../../services/ChessComService';

interface ChessComImporterProps {
  onImportGames: (pgn: string) => void;
  onBack: () => void;
}

const ChessComImporter: React.FC<ChessComImporterProps> = ({ onImportGames, onBack }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [archives, setArchives] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [games, setGames] = useState<ChessComGame[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingGames, setLoadingGames] = useState(false);

  // Buscar perfil e arquivos
  const fetchUserData = async () => {
    if (!username.trim()) {
      setError('Digite um username válido');
      return;
    }

    setLoading(true);
    setError('');
    setGames([]);
    setSelectedMonth('');

    try {
      // Buscar perfil
      const userProfile = await chessComService.getPlayerProfile(username.toLowerCase());
      setProfile(userProfile);

      // Buscar arquivos mensais
      const userArchives = await chessComService.getPlayerArchives(username.toLowerCase());
      setArchives(userArchives);

      // Buscar estatísticas
      const userStats = await chessComService.getPlayerStats(username.toLowerCase());
      setStats(userStats);

      // Se houver arquivos, seleciona o mês mais recente
      if (userArchives.length > 0) {
        setSelectedMonth(userArchives[userArchives.length - 1]);
      }

    } catch (err: any) {
      setError(`Erro ao buscar dados: ${err.message}`);
      setProfile(null);
      setArchives([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Carregar jogos do mês selecionado
  const loadMonthGames = async () => {
    if (!selectedMonth) return;

    setLoadingGames(true);
    setError('');

    try {
      // Extrair ano e mês da URL
      const parts = selectedMonth.split('/');
      const year = parseInt(parts[parts.length - 2]);
      const month = parseInt(parts[parts.length - 1]);

      // Buscar jogos
      const monthGames = await chessComService.getMonthlyGames(username.toLowerCase(), year, month);
      setGames(monthGames);

    } catch (err: any) {
      setError(`Erro ao buscar jogos: ${err.message}`);
      setGames([]);
    } finally {
      setLoadingGames(false);
    }
  };

  // Importar jogos selecionados
  const importGames = (gamesToImport?: ChessComGame[]) => {
    const selectedGames = gamesToImport || games;
    if (selectedGames.length === 0) {
      setError('Nenhum jogo para importar');
      return;
    }

    // Concatenar PGNs
    const combinedPGN = selectedGames.map(game => game.pgn).join('\n\n');
    onImportGames(combinedPGN);
  };

  // Formatar data do arquivo
  const formatArchiveDate = (archiveUrl: string) => {
    const parts = archiveUrl.split('/');
    const year = parts[parts.length - 2];
    const month = parts[parts.length - 1];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${monthNames[parseInt(month) - 1]}/${year}`;
  };

  // Formatar rating
  const formatRating = (stats: any) => {
    const ratings: string[] = [];
    if (stats?.chess_bullet?.last?.rating) {
      ratings.push(`Bullet: ${stats.chess_bullet.last.rating}`);
    }
    if (stats?.chess_blitz?.last?.rating) {
      ratings.push(`Blitz: ${stats.chess_blitz.last.rating}`);
    }
    if (stats?.chess_rapid?.last?.rating) {
      ratings.push(`Rapid: ${stats.chess_rapid.last.rating}`);
    }
    return ratings.join(' | ');
  };

  // Contar jogos por tipo
  const countGamesByType = () => {
    const counts = {
      bullet: 0,
      blitz: 0,
      rapid: 0,
      daily: 0
    };

    games.forEach(game => {
      counts[game.time_class]++;
    });

    return counts;
  };

  const gameCounts = countGamesByType();

  return (
    <Gap size={16} padding={16}>
      <Button variant="secondary" onClick={onBack}>
        ← Voltar
      </Button>

      <Card>
        <Card.Body>
          <h3>🌐 Importar Partidas do Chess.com</h3>

          <Form.Group className="mb-3">
            <Form.Label>Username do Chess.com</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Ex: hikaru, magnuscarlsen, gothamchess"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchUserData()}
              />
              <Button
                variant="primary"
                onClick={fetchUserData}
                disabled={loading || !username.trim()}
              >
                {loading ? <Spinner size="sm" /> : '🔍 Buscar'}
              </Button>
            </div>
          </Form.Group>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {profile && (
            <Card className="mb-3">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5>👤 {profile.username}</h5>
                    <small className="text-muted">
                      ID: {profile.player_id} |
                      Membro desde: {new Date(profile.joined * 1000).toLocaleDateString('pt-BR')}
                    </small>
                  </Col>
                  <Col md={6} className="text-end">
                    {stats && (
                      <div>
                        <small className="text-muted">Ratings atuais:</small>
                        <div>{formatRating(stats)}</div>
                      </div>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {archives.length > 0 && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Selecione o mês ({archives.length} meses disponíveis)</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {archives.reverse().map((archive, index) => (
                      <option key={index} value={archive}>
                        {formatArchiveDate(archive)}
                        {index === 0 && ' (Mais recente)'}
                      </option>
                    ))}
                  </Form.Select>
                  <Button
                    variant="info"
                    onClick={loadMonthGames}
                    disabled={!selectedMonth || loadingGames}
                  >
                    {loadingGames ? <Spinner size="sm" /> : '📥 Carregar Jogos'}
                  </Button>
                </div>
              </Form.Group>
            </>
          )}

          {games.length > 0 && (
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>📋 {games.length} jogos encontrados</h5>
                  <div>
                    <Badge bg="danger" className="me-1">Bullet: {gameCounts.bullet}</Badge>
                    <Badge bg="warning" className="me-1">Blitz: {gameCounts.blitz}</Badge>
                    <Badge bg="info" className="me-1">Rapid: {gameCounts.rapid}</Badge>
                    {gameCounts.daily > 0 && <Badge bg="secondary">Daily: {gameCounts.daily}</Badge>}
                  </div>
                </div>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <ListGroup>
                    {games.slice(0, 10).map((game, index) => (
                      <ListGroup.Item key={index}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{game.white.username}</strong> ({game.white.rating}) vs{' '}
                            <strong>{game.black.username}</strong> ({game.black.rating})
                          </div>
                          <div>
                            <Badge bg={game.time_class === 'bullet' ? 'danger' : game.time_class === 'blitz' ? 'warning' : 'info'}>
                              {game.time_class}
                            </Badge>
                            <Badge bg="secondary" className="ms-1">
                              {game.time_control}
                            </Badge>
                          </div>
                        </div>
                        <small className="text-muted">
                          Resultado: {game.white.result} - {game.black.result} |
                          {new Date(game.end_time * 1000).toLocaleDateString('pt-BR')}
                        </small>
                      </ListGroup.Item>
                    ))}
                    {games.length > 10 && (
                      <ListGroup.Item className="text-center text-muted">
                        ... e mais {games.length - 10} jogos
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </div>

                <div className="mt-3">
                <Gap size={8} horizontal>
                  <Button
                    variant="success"
                    onClick={() => importGames()}
                    disabled={games.length === 0}
                  >
                    ✅ Importar Todos ({games.length} jogos)
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() => {
                      // Importar apenas jogos onde o usuário jogou
                      const userGames = games.filter(g =>
                        g.white.username.toLowerCase() === username.toLowerCase() ||
                        g.black.username.toLowerCase() === username.toLowerCase()
                      );
                      importGames(userGames);
                    }}
                  >
                    👤 Importar Apenas Meus Jogos
                  </Button>

                  <Button
                    variant="warning"
                    onClick={() => {
                      // Importar apenas últimos 10 jogos
                      importGames(games.slice(0, 10));
                    }}
                  >
                    📊 Importar Últimos 10
                  </Button>
                </Gap>
                </div>

                <Alert variant="info" className="mt-3 mb-0">
                  <small>
                    💡 Dica: Os jogos serão importados para o analisador onde você pode detectar erros e gerar puzzles.
                  </small>
                </Alert>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>
    </Gap>
  );
};

export default ChessComImporter;