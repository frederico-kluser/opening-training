/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import Gap from './components/Gap';
import { Chess, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';

import './App.css';

function App() {
	const [invertedBoard, setInvertedBoard] = useState(false);
	const [game, setGame] = useState(new Chess());
	const [history, setHistory] = useState<Move[]>([]);
	const [actualPosition, setActualPosition] = useState<number>(-1);

	useEffect(() => {
		console.log('history :', history);
		console.log('actualPosition :', actualPosition);
	}, [history]);

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

		// TODO: preciso melhorar aqui, pra quando eu voltar com Undo e fizer outro movimento, não continue incrementando no history a reveria
		setActualPosition(history.length);
		setHistory([...history, move]);

		return true;
	};

	const handleNavigatePosition = (index: number) => {
		const newActualPosition = actualPosition + index;
		const newGame = new Chess();

		if (newActualPosition >= 0) {
			newGame.load(history[newActualPosition].after);
		}

		setActualPosition(newActualPosition);
		setGame(newGame);
	};

	return (
		<Gap size={16}>
			<Gap size={16} horizontal>
				<Button
					variant="primary"
					onClick={() => {
						setInvertedBoard(!invertedBoard);
					}}
				>
					Inverter tabuleiro
				</Button>
				<Button variant="secondary" onClick={() => {}}>
					Replay
				</Button>
				<Button
					variant="light"
					onClick={() => {
						handleNavigatePosition(-1);
					}}
					disabled={!history.length || actualPosition === -1}
				>
					Undo
				</Button>
				<Button
					variant="light"
					onClick={() => {
						handleNavigatePosition(1);
					}}
					disabled={!history.length || history.length - 1 === actualPosition}
				>
					Next
				</Button>
			</Gap>
			<Chessboard
				id="BasicBoard"
				boardOrientation={invertedBoard ? 'black' : 'white'}
				position={game.fen()}
				onPieceDrop={onDrop}
			/>
		</Gap>
	);
}

export default App;
