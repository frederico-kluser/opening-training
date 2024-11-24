/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import Gap from '../Gap';
import { FaRedo, FaSave, FaUndo } from 'react-icons/fa';
import { RiFlipVerticalFill, RiFlipVerticalLine } from 'react-icons/ri';
import { ImExit } from 'react-icons/im';

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

	const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
	const customPieces = useMemo(() => {
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
