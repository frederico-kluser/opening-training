import './App.css';
import { useState } from 'react';
import Gap from './components/Gap';
import Upload from './components/Upload';
import { Button } from 'react-bootstrap';
import Register from './components/Register';

function App() {
	const [variant, setVariant] = useState<string>('');

	if (!variant) {
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

	return <Register variant={variant} />;
}

export default App;
