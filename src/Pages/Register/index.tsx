import { Form, Button, ButtonGroup } from 'react-bootstrap';
import { Dispatch, SetStateAction, useEffect, useState, useCallback, useRef } from 'react';
import { Chess, Move } from 'chess.js';
import TypeStorage from '../../types/TypeStorage';
import Gap from '../../components/Gap';
import ChessGame from '../../components/ChessGame';
import NavigationBar from '../../components/TrainingControls/NavigationBar';
import openingService from '../../services/OpeningService';
import EvaluationBar from '../../components/EvaluationBar';
import useStockfish from '../../hooks/useStockfish';
import useBoardSize from '../../hooks/useBoardSize';
import useScreenOrientation from '../../hooks/useScreenOrientation';
import { populateEmptyComment, syncCommentToAllFens } from '../../utils/fenSyncUtils';
import MoveSelectionModal from '../../components/MoveSelectionModal';
import soundService from '../../services/SoundService';

const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

interface RegisterProps {
	variant: string;
	save: TypeStorage;
	setSave: Dispatch<SetStateAction<TypeStorage>>;
	handleExist: () => void;
}

const Register = ({ variant, save, setSave, handleExist }: RegisterProps): JSX.Element => {
	// Inicializar cor da abertura ANTES de montar o componente
	const existingOpening = openingService.getOpeningByName(variant);
	const initialColor = existingOpening?.color || 'white';

	const [actualFen, setActualFen] = useState(initialFen);
	const [invertedBoard, setInvertedBoard] = useState(initialColor === 'black');
	const [game, setGame] = useState(new Chess());
	const [comment, setComment] = useState('');
	const [openingColor, setOpeningColor] = useState<'white' | 'black'>(initialColor);

	// Estados para Evaluation Bar
	const [currentEvaluation, setCurrentEvaluation] = useState<number>(0);
	const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

	// Estados para o modal de seleção de movimentos
	const [showMoveSelectionModal, setShowMoveSelectionModal] = useState(false);
	const [availableMoves, setAvailableMoves] = useState<string[]>([]);

	// Ref para rastrear o último FEN avaliado
	const lastEvaluatedFen = useRef<string>('');

	// Hook do Stockfish
	const { analyze, isReady } = useStockfish();

	// Hook para controle de zoom do tabuleiro
	const { boardWidth, zoomIn, zoomOut, canZoomIn, canZoomOut } = useBoardSize();

	// Hook para detectar orientação da tela
	const { isPortrait } = useScreenOrientation();

	// const isBlackTurn = () => game.turn() === 'b';

	// Função para avaliar posição com Stockfish
	const evaluatePosition = useCallback(async (fen: string) => {
		if (!isReady) return;

		setIsEvaluating(true);
		try {
			const result = await analyze(fen, 20); // depth 20 para análise mais profunda
			if (result) {
				console.log('📊 AVALIAÇÃO (Register):', {
					fen: fen.substring(0, 30) + '...',
					evaluation: result.evaluation,
					evaluationInPawns: (result.evaluation / 100).toFixed(2),
					interpretation: result.evaluation > 0 ? '⬜ Brancas melhor' : result.evaluation < 0 ? '⬛ Pretas melhor' : '= Igual'
				});
				setCurrentEvaluation(result.evaluation);
			}
		} catch (error) {
			console.error('Evaluation failed:', error);
		} finally {
			setIsEvaluating(false);
		}
	}, [analyze, isReady]);

	useEffect(() => {
		console.log('save :', save);
	}, [save]);

	// Atualizar cor quando variant muda (para navegação entre diferentes aberturas)
	useEffect(() => {
		const existing = openingService.getOpeningByName(variant);
		if (existing && existing.color !== openingColor) {
			setOpeningColor(existing.color);
			setInvertedBoard(existing.color === 'black');
			console.log(`✅ Abertura "${variant}" carregada com cor: ${existing.color}`);
		}
	}, [variant, openingColor]);

	// 🎯 Sincronizar orientação do tabuleiro com a cor escolhida
	useEffect(() => {
		// Se escolheu pretas, inverte o tabuleiro (pretas embaixo)
		// Se escolheu brancas, não inverte (brancas embaixo)
		setInvertedBoard(openingColor === 'black');
		console.log(`🎨 Tabuleiro orientado: ${openingColor === 'white' ? '⬜ Brancas embaixo' : '⬛ Pretas embaixo'}`);
	}, [openingColor]);

	// Salvar abertura no OpeningService quando houver mudanças
	const handleSaveOpening = () => {
		if (!save[variant] || Object.keys(save[variant]).length === 0) {
			alert('⚠️ Adicione ao menos uma posição antes de salvar!');
			return;
		}

		const existing = openingService.getOpeningByName(variant);

		if (existing) {
			// Atualizar abertura existente
			openingService.updateOpening(existing.id, {
				color: openingColor,
				positions: save[variant],
				lastModified: new Date().toISOString()
			});
			alert(`✅ Abertura "${variant}" atualizada com sucesso!`);
		} else {
			// Criar nova abertura
			openingService.createOpening({
				name: variant,
				color: openingColor,
				positions: save[variant]
			});
			alert(`✅ Abertura "${variant}" criada com sucesso!`);
		}
	};

	// Debounce para salvar comentários (evita loop e bug de digitação)
	useEffect(() => {
		const debounceTimer = setTimeout(() => {
			setSave((prevSave) => {
				const newSave = { ...prevSave };
				if (!newSave[variant]) {
					newSave[variant] = {};
				}
				const prevFen = newSave[variant][actualFen]?.prevFen || '';
				const nextFen = newSave[variant][actualFen]?.nextFen || [];

				newSave[variant][actualFen] = {
					prevFen,
					comment,
					nextFen,
				};

				// ✅ Sincroniza comentário para todos os FENs iguais na árvore
				return syncCommentToAllFens(variant, actualFen, comment, newSave);
			});
		}, 500); // Aguarda 500ms após parar de digitar

		return () => clearTimeout(debounceTimer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comment, variant, actualFen]);

	useEffect(() => {
		setGame(new Chess(actualFen));
		let comment = '';

		if (save[variant] && save[variant][actualFen]) {
			comment = save[variant][actualFen]?.comment || '';

			// ✅ Se comentário estiver vazio, busca em FENs duplicados na árvore
			if (!comment || comment.trim().length === 0) {
				const [updatedSave, foundComment] = populateEmptyComment(variant, actualFen, save);
				if (foundComment && foundComment.trim().length > 0) {
					comment = foundComment;
					// Atualiza o save com o comentário populado
					setSave(updatedSave);
				}
			}
		}

		setComment(comment);

		// ✅ Só avaliar se o FEN realmente mudou (não reavaliar quando apenas o comment muda)
		if (lastEvaluatedFen.current !== actualFen) {
			lastEvaluatedFen.current = actualFen;
			evaluatePosition(actualFen);
		}
	}, [actualFen, save, variant, evaluatePosition]);

	const updateActualFen = (newFen: string) => {
		setSave((prevSave) => {
			const newSave = { ...prevSave };

			if (newSave[variant][actualFen].nextFen.indexOf(newFen) === -1) {
				newSave[variant][actualFen].nextFen.push(newFen);
			}

			if (!newSave[variant][newFen]) {
				newSave[variant][newFen] = {
					prevFen: actualFen,
					comment: '',
					nextFen: [],
				};
			}

			return newSave;
		});
		setActualFen(newFen);
	};

	// const isNotMyTurn = () => (isBlackTurn() && !invertedBoard) || (!isBlackTurn() && invertedBoard);

	const handleDrop = (move: Move) => {
		const gameCopy = new Chess();
		gameCopy.load(game.fen());

		const newMove = gameCopy.move(move);
		if (newMove) {
			// Tocar som baseado no tipo de movimento
			if (newMove.captured) {
				soundService.playCaptureSound();
			} else {
				soundService.playMoveSound();
			}

			// Verificar se é xeque
			if (gameCopy.isCheck()) {
				setTimeout(() => soundService.playCheckSound(), 100);
			}

			updateActualFen(gameCopy.fen());
		} else {
			console.log('Invalid move');
		}
	};

  const handleUndo = () => {
    if (save[variant][actualFen]?.prevFen) {
      setActualFen(save[variant][actualFen]?.prevFen);
    } else if (actualFen !== initialFen) {
      setActualFen(initialFen);
    }
  };

  const handleRedo = () => {
    if (save[variant][actualFen]?.nextFen.length > 0) {
      const nextFens = save[variant][actualFen]?.nextFen;

      // Se houver apenas um avanço, vai direto
      if (nextFens.length === 1) {
        setActualFen(nextFens[0]);
      } else {
        // Se houver múltiplos avanços, mostra o modal
        setAvailableMoves(nextFens);
        setShowMoveSelectionModal(true);
      }
    }
  };

  const handleMoveSelection = (selectedFen: string) => {
    setActualFen(selectedFen);
  };

	return (
		<Gap size={16} padding={16}>
			<NavigationBar
        onExit={handleExist}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onFlipBoard={() => setInvertedBoard(!invertedBoard)}
        isBoardFlipped={invertedBoard}
        canUndo={actualFen !== initialFen}
        canRedo={!!save[variant] && save[variant][actualFen]?.nextFen.length > 0}
        downloadData={save}
        downloadDisabled={Object.keys(save).length === 0}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        canZoomIn={canZoomIn}
        canZoomOut={canZoomOut}
      />

			{/* Seleção de cor da abertura */}
			<div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
				<div className="d-flex align-items-center gap-2">
					<Form.Label className="mb-0 fw-bold">Você joga com:</Form.Label>
					<ButtonGroup>
						<Button
							variant={openingColor === 'white' ? 'primary' : 'outline-primary'}
							onClick={() => setOpeningColor('white')}
							size="sm"
						>
							⬜ Brancas
						</Button>
						<Button
							variant={openingColor === 'black' ? 'secondary' : 'outline-secondary'}
							onClick={() => setOpeningColor('black')}
							size="sm"
						>
							⬛ Pretas
						</Button>
					</ButtonGroup>
				</div>

				<Button
					variant="success"
					size="sm"
					onClick={handleSaveOpening}
					disabled={!save[variant] || Object.keys(save[variant]).length === 0}
				>
					💾 Salvar Abertura
				</Button>
			</div>

			{/* Layout com Evaluation Bar e Tabuleiro */}
			<div style={{
				display: 'flex',
				flexDirection: isPortrait ? 'column' : 'row',
				gap: '20px',
				alignItems: 'center',
				justifyContent: 'center',
				marginBottom: '1rem',
				flexWrap: 'wrap'
			}}>
				{/* Evaluation Bar */}
				<div style={{
					display: 'flex',
					flexDirection: isPortrait ? 'row' : 'column',
					alignItems: 'center',
					gap: '8px',
				maxWidth: isPortrait ? '90vw' : 'auto',
				width: isPortrait ? '100%' : 'auto'
				}}>
					<EvaluationBar
						evaluation={currentEvaluation}
						height={isPortrait ? Math.min(500, window.innerWidth * 0.85) : 500}
						showNumeric={false}
						animated={true}
						loading={isEvaluating}
						orientation={isPortrait ? 'horizontal' : 'vertical'}
					/>
					{isEvaluating && !isPortrait && (
						<small className="text-muted">Analisando...</small>
					)}
				</div>

				{/* Tabuleiro */}
				<div style={{
					flex: '1 1 auto',
					minWidth: '320px',
					maxWidth: '600px'
				}}>
					<ChessGame invertedBoard={invertedBoard} game={game} onDropCallback={handleDrop} boardWidth={boardWidth} />
				</div>
			</div>

			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<div style={{ width: 'min(500px, 90vw, 70vh)' }}>
					<Form>
						<Form.Label>
							Comentários
						</Form.Label>
						<Form.Control
							type="email"
							placeholder="Comente sobre a posição atual"
							as="textarea"
							rows={3}
							value={comment}
							onChange={(e) => {
								setComment(e.target.value);
							}}
						/>
					</Form>
				</div>
			</div>

			{/* Exibição do FEN atual */}
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<div style={{ width: 'min(500px, 90vw, 70vh)' }}>
					<Form.Group>
						<Form.Label className="fw-bold">FEN Atual:</Form.Label>
						<Form.Control
							type="text"
							value={actualFen}
							readOnly
							onClick={(e) => {
								const target = e.target as HTMLInputElement;
								target.select();
								navigator.clipboard.writeText(actualFen);
							}}
							style={{
								fontFamily: 'monospace',
								fontSize: '12px',
								cursor: 'pointer',
								backgroundColor: '#f8f9fa'
							}}
							title="Clique para copiar o FEN"
						/>
						<Form.Text className="text-muted">
							Clique para copiar o FEN para a área de transferência
						</Form.Text>
					</Form.Group>
				</div>
			</div>

			{/* Modal de seleção de movimentos */}
			<MoveSelectionModal
				show={showMoveSelectionModal}
				currentFen={actualFen}
				nextFens={availableMoves}
				onSelectMove={handleMoveSelection}
				onHide={() => setShowMoveSelectionModal(false)}
			/>
		</Gap>
	);
};

export default Register;
