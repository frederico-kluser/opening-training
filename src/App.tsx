import { useEffect, useState } from 'react';
import Gap from './components/Gap';
import Upload from './components/Upload';
import { Button, Card } from 'react-bootstrap';
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
			<div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
				<div className="row w-100">
					<div className="col-12 col-md-8 col-lg-6 col-xl-5 mx-auto">
						<Card className="shadow-lg border-0">
							<Card.Body className="p-4">
								<h2 className="text-center mb-3">📚 Repertório Carregado</h2>
								<div className="alert alert-success text-center">
									<strong>Variantes disponíveis:</strong>
									<div className="mt-2">
										{variants.map((v, i) => (
											<span key={i} className="badge bg-primary me-2 mb-1">{v}</span>
										))}
									</div>
								</div>

								<Gap size={16}>
									<Button
										variant="primary"
										size="lg"
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
										<small className="d-block mt-1">Pratique com posições aleatórias</small>
									</Button>

									<Button
										variant="info"
										size="lg"
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
										<small className="d-block mt-1">Adicione ou modifique variantes</small>
									</Button>

									<hr className="w-100" />

									<Button
										variant="outline-secondary"
										className="w-100"
										onClick={handleExist}
									>
										← Voltar ao Menu
									</Button>
								</Gap>
							</Card.Body>
						</Card>
					</div>
				</div>
			</div>
		);
	}

	if (!variant) {
		return (
			<div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
				<div className="row w-100">
					<div className="col-12 col-md-10 col-lg-8 col-xl-6 mx-auto">
						<Card className="shadow-lg border-0">
							<Card.Body className="p-4">
								<h1 className="text-center mb-2">♟️ Chess Training System</h1>
								<p className="text-center text-muted mb-4">Sistema completo de treinamento de xadrez</p>

								<Gap size={16} centralize>
									{/* Seção de Repertórios */}
									<div className="w-100">
										<h5 className="mb-3">📚 Repertórios de Abertura</h5>
										<div className="d-grid gap-2">
											<Upload onFileUpload={handleLoadData} />

											<Button
												variant="success"
												size="lg"
												onClick={() => {
													const data = localStorage.getItem('data');
													handleLoadData(data ? JSON.parse(data) : {});
												}}
												disabled={!localStorage.getItem('data')}
											>
												💾 Carregar Repertório Salvo
												<small className="d-block mt-1">Continuar de onde parou</small>
											</Button>

											<Button
												variant="outline-primary"
												onClick={() => {
													const trainingName = prompt('Digite o nome do repertório', 'caro-kann');
													if (trainingName) {
														setVariant(trainingName);
														setMode('edit');
													}
												}}
											>
												➕ Criar Novo Repertório
												<small className="d-block mt-1">Cadastre suas variantes</small>
											</Button>
										</div>
									</div>

									<hr className="w-100" />

									{/* Seção de Análise */}
									<div className="w-100">
										<h5 className="mb-3">🔍 Análise e Treinamento</h5>
										<div className="d-grid gap-2">
											<Button
												variant="primary"
												size="lg"
												onClick={() => setVariant('puzzle-trainer')}
											>
												🧩 Treinar Puzzles
												<small className="d-block mt-1">Resolva puzzles dos seus erros</small>
											</Button>

											<Button
												variant="info"
												onClick={() => setVariant('game-analyzer')}
											>
												📊 Analisar Partidas
												<small className="d-block mt-1">Detecte erros e gere puzzles</small>
											</Button>

											<Button
												variant="outline-danger"
												onClick={() => {
													const user = prompt('Digite o seu usuário do chess.com', 'FredericoOliveira');
													if (user) {
														window.open(`https://www.chess.com/member/${user}/games`);
													}
												}}
											>
												🌐 Minhas Partidas Chess.com
												<small className="d-block mt-1">Acesse suas partidas online</small>
											</Button>
										</div>
									</div>

									<hr className="w-100" />

									{/* Ferramentas */}
									<div className="w-100">
										<Button
											variant="outline-secondary"
											className="w-100"
											onClick={() => setVariant('stockfish-test')}
										>
											⚙️ Testar Engine Stockfish
										</Button>
									</div>
								</Gap>
							</Card.Body>
						</Card>
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
