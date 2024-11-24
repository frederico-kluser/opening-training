import ChessGame from './components/ChessGame';
import './App.css';
import { useState } from 'react';
import Gap from './components/Gap';
import Upload from './components/Upload';
import { Button } from 'react-bootstrap';

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
	const [storage, setStorage] = useState<TypeStorage>({});
	const [variant, setVariant] = useState<string>('');

	if (Object.keys(storage).length === 0 && !variant) {
		return (
			<Gap size={16} padding={32} centralize>
				<Upload
					onFileUpload={(data) => {
						console.log('data :', data);
					}}
				/>
				<Button
					variant="secondary"
					onClick={() => {
						const trainingName = prompt('Digite o nome do que quer treinar', 'caro-kann');
						setVariant(trainingName || '');
					}}
				>
					Novo Treinamento
				</Button>
			</Gap>
		);
	}

	return <ChessGame />;
}

export default App;
