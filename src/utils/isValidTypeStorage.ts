/* eslint-disable @typescript-eslint/no-explicit-any */

const isValidTypeStorage = (obj: any): boolean => {
	if (typeof obj !== 'object' || obj === null) return false;

	for (const variant in obj) {
		if (typeof obj[variant] !== 'object' || obj[variant] === null) return false;

		for (const fen in obj[variant]) {
			const entry = obj[variant][fen];

			if (
				typeof entry !== 'object' ||
				entry === null ||
				typeof entry.prevFen !== 'string' ||
				typeof entry.comment !== 'string' ||
				!Array.isArray(entry.nextFen) ||
				!entry.nextFen.every((next: any) => typeof next === 'string')
			) {
				return false;
			}
		}
	}

	return true;
};

export default isValidTypeStorage;
