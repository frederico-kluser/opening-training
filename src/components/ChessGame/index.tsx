/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form } from 'react-bootstrap';
import { useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Gap from '../Gap';

function ChessGame() {
	const [invertedBoard, setInvertedBoard] = useState(false);
	const [game, setGame] = useState(new Chess());

	const isBlackTurn = () => game.turn() === 'b';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const isNotMyTurn = () => (isBlackTurn() && !invertedBoard) || (!isBlackTurn() && invertedBoard);

	const makeAMove = (move: any) => {
		const gameCopy = new Chess();
		gameCopy.load(game.fen());

		const result = gameCopy.move(move);
		if (result) setGame(gameCopy);

		return result;
	};

	const onDrop = (sourceSquare: string, targetSquare: string) => {
		const move = makeAMove({
			from: sourceSquare,
			to: targetSquare,
			promotion: 'q',
		});

		if (move === null) return false;

		console.log('move :', move);

		return true;
	};

	return (
		<Gap size={16} padding={16}>
			<Gap size={16} horizontal>
				<Button variant="light" onClick={() => {}}>
					Voltar
				</Button>
				<Button variant="primary" onClick={() => setInvertedBoard(!invertedBoard)}>
					Inverter tabuleiro
				</Button>
				<Button variant="light" onClick={() => {}}>
					Avançar
				</Button>
			</Gap>
			{/* <Form.Select aria-label="Default select example">
				<option>Selecionar variante</option>
				<option value="1">One</option>
				<option value="2">Two</option>
				<option value="3">Three</option>
			</Form.Select> */}
			<Chessboard
				id="BasicBoard"
				boardOrientation={invertedBoard ? 'black' : 'white'}
				position={game.fen()}
				onPieceDrop={onDrop}
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
}

export default ChessGame;
