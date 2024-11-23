/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import Gap from './components/Gap';
import { Chess, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';

import './App.css';
import Download from './components/Download';
import Upload from './components/Upload';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type TypeTraining = {
	[key: string]: Move[];
};

function App() {
	const [invertedBoard, setInvertedBoard] = useState(false);
	const [game, setGame] = useState(new Chess());
	const [history, setHistory] = useState<Move[]>([]);
	const [actualIndex, setActualIndex] = useState<number>(-1);
	const [isTraining, setIsTraining] = useState<boolean>(false);

	useEffect(() => {
		console.log('history :', history);
		console.log('actualPosition :', actualIndex);
	}, [history]);

	useEffect(() => {
		if (actualIndex === -1) {
			setGame(new Chess());
		} else {
			const newGame = new Chess();
			newGame.load(history[actualIndex].after);
			setGame(newGame);
		}
	}, [actualIndex]);

	const cleanChessboard = () => {
		setActualIndex(-1);
	};

	const getMove = (move: any) => {
		const gameCopy = new Chess();
		gameCopy.load(game.fen());

		const result = gameCopy.move(move);

		return result;
	};

	const makeAMove = (move: any) => {
		const gameCopy = new Chess();
		gameCopy.load(game.fen());

		const result = gameCopy.move(move);
		if (result) setGame(gameCopy);

		return result;
	};

	const onDrop = (sourceSquare: string, targetSquare: string) => {
		const nextIndex = actualIndex + 1;

		if (isTraining) {
			const move = getMove({
				from: sourceSquare,
				to: targetSquare,
				promotion: 'q',
			});

			if (move === null) return false;

			const rightMove = history[nextIndex];

			if (rightMove.to === move.to && rightMove.from === move.from) {
				setActualIndex(nextIndex);

				if (nextIndex === history.length - 1) {
					alert('Treinamento finalizado!');
					handleTraining(false);
				}
				return true;
			}

			alert('Errado!');
			cleanChessboard();
			return false;
		} else {
			const move = makeAMove({
				from: sourceSquare,
				to: targetSquare,
				promotion: 'q',
			});

			if (move === null) return false;

			// Truncate the history if we have undone moves
			const newHistory = history.slice(0, nextIndex);
			newHistory.push(move);

			setHistory(newHistory);
			setActualIndex(newHistory.length - 1);

			return true;
		}
	};

	const handleNavigatePosition = (index: number) => {
		const newActualPosition = actualIndex + index;
		const newGame = new Chess();

		if (newActualPosition >= 0) {
			newGame.load(history[newActualPosition].after);
		}

		setActualIndex(newActualPosition);
	};

	const handleTraining = (trainingMode: boolean) => {
		setIsTraining(trainingMode);
		cleanChessboard();
	};

	const getButton = () => {
		if (isTraining) {
			return (
				<Gap size={16} horizontal>
					<Button
						variant="secondary"
						onClick={() => {
							setInvertedBoard(!invertedBoard);
						}}
					>
						Inverter tabuleiro
					</Button>
					<Button
						variant="danger"
						onClick={() => {
							handleTraining(false);
						}}
						disabled={!history.length}
					>
						Parar Treinamento
					</Button>
				</Gap>
			);
		}

		return (
			<Gap size={16} horizontal>
				<Button
					variant="secondary"
					onClick={() => {
						setInvertedBoard(!invertedBoard);
					}}
				>
					Inverter tabuleiro
				</Button>
				<Button
					variant="success"
					onClick={() => {
						handleTraining(true);
					}}
					disabled={!history.length}
				>
					Treinar
				</Button>
				<Button
					variant="light"
					onClick={() => {
						handleNavigatePosition(-1);
					}}
					disabled={!history.length || actualIndex === -1}
				>
					Undo
				</Button>
				<Button
					variant="light"
					onClick={() => {
						handleNavigatePosition(1);
					}}
					disabled={!history.length || history.length - 1 === actualIndex}
				>
					Next
				</Button>
				<Download data={history} disabled={!history.length} />
				<Upload
					onFileUpload={(data) => {
						setHistory(data);
						cleanChessboard();
						alert('Treinamento carregado com sucesso!');
					}}
				/>
			</Gap>
		);
	};

	return (
		<Gap size={16}>
			{getButton()}
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
