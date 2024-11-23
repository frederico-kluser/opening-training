import React from 'react';
import { Button } from 'react-bootstrap';

type DownloadProps = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
};

const Download = ({ data }: DownloadProps) => {
	const handleDownload = () => {
		const fileName = prompt('Digite o nome do arquivo', 'meu-treinamento');
		const json = JSON.stringify(data, null, 2);
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = `${fileName}.json`;
		a.click();

		URL.revokeObjectURL(url);
	};

	return (
		<Button variant="success" onClick={handleDownload}>
			Salvar
		</Button>
	);
};

export default Download;
