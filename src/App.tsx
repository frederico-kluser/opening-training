import './App.css';
import { useState } from 'react';
import Gap from './components/Gap';
import Upload from './components/Upload';
import { Button } from 'react-bootstrap';
import Register, { TypeStorage } from './components/Register';

function App() {
	const [variant, setVariant] = useState<string>('');
	const [data, setData] = useState<TypeStorage>({});

	if (!variant) {
		return (
			<Gap size={16} padding={32} centralize>
				<Upload
					onFileUpload={(data) => {
						// TODO: criar um data validation
						console.log('data :', data);
						setData(data);
						// TODO: criar um seletor de variant
						setVariant(Object.keys(data)[0]);
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

	return <Register variant={variant} save={data} setSave={setData} />;
}

export default App;
