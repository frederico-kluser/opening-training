import { Form, Button, ButtonGroup } from 'react-bootstrap';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Chess, Move } from 'chess.js';
import TypeStorage from '../../types/TypeStorage';
import Gap from '../../components/Gap';
import ChessGame from '../../components/ChessGame';
import NavigationBar from '../../components/TrainingControls/NavigationBar';
import openingService from '../../services/OpeningService';

const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

interface RegisterProps {
	variant: string;
	save: TypeStorage;
	setSave: Dispatch<SetStateAction<TypeStorage>>;
	handleExist: () => void;
}

const Register = ({ variant, save, setSave, handleExist }: RegisterProps): JSX.Element => {
	const [actualFen, setActualFen] = useState(initialFen);

	const [invertedBoard, setInvertedBoard] = useState(false);
	const [game, setGame] = useState(new Chess());
	const [comment, setComment] = useState('');
	const [openingColor, setOpeningColor] = useState<'white' | 'black'>('white');

	// const isBlackTurn = () => game.turn() === 'b';

	useEffect(() => {
		console.log('save :', save);
	}, [save]);

	// Carregar cor da abertura se já existir no OpeningService
	useEffect(() => {
		const existing = openingService.getOpeningByName(variant);
		if (existing) {
			setOpeningColor(existing.color);
			console.log(`✅ Abertura "${variant}" carregada com cor: ${existing.color}`);
		}
	}, [variant]);

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

	useEffect(() => {
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
			return newSave;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comment, variant]);

	useEffect(() => {
		setGame(new Chess(actualFen));
		let comment = '';

		if (save[variant] && save[variant][actualFen]) {
			comment = save[variant][actualFen]?.comment || '';
		}

		setComment(comment);
	}, [actualFen, save, variant]);

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
      // TODO: Implementar a seleção de variações
      setActualFen(save[variant][actualFen]?.nextFen[0]);
    }
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
      />

			{/* Seleção de cor da abertura */}
			<div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
				<div className="d-flex align-items-center gap-2">
					<Form.Label className="mb-0 text-white fw-bold">Você joga com:</Form.Label>
					<ButtonGroup>
						<Button
							variant={openingColor === 'white' ? 'light' : 'outline-light'}
							onClick={() => setOpeningColor('white')}
							size="sm"
						>
							⬜ Brancas
						</Button>
						<Button
							variant={openingColor === 'black' ? 'dark' : 'outline-dark'}
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

			<ChessGame invertedBoard={invertedBoard} game={game} onDropCallback={handleDrop} />
			<Form>
				<Form.Label
					style={{
						color: 'white',
					}}
				>
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
		</Gap>
	);
};

export default Register;
