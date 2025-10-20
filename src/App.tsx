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
import puzzleService from './services/PuzzleService';
import packageJson from '../package.json';

function App() {
	const [variant, setVariant] = useState<string>('');
	const [data, setData] = useState<TypeStorage>({});
	const [mode, setMode] = useState<'edit' | 'train' | ''>('');
	const [darkMode, setDarkMode] = useState<boolean>(() => {
		const saved = localStorage.getItem('darkMode');
		return saved ? JSON.parse(saved) : false;
	});

	useEffect(() => {
		if (Object.keys(data).length > 0) {
			localStorage.setItem('data', JSON.stringify(data));
		}
	}, [data]);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
		localStorage.setItem('darkMode', JSON.stringify(darkMode));
	}, [darkMode]);

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
	};

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
			<>
				<div className="theme-toggle" onClick={toggleDarkMode}>
					{darkMode ? '☀️' : '🌙'}
				</div>
				<div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)` }}>
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
			</>
		);
	}

	if (!variant) {
		const hasLocalData = !!localStorage.getItem('data');

		return (
			<>
				<div className="theme-toggle" onClick={toggleDarkMode}>
					{darkMode ? '☀️' : '🌙'}
				</div>
				<div className="min-vh-100 d-flex flex-column">
					{/* Clean Header */}
					<div className="bg-white shadow-sm">
					<div className="container py-4">
						<div className="text-center">
							<div className="d-flex justify-content-center align-items-center gap-2 mb-2">
								<h1 className="h2 fw-bold text-dark mb-0">♟ Sistema de Treino de Xadrez</h1>
								<span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
									v{packageJson.version}
								</span>
							</div>
							<p className="text-muted mb-0">Escolha uma opção para começar</p>
						</div>
					</div>
				</div>

				{/* Main Menu */}
				<div className="container-fluid flex-grow-1 d-flex align-items-center py-5">
					<div className="container">
						<div className="row g-4 justify-content-center">

							{/* Análise de Partidas */}
							<div className="col-12 col-sm-6 col-md-4">
								<Card
									className="h-100 border-0 shadow-sm hover-shadow"
									style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
									onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
									onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
									onClick={() => setVariant('game-analyzer')}
								>
									<Card.Body className="text-center p-4">
										<div className="mb-3" style={{ fontSize: '3rem' }}>📊</div>
										<h5 className="fw-bold mb-2">Analisar Partidas</h5>
										<p className="text-muted small mb-0">
											Importe partidas do Chess.com ou PGN para análise detalhada
										</p>
									</Card.Body>
								</Card>
							</div>

							{/* Treinar Puzzles */}
							<div className="col-12 col-sm-6 col-md-4">
								<Card
									className="h-100 border-0 shadow-sm hover-shadow"
									style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
									onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
									onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
									onClick={() => setVariant('puzzle-trainer')}
								>
									<Card.Body className="text-center p-4">
										<div className="mb-3" style={{ fontSize: '3rem' }}>🧩</div>
										<h5 className="fw-bold mb-2">Treinar Puzzles</h5>
										<p className="text-muted small mb-0">
											Resolva puzzles táticos nos modos Normal ou Rush
										</p>
									</Card.Body>
								</Card>
							</div>

							{/* Repertório de Aberturas */}
							<div className="col-12 col-sm-6 col-md-4">
								<Card
									className="h-100 border-0 shadow-sm"
									style={{ transition: 'transform 0.2s' }}
								>
									<Card.Body className="text-center p-4">
										<div className="mb-3" style={{ fontSize: '3rem' }}>📚</div>
										<h5 className="fw-bold mb-3">Repertório</h5>

										<div className="d-grid gap-2">
											{hasLocalData && (
												<Button
													variant="primary"
													size="sm"
													onClick={() => {
														const data = localStorage.getItem('data');
														handleLoadData(data ? JSON.parse(data) : {});
													}}
												>
													💾 Continuar
												</Button>
											)}

											<Button
												variant="outline-primary"
												size="sm"
												onClick={() => {
													const trainingName = prompt('Nome do repertório:', 'caro-kann');
													if (trainingName) {
														setVariant(trainingName);
														setMode('edit');
													}
												}}
											>
												➕ Novo
											</Button>

											<Upload onFileUpload={handleLoadData} />
										</div>
									</Card.Body>
								</Card>
							</div>

							{/* Segunda linha - Ferramentas auxiliares */}
							<div className="col-12 col-sm-6 col-md-4">
								<Card
									className="h-100 border-0 shadow-sm hover-shadow"
									style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
									onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
									onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
									onClick={() => setVariant('stockfish-test')}
								>
									<Card.Body className="text-center p-4">
										<div className="mb-3" style={{ fontSize: '3rem' }}>🤖</div>
										<h5 className="fw-bold mb-2">Stockfish</h5>
										<p className="text-muted small mb-0">
											Teste o engine de análise
										</p>
									</Card.Body>
								</Card>
							</div>

							{/* Chess.com */}
							<div className="col-12 col-sm-6 col-md-4">
								<Card
									className="h-100 border-0 shadow-sm hover-shadow"
									style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
									onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
									onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
									onClick={() => {
										const user = prompt('Usuário do Chess.com:', 'hikaru');
										if (user) {
											window.open(`https://www.chess.com/member/${user}/games`);
										}
									}}
								>
									<Card.Body className="text-center p-4">
										<div className="mb-3" style={{ fontSize: '3rem' }}>🌐</div>
										<h5 className="fw-bold mb-2">Chess.com</h5>
										<p className="text-muted small mb-0">
											Ver perfil no site
										</p>
									</Card.Body>
								</Card>
							</div>

							{/* GitHub */}
							<div className="col-12 col-sm-6 col-md-4">
								<Card
									className="h-100 border-0 shadow-sm hover-shadow"
									style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
									onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
									onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
									onClick={() => window.open('https://github.com/frederico-kluser/opening-training')}
								>
									<Card.Body className="text-center p-4">
										<div className="mb-3" style={{ fontSize: '3rem' }}>💻</div>
										<h5 className="fw-bold mb-2">GitHub</h5>
										<p className="text-muted small mb-0">
											Código fonte e docs
										</p>
									</Card.Body>
								</Card>
							</div>
						</div>

						{/* Statistics Footer */}
						<div className="row mt-5">
							<div className="col-12">
								<Card className="border-0 shadow-sm bg-primary text-white">
									<Card.Body>
										<div className="row text-center">
											<div className="col-6 col-md-3">
												<h4 className="mb-0">{puzzleService.getPuzzles().length}</h4>
												<small>Puzzles Salvos</small>
											</div>
											<div className="col-6 col-md-3">
												<h4 className="mb-0">{puzzleService.getStats().solvedPuzzles}</h4>
												<small>Resolvidos</small>
											</div>
											<div className="col-6 col-md-3">
												<h4 className="mb-0">{Math.round(puzzleService.getStats().successRate)}%</h4>
												<small>Taxa de Acerto</small>
											</div>
											<div className="col-6 col-md-3">
												<h4 className="mb-0">{hasLocalData ? '✅' : '❌'}</h4>
												<small>Dados Salvos</small>
											</div>
										</div>
									</Card.Body>
								</Card>
							</div>
						</div>
					</div>
				</div>
				</div>
			</>
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
