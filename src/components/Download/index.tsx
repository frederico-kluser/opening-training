import { Button } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

type DownloadProps = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: any;
	disabled: boolean;
};

const Download = ({ data, disabled }: DownloadProps) => {
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
		<Button variant="primary" onClick={handleDownload} disabled={disabled}>
			<FaSave />
		</Button>
	);
};

export default Download;
