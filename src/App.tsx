/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import Gap from './components/Gap';
import { Chess, Move } from 'chess.js'; // Certifique-se de usar a importação correta
import { Chessboard } from 'react-chessboard';

import './App.css';

function App() {
	const [invertedBoard, setInvertedBoard] = useState(false);
	const [game, setGame] = useState(new Chess()); // Instância do jogo
	const [history, setHistory] = useState<Move[]>([]);
	const [actualPosition, setActualPosition] = useState<number>(-1);

	useEffect(() => {
		console.log('history :', history);
		console.log('actualPosition :', actualPosition);
	}, [history]);

	// Função para processar o movimento
	function makeAMove(move: any) {
		const gameCopy = new Chess(); // Cria uma nova instância
		gameCopy.load(game.fen()); // Carrega o estado atual do jogo na nova instância

		const result = gameCopy.move(move); // Tenta realizar o movimento
		if (result) setGame(gameCopy); // Atualiza o estado do jogo apenas se o movimento for válido

		return result; // Retorna null se o movimento foi ilegal, ou o objeto do movimento se for válido
	}

	// Callback para quando uma peça for solta
	function onDrop(sourceSquare: any, targetSquare: any) {
		const move = makeAMove({
			from: sourceSquare,
			to: targetSquare,
			promotion: 'q', // Sempre promove para dama por simplicidade
		});

		// Se o movimento for inválido, retorne `false`
		if (move === null) return false;

		setActualPosition(history.length);
		setHistory([...history, move]);

		return true; // Permite o movimento válido
	}

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
				position={game.fen()} // Define a posição do tabuleiro baseada no estado atual
				onPieceDrop={onDrop} // Callback para quando uma peça é solta
			/>
		</Gap>
	);
}

export default App;
