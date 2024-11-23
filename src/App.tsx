import { Chessboard } from 'react-chessboard';
import './App.css';
import { Button } from 'react-bootstrap';
import { useState } from 'react';
import Gap from './components/Gap';

function App() {
	const [invertedBoard, setInvertedBoard] = useState(false);

	return (
		<Gap size={16}>
			<Button
				variant="primary"
				onClick={() => {
					setInvertedBoard(!invertedBoard);
				}}
			>
				Inverter tabuleiro
			</Button>
			<Chessboard id="BasicBoard" boardOrientation={invertedBoard ? 'black' : 'white'} />
		</Gap>
	);
}

export default App;
