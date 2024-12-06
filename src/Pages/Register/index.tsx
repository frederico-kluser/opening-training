import { Button, Form } from 'react-bootstrap';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Chess, Move } from 'chess.js';
import { FaRedo, FaUndo } from 'react-icons/fa';
import { RiFlipVerticalFill, RiFlipVerticalLine } from 'react-icons/ri';
import { ImExit } from 'react-icons/im';
import TypeStorage from '../../types/TypeStorage';
import Gap from '../../components/Gap';
import Download from '../../components/Download';
import ChessGame from '../../components/ChessGame';

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

	// const isBlackTurn = () => game.turn() === 'b';

	useEffect(() => {
		console.log('save :', save);
	}, [save]);

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
	}, [actualFen]);

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

	return (
		<Gap size={16} padding={16}>
			<Gap size={16} horizontal>
				<Button variant="danger" onClick={handleExist}>
					<ImExit color="white" />
				</Button>
				<Button
					variant="light"
					onClick={() => {
						if (save[variant][actualFen]?.prevFen) {
							setActualFen(save[variant][actualFen]?.prevFen);
						} else if (actualFen !== initialFen) {
							setActualFen(initialFen);
						} else {
							throw new Error('Not implemented');
						}
					}}
					disabled={actualFen === initialFen}
				>
					<FaUndo />
				</Button>
				<Button variant="secondary" onClick={() => setInvertedBoard(!invertedBoard)}>
					{!invertedBoard ? <RiFlipVerticalLine /> : <RiFlipVerticalFill />}
				</Button>
				<Button
					variant="light"
					onClick={() => {
						if (save[variant][actualFen]?.nextFen.length > 0) {
							// TODO: Implementar a seleção de variações
							setActualFen(save[variant][actualFen]?.nextFen[0]);
						} else {
							throw new Error('Not implemented');
						}
					}}
					disabled={save[variant] && save[variant][actualFen]?.nextFen.length === 0}
				>
					<FaRedo />
				</Button>
				<Download data={save} disabled={Object.keys(save).length === 0} />
			</Gap>
			{/* <Form.Select aria-label="Default select example">
				<option>Selecionar variante</option>
				<option value="1">One</option>
				<option value="2">Two</option>
				<option value="3">Three</option>
			</Form.Select> */}
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
