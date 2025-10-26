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
import openingService from './services/OpeningService';
import packageJson from '../package.json';

function App() {
	const [variant, setVariant] = useState<string>('');
	const [selectedOpeningId, setSelectedOpeningId] = useState<string>('');
	const [mode, setMode] = useState<'edit' | 'train' | ''>('');
	const [darkMode, setDarkMode] = useState<boolean>(() => {
		const saved = localStorage.getItem('darkMode');
		return saved ? JSON.parse(saved) : false;
	});
	// Estado para gerenciar os dados da abertura sendo editada
	const [currentOpeningData, setCurrentOpeningData] = useState<TypeStorage>({});
	// Estado para forçar re-renderização quando aberturas mudarem
	const [, setRefreshKey] = useState(0);

	// Função para forçar atualização da lista de aberturas
	const refreshOpeningsList = () => {
		setRefreshKey(prev => prev + 1);
	};

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
		localStorage.setItem('darkMode', JSON.stringify(darkMode));
	}, [darkMode]);

	const toggleDarkMode = () => {
		setDarkMode(!darkMode);
	};

	// Inicializar dados da abertura quando variant muda
	// ⚠️ IMPORTANTE: useEffect deve ser chamado ANTES de qualquer return condicional
	useEffect(() => {
		if (variant && variant !== 'game-analyzer' && variant !== 'puzzle-trainer' && variant !== 'show-openings' && variant !== 'stockfish-test') {
			const opening = openingService.getOpeningByName(variant);
			if (opening) {
				setCurrentOpeningData({ [variant]: opening.positions });
			} else {
				setCurrentOpeningData({ [variant]: {} });
			}
		}
	}, [variant]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleLoadData = (data: any) => {
		console.log('data importado:', data);

		if (isValidTypeStorage(data)) {
			// Importar cada variante como uma abertura separada no OpeningService
			Object.keys(data).forEach(variantName => {
				const existing = openingService.getOpeningByName(variantName);
				if (existing) {
					console.log(`⚠️ Abertura "${variantName}" já existe, atualizando...`);
					openingService.updateOpening(existing.id, {
						positions: data[variantName]
					});
				} else {
					// Criar nova abertura (cor padrão: white)
					openingService.createOpening({
						name: variantName,
						color: 'white',
						positions: data[variantName]
					});
					console.log(`✅ Abertura "${variantName}" importada com sucesso!`);
				}
			});

			refreshOpeningsList();
			alert('Aberturas importadas com sucesso!');
		} else {
			alert('Formato de dados inválido');
		}
	};

	const handleExist = () => {
		setVariant('');
		setSelectedOpeningId('');
		setMode('');
		setCurrentOpeningData({});
		refreshOpeningsList();
	};

	// Download de abertura
	const handleDownloadOpening = (openingId: string) => {
		const opening = openingService.getOpeningById(openingId);
		if (!opening) {
			alert('Abertura não encontrada');
			return;
		}

		const json = openingService.exportOpening(openingId);
		if (!json) {
			alert('Erro ao exportar abertura');
			return;
		}

		// Criar blob e fazer download
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${opening.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		console.log(`✅ Abertura "${opening.name}" exportada com sucesso`);
	};

	// Deletar abertura
	const handleDeleteOpening = (variantName: string) => {
		const confirmed = window.confirm(`Tem certeza que deseja deletar a abertura "${variantName}"?`);
		if (!confirmed) return;

		const opening = openingService.getOpeningByName(variantName);
		if (opening) {
			openingService.deleteOpening(opening.id);
			console.log(`✅ Abertura "${variantName}" deletada com sucesso`);
			refreshOpeningsList();
			alert(`Abertura "${variantName}" foi deletada com sucesso!`);
		} else {
			alert(`Abertura "${variantName}" não encontrada`);
		}
	};

	// Obter todas as aberturas
	const allOpenings = openingService.getOpenings();

	// Tela de lista de aberturas (apenas quando explicitamente solicitado)
	if (variant === 'show-openings' && !mode) {
		return (
			<>
				<div className="theme-toggle" onClick={toggleDarkMode}>
					{darkMode ? '☀️' : '🌙'}
				</div>
				<div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3" style={{ background: `linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)` }}>
					<div className="row w-100">
					<div className="col-12 col-md-10 col-lg-8 mx-auto">
						<Card className="shadow-lg border-0">
							<Card.Body className="p-4">
								<h2 className="text-center mb-4">📚 Minhas Aberturas</h2>

								{/* Lista de aberturas */}
								<div className="mb-4">
									{allOpenings.map((opening) => {
										const positionCount = opening.stats?.totalPositions || 0;
										const colorIcon = opening.color === 'white' ? '⬜' : '⬛';

										return (
											<Card key={opening.id} className="mb-3 shadow-sm">
												<Card.Body className="p-3">
													<div className="d-flex justify-content-between align-items-center">
														<div className="flex-grow-1">
															<h5 className="mb-1">
																{colorIcon} {opening.name}
															</h5>
															<div className="text-muted small">
																{positionCount} posições disponíveis
																{opening.stats && (
																	<> • {Math.round(opening.stats.accuracy)}% de acerto</>
																)}
															</div>
														</div>

														<div className="d-flex gap-2 flex-wrap">
															<Button
																variant="success"
																size="sm"
																onClick={() => {
																	setVariant(opening.name);
																	setSelectedOpeningId(opening.id);
																	setMode('train');
																}}
																title="Treinar esta abertura"
															>
																🎯 Treinar
															</Button>

															<Button
																variant="info"
																size="sm"
																onClick={() => {
																	setVariant(opening.name);
																	setSelectedOpeningId(opening.id);
																	setMode('edit');
																}}
																title="Editar esta abertura"
															>
																✏️ Editar
															</Button>

															<Button
																variant="primary"
																size="sm"
																onClick={() => handleDownloadOpening(opening.id)}
																title="Baixar abertura em JSON"
															>
																💾 Download
															</Button>

															<Button
																variant="danger"
																size="sm"
																onClick={() => handleDeleteOpening(opening.name)}
																title="Deletar esta abertura"
															>
																🗑️
															</Button>
														</div>
													</div>
												</Card.Body>
											</Card>
										);
									})}
								</div>

								<Gap size={12}>
									<hr className="w-100" />

									<Button
										variant="outline-secondary"
										className="w-100"
										onClick={handleExist}
									>
										← Voltar ao Menu Principal
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
		const hasLocalData = allOpenings.length > 0;

		return (
			<>
				{/* Video Background */}
				<div className="video-background">
					<video
						autoPlay
						loop
						muted
						playsInline
						preload="auto"
						poster="/bg-video-poster.jpg"
					>
						<source src="/bg-video-hd_1280_720_25fps.mp4" type="video/mp4" />
						Seu navegador não suporta vídeos HTML5.
					</video>
				</div>
				<div className="video-overlay"></div>

				<div className="theme-toggle" onClick={toggleDarkMode}>
					{darkMode ? '☀️' : '🌙'}
				</div>
				<div className="min-vh-100 d-flex flex-column home-content">
					{/* Clean Header */}
					<div className="shadow-sm" style={{ backgroundColor: 'var(--bg-card)' }}>
					<div className="container py-4">
						<div className="text-center">
							<div className="d-flex justify-content-center align-items-center gap-2 mb-2">
								<h1 className="h2 fw-bold mb-0">♟ Sistema de Treino de Xadrez</h1>
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

							{/* Treinar Aberturas */}
							<div className="col-12 col-sm-6 col-md-4">
								<Card
									className="h-100 border-0 shadow-sm"
									style={{ transition: 'transform 0.2s' }}
								>
									<Card.Body className="text-center p-4">
										<div className="mb-3" style={{ fontSize: '3rem' }}>📚</div>
										<h5 className="fw-bold mb-3">Treinar Aberturas</h5>

										<div className="d-grid gap-2">
											{hasLocalData && (
												<Button
													variant="primary"
													size="sm"
													onClick={() => {
														// Mostrar lista de aberturas salvas
														setVariant('show-openings');
													}}
												>
													💾 Minhas Aberturas ({allOpenings.length})
												</Button>
											)}

											<Button
												variant="outline-primary"
												size="sm"
												onClick={() => {
													const trainingName = prompt('Nome da nova abertura:', 'Siciliana Dragão');
													if (trainingName && trainingName.trim()) {
														// Verificar se já existe
														const existing = openingService.getOpeningByName(trainingName);
														if (existing) {
															const loadExisting = window.confirm(
																`A abertura "${trainingName}" já existe. Deseja editá-la?`
															);
															if (loadExisting) {
																setVariant(trainingName);
																setSelectedOpeningId(existing.id);
																setMode('edit');
															}
														} else {
															// Criar nova abertura vazia
															setVariant(trainingName);
															setMode('edit');
														}
													}
												}}
											>
												➕ Nova Abertura
											</Button>

											<Upload onFileUpload={handleLoadData} />
										</div>
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

						{/* GitHub Footer */}
						<div className="row mt-3">
							<div className="col-12">
								<div className="text-center">
									<Button
										variant="outline-secondary"
										size="sm"
										onClick={() => window.open('https://github.com/frederico-kluser/opening-training')}
										className="d-inline-flex align-items-center gap-2"
									>
										<span>💻</span>
										<span>Código Fonte no GitHub</span>
									</Button>
									<div className="mt-2">
										<small className="text-muted">
											v{packageJson.version} • Licença MIT
										</small>
									</div>
								</div>
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
	if (mode === 'train' && selectedOpeningId) {
		const opening = openingService.getOpeningById(selectedOpeningId);
		if (opening) {
			// Converter para formato legado temporariamente (compatibilidade)
			const legacyData: TypeStorage = {
				[opening.name]: opening.positions
			};
			return <OpeningTrainer variant={opening.name} data={legacyData} onExit={handleExist} />;
		}
	}

	// Modo de edição (Register)
	return (
		<Register
			variant={variant}
			save={currentOpeningData}
			setSave={setCurrentOpeningData}
			handleExist={handleExist}
		/>
	);
}

export default App;
