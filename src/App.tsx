import { useEffect, useState } from 'react';
import Gap from './components/Gap';
import Upload from './components/Upload';
import { Button } from 'react-bootstrap';
import TypeStorage from './types/TypeStorage';
import './App.css';
import isValidTypeStorage from './utils/isValidTypeStorage';
import Register from './Pages/Register';
import StockfishTest from './components/StockfishTest';
import GameAnalyzer from './components/GameAnalyzer';
import PuzzleTrainer from './components/PuzzleTrainer';

function App() {
	const [variant, setVariant] = useState<string>('');
	const [data, setData] = useState<TypeStorage>({});

	useEffect(() => {
		if (Object.keys(data).length > 0) {
			localStorage.setItem('data', JSON.stringify(data));
		}
	}, [data]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleLoadData = (data: any) => {
		console.log('data :', data);

		if (isValidTypeStorage(data)) {
			setData(data);
			setVariant(Object.keys(data)[0]);
		} else {
			alert('Invalid data');
		}
	};

	const handleExist = () => {
		setVariant('');
		setData({});
	};

	if (!variant) {
		return (
			<div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3">
				<div className="row w-100">
					<div className="col-12 col-md-8 col-lg-6 col-xl-4 mx-auto">
						<Gap size={16} centralize>
							<h2 className="text-center mb-4">Opening Training</h2>
							<Upload onFileUpload={handleLoadData} />
							<Button
								variant="success"
								className="w-100"
								onClick={() => {
									const data = localStorage.getItem('data');
									handleLoadData(data ? JSON.parse(data) : {});
								}}
								disabled={(() => {
									const data = localStorage.getItem('data');
									return !data;
								})()}
							>
								Carregar da Memória
							</Button>
							<Button
								variant="secondary"
								className="w-100"
								onClick={() => {
									const trainingName = prompt('Digite o nome do que quer treinar', 'caro-kann');
									setVariant(trainingName || '');
								}}
							>
								Novo Treinamento
							</Button>
							<Button
								variant="danger"
								className="w-100"
								onClick={() => {
									const user = prompt('Digite o seu usuário do chess.com', 'FredericoOliveira');

									if (user) {
										window.open(`https://www.chess.com/member/${user}/games`);
									}
								}}
							>
								Treinar minhas partidas
							</Button>
							<Button
								variant="warning"
								className="w-100"
								onClick={() => setVariant('stockfish-test')}
							>
								Testar Stockfish
							</Button>
							<Button
								variant="info"
								className="w-100"
								onClick={() => setVariant('game-analyzer')}
							>
								Analisar Partidas
							</Button>
							<Button
								variant="primary"
								className="w-100"
								onClick={() => setVariant('puzzle-trainer')}
							>
								Treinar Puzzles
							</Button>
						</Gap>
					</div>
				</div>
			</div>
		);
	}

	if (variant === 'stockfish-test') {
		return <StockfishTest />;
	}

	if (variant === 'game-analyzer') {
		return <GameAnalyzer />;
	}

	if (variant === 'puzzle-trainer') {
		return <PuzzleTrainer />;
	}

	return <Register variant={variant} save={data} setSave={setData} handleExist={handleExist} />;
}

export default App;
