import React, { ChangeEvent } from 'react';
import { Button } from 'react-bootstrap';

type UploadProps = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onFileUpload: (data: any) => void;
};

const Upload = ({ onFileUpload }: UploadProps) => {
	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (!file) {
			alert('Nenhum arquivo selecionado.');
			return;
		}

		if (file.type !== 'application/json') {
			alert('Por favor, selecione um arquivo JSON.');
			return;
		}

		const reader = new FileReader();

		reader.onload = () => {
			try {
				const json = JSON.parse(reader.result as string);
				onFileUpload(json);
			} catch {
				alert('O arquivo não é um JSON válido.');
			}
		};

		reader.readAsText(file);
	};

	return (
		<div>
			<input
				type="file"
				accept="application/json"
				style={{ display: 'none' }}
				id="upload-json"
				onChange={handleFileChange}
			/>
			<label htmlFor="upload-json">
				<Button variant="primary" as="span">
					Carregar Treinamento
				</Button>
			</label>
		</div>
	);
};

export default Upload;
