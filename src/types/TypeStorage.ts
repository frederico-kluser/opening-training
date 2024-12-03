type TypeStorage = {
	[variant: string]: {
		[fen: string]: {
			prevFen: string;
			comment: string;
			nextFen: string[];
		};
	};
};

export default TypeStorage;
