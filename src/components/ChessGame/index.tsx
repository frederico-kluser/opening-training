/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from 'react';
import { Chess, Move } from 'chess.js';
import CMChessboardWrapper, { CMChessboardHandle, ArrowConfig, MarkerConfig } from '../ChessBoard/CMChessboardWrapper';

interface ChessGameProps {
	invertedBoard: boolean;
	game: Chess;
	onDropCallback: (move: Move) => void;
	boardWidth?: string;
	arrows?: ArrowConfig[];
	markers?: MarkerConfig[];
	lastMove?: [string, string] | null;
}

const ChessGame = ({
	invertedBoard,
	game,
	onDropCallback,
	boardWidth = 'min(500px, 90vw, 70vh)',
	arrows = [],
	markers = [],
	lastMove
}: ChessGameProps) => {
	const boardRef = useRef<CMChessboardHandle>(null);

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

	return (
		<CMChessboardWrapper
			ref={boardRef}
			position={game.fen()}
			orientation={invertedBoard ? 'black' : 'white'}
			onMove={onDrop}
			width={boardWidth}
			arrows={arrows}
			markers={markers}
			lastMove={lastMove}
			showCoordinates={true}
			style={{
				borderRadius: '4px',
				boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
			}}
		/>
	);
};

export default ChessGame;
