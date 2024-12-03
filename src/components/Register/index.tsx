import { Button, Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Chess, Move } from 'chess.js';
import Gap from '../Gap';
import { FaRedo, FaSave, FaUndo } from 'react-icons/fa';
import { RiFlipVerticalFill, RiFlipVerticalLine } from 'react-icons/ri';
import { ImExit } from 'react-icons/im';
import ChessGame from '../ChessGame';

const initialFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export type TypeStorage = {
	[variant: string]: {
		[fen: string]: {
			prevFen: string[];
			comment: string;
			nextFen: string[];
		};
	};
};

interface RegisterProps {
	variant: string;
}

const Register = ({ variant }: RegisterProps): JSX.Element => {
	const [save, setSave] = useState<TypeStorage>({});
	const [actualFen, setActualFen] = useState(initialFen);

	const [invertedBoard, setInvertedBoard] = useState(false);
	const [game, setGame] = useState(new Chess());
	const [comment, setComment] = useState('');

	const isBlackTurn = () => game.turn() === 'b';

	useEffect(() => {
		console.log('save :', save);
	}, [save]);

	useEffect(() => {
		setSave((prevSave) => {
			const newSave = { ...prevSave };
			if (!newSave[variant]) {
				newSave[variant] = {};
			}
			newSave[variant][actualFen] = {
				prevFen: [],
				comment,
				nextFen: [],
			};
			return newSave;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comment, variant]);

	useEffect(() => {
		if (actualFen !== initialFen) {
			setGame(new Chess(actualFen));
		}
	}, [actualFen]);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const isNotMyTurn = () => (isBlackTurn() && !invertedBoard) || (!isBlackTurn() && invertedBoard);

	const handleDrop = (move: Move) => {
		const gameCopy = new Chess();
		gameCopy.load(game.fen());

		const newMove = gameCopy.move(move);
		if (newMove) {
			const fen = gameCopy.fen();
			setSave((prevSave) => {
				const newSave = { ...prevSave };
				if (newSave[variant][actualFen].nextFen.indexOf(fen) === -1) {
					newSave[variant][actualFen].nextFen.push(fen);
				}
				return newSave;
			});
			setActualFen(fen);
		} else {
			console.log('Invalid move');
		}
	};

	return (
		<Gap size={16} padding={16}>
			<Gap size={16} horizontal>
				<Button variant="danger" onClick={() => {}}>
					<ImExit color="white" />
				</Button>
				<Button variant="light" onClick={() => {}} disabled>
					<FaUndo />
				</Button>
				<Button variant="secondary" onClick={() => setInvertedBoard(!invertedBoard)}>
					{!invertedBoard ? <RiFlipVerticalLine /> : <RiFlipVerticalFill />}
				</Button>
				<Button variant="light" onClick={() => {}} disabled>
					<FaRedo />
				</Button>
				<Button variant="primary" onClick={() => {}} disabled>
					<FaSave />
				</Button>
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
