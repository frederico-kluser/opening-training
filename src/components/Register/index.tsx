import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { Chess } from 'chess.js';
import Gap from '../Gap';
import { FaRedo, FaSave, FaUndo } from 'react-icons/fa';
import { RiFlipVerticalFill, RiFlipVerticalLine } from 'react-icons/ri';
import { ImExit } from 'react-icons/im';
import ChessGame from '../ChessGame';

const Register = () => {
	const [invertedBoard, setInvertedBoard] = useState(false);
	const [game, setGame] = useState(new Chess());

	const isBlackTurn = () => game.turn() === 'b';

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

					const result = gameCopy.move(move);
					if (result) setGame(gameCopy);
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
				<Form.Control type="email" placeholder="Comente sobre a posição atual" as="textarea" rows={3} />
			</Form>
		</Gap>
	);
};

export default Register;
