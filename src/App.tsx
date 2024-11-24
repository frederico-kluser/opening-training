/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form } from 'react-bootstrap';
import { useState } from 'react';
import Gap from './components/Gap';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';

import './App.css';

type TypeMove = {
	after: string; //  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2';
	before: string; // 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
	color: string; //  'b';
	flags: string; //  'b';
	from: string; //   'e7';
	lan: string; //    'e7e5';
	piece: string; //  'p';
	san: string; //    'e5';
	to: string; //     'e5';
};

type TypeItem = {
	move: TypeMove;
	comment: string;
	nextMoves: TypeItem[];
};

type TypeStorage = {
	[variant: string]: TypeItem;
};

function App() {
	const [invertedBoard, setInvertedBoard] = useState(false);
	const [game, setGame] = useState(new Chess());
	const [storage, setStorage] = useState<TypeStorage>({});

	const isBlackTurn = () => game.turn() === 'b';

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

export default App;
