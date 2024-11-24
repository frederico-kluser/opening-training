/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { Chess, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface ChessGameProps {
	invertedBoard: boolean;
	game: Chess;
	onDropCallback: (move: Move) => void;
}

const ChessGame = ({ invertedBoard, game, onDropCallback }: ChessGameProps) => {
	const makeAMove = (move: any) => {
		const gameCopy = new Chess();
		gameCopy.load(game.fen());
		try {
			const result = gameCopy.move(move);
			return result;
		} catch {
			return null;
		}
	};

	const onDrop = (sourceSquare: string, targetSquare: string) => {
		const move = makeAMove({
			from: sourceSquare,
			to: targetSquare,
			promotion: 'q',
		});

		if (move === null) return false;

		console.log('move :', move);
		onDropCallback(move);

		return true;
	};

	const customPieces = useMemo(() => {
		const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
		const pieceComponents: any = {};
		pieces.forEach((piece) => {
			pieceComponents[piece] = ({ squareWidth }: any) => (
				<div
					style={{
						width: squareWidth,
						height: squareWidth,
						backgroundImage: `url(src/assets/${piece}.png)`,
						backgroundSize: '100%',
					}}
				/>
			);
		});
		return pieceComponents;
	}, []);

	return (
		<Chessboard
			id="BasicBoard"
			boardOrientation={invertedBoard ? 'black' : 'white'}
			position={game.fen()}
			onPieceDrop={onDrop}
			customPieces={customPieces}
			customBoardStyle={{
				borderRadius: '4px',
				boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
			}}
			customDarkSquareStyle={{
				backgroundColor: '#779952',
			}}
			customLightSquareStyle={{
				backgroundColor: '#edeed1',
			}}
		/>
	);
};

export default ChessGame;
