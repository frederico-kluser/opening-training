import { Button, Form } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import Gap from '../Gap';
import { FaRedo, FaSave, FaUndo } from 'react-icons/fa';
import { RiFlipVerticalFill, RiFlipVerticalLine } from 'react-icons/ri';
import { ImExit } from 'react-icons/im';
import ChessGame from '../ChessGame';

type TypeMove = {
	after: string; //  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
	lan: string; //    'e7e5';
};

type TypeItem = {
	move: TypeMove;
	comment: string;
};

export type TypeStorage = {
	[variant: string]: {
		[fen: string]: TypeItem[];
	};
};

interface RegisterProps {
	variant: string;
}

const Register = ({ variant }: RegisterProps): JSX.Element => {
	const [save, setSave] = useState<TypeStorage>({});

	const [invertedBoard, setInvertedBoard] = useState(false);
	const [game, setGame] = useState(new Chess());
	const [comment, setComment] = useState('');
	const [actualMove, setActualMove] = useState<TypeMove[]>([]);

	const isBlackTurn = () => game.turn() === 'b';

	useEffect(() => {
		console.log('actualMove :', actualMove);
	}, [actualMove]);

	useEffect(() => {
		console.log('save :', save);
	}, [save]);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const isNotMyTurn = () => (isBlackTurn() && !invertedBoard) || (!isBlackTurn() && invertedBoard);

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
			<ChessGame
				invertedBoard={invertedBoard}
				game={game}
				onDropCallback={(move) => {
					const gameCopy = new Chess();
					gameCopy.load(game.fen());

					const newMove = gameCopy.move(move);
					if (newMove) {
						const fen = gameCopy.fen();
						const move = {
							after: gameCopy.fen(),
							lan: newMove.lan,
						};

						const saveCopy = { ...save };
						if (!saveCopy[variant]) {
							saveCopy[variant] = {};
						}

						if (!saveCopy[variant][fen]) {
							saveCopy[variant][fen] = [];
						} else if (!saveCopy[variant][fen].find((item) => item.move.lan === move.lan)) {
							saveCopy[variant][fen].push({
								move,
								comment,
							});
						} else {
							saveCopy[variant][fen] = saveCopy[variant][fen].map((item) => {
								if (item.move.lan === move.lan) {
									return {
										...item,
										comment,
									};
								}
								return item;
							});
						}

						setActualMove((prev) => [...prev, move]);
						setSave(saveCopy);
						setGame(gameCopy);
						setComment('');
					}
				}}
			/>
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
