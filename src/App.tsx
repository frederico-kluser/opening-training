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
import OpeningTrainer from './components/OpeningTrainer';

function App() {
	const [variant, setVariant] = useState<string>('');
	const [data, setData] = useState<TypeStorage>({});
	const [mode, setMode] = useState<'edit' | 'train' | ''>('');

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
			// Não define variant automaticamente, deixa o usuário escolher
		} else {
			alert('Invalid data');
		}
	};

	const handleExist = () => {
		setVariant('');
		setData({});
		setMode('');
	};

	// Tela de seleção de modo quando há dados carregados mas nenhum modo selecionado
	if (Object.keys(data).length > 0 && !variant && !mode) {
		const variants = Object.keys(data);
		return (
			<div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3">
				<div className="row w-100">
					<div className="col-12 col-md-8 col-lg-6 col-xl-4 mx-auto">
						<Gap size={16} centralize>
							<h2 className="text-center mb-4">Repertório Carregado</h2>
							<h5 className="text-center mb-3">Variantes disponíveis: {variants.join(', ')}</h5>

							<Button
								variant="primary"
								className="w-100"
								onClick={() => {
									const selectedVariant = variants.length === 1
										? variants[0]
										: prompt(`Escolha uma variante: ${variants.join(', ')}`, variants[0]);
									if (selectedVariant && data[selectedVariant]) {
										setVariant(selectedVariant);
										setMode('train');
									}
								}}
							>
								🎯 Treinar Abertura
							</Button>

							<Button
								variant="info"
								className="w-100"
								onClick={() => {
									const selectedVariant = variants.length === 1
										? variants[0]
										: prompt(`Escolha uma variante: ${variants.join(', ')}`, variants[0]);
									if (selectedVariant && data[selectedVariant]) {
										setVariant(selectedVariant);
										setMode('edit');
									}
								}}
							>
								✏️ Editar Repertório
							</Button>

							<Button
								variant="secondary"
								className="w-100"
								onClick={handleExist}
							>
								← Voltar
							</Button>
						</Gap>
					</div>
				</div>
			</div>
		);
	}

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
									if (trainingName) {
										setVariant(trainingName);
										setMode('edit');
									}
								}}
							>
								Novo Repertório
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

	// Modo de treinamento de abertura
	if (mode === 'train' && variant && data[variant]) {
		return <OpeningTrainer variant={variant} data={data} onExit={handleExist} />;
	}

	// Modo de edição (Register)
	return <Register variant={variant} save={data} setSave={setData} handleExist={handleExist} />;
}

export default App;
