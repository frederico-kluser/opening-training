import { Modal, Button } from 'react-bootstrap';
import { Chess } from 'chess.js';
import Gap from '../Gap';

interface MoveSelectionModalProps {
  show: boolean;
  currentFen: string;
  nextFens: string[];
  onSelectMove: (selectedFen: string) => void;
  onHide: () => void;
}

const MoveSelectionModal: React.FC<MoveSelectionModalProps> = ({
  show,
  currentFen,
  nextFens,
  onSelectMove,
  onHide
}) => {
  // Função para extrair o movimento a partir de dois FENs
  const getMoveName = (fromFen: string, toFen: string): string => {
    try {
      const game = new Chess(fromFen);
      const moves = game.moves({ verbose: true });

      // Encontra o movimento que leva ao FEN desejado
      for (const move of moves) {
        const testGame = new Chess(fromFen);
        testGame.move(move);

        if (testGame.fen() === toFen) {
          // Retorna notação SAN (ex: e4, Nf3, O-O)
          return move.san;
        }
      }

      return 'Movimento desconhecido';
    } catch (error) {
      console.error('Erro ao obter nome do movimento:', error);
      return 'Erro';
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Selecione um avanço</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-muted mb-3">
          Existem {nextFens.length} variações cadastradas para esta posição:
        </p>

        <Gap size={8}>
          {nextFens.map((fen, index) => {
            const moveName = getMoveName(currentFen, fen);
            return (
              <Button
                key={index}
                variant="outline-primary"
                className="w-100 text-start"
                onClick={() => {
                  onSelectMove(fen);
                  onHide();
                }}
                style={{
                  padding: '12px 16px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              >
                {index + 1}. {moveName}
              </Button>
            );
          })}
        </Gap>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MoveSelectionModal;
