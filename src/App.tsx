import { useEffect, useState } from 'react';
import Gap from './components/Gap';
import Upload from './components/Upload';
import { Button } from 'react-bootstrap';
import TypeStorage from './types/TypeStorage';
import './App.css';
import isValidTypeStorage from './utils/isValidTypeStorage';
import Register from './Pages/Register';

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
			<Gap size={16} padding={32} centralize>
				<Upload onFileUpload={handleLoadData} />
				<Button
					variant="success"
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
					onClick={() => {
						const trainingName = prompt('Digite o nome do que quer treinar', 'caro-kann');
						setVariant(trainingName || '');
					}}
				>
					Novo Treinamento
				</Button>
				<Button
					variant="danger"
					onClick={() => {
						const user = prompt('Digite o seu usuário do chess.com', 'FredericoOliveira');

						if (user) {
							window.open(`https://www.chess.com/member/${user}/games`);
						}
					}}
				>
					Treinar minhas partidas
				</Button>
			</Gap>
		);
	}

	return <Register variant={variant} save={data} setSave={setData} handleExist={handleExist} />;
}

export default App;
