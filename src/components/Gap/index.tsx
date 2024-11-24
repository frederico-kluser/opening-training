import React from 'react';

type TypeValidNumbers =
	| 4
	| 8
	| 12
	| 16
	| 20
	| 24
	| 32
	| 40
	| 48
	| 56
	| 64
	| 72
	| 80
	| 88
	| 96
	| 104
	| 112
	| 120
	| 128
	| 200;

interface GapProps {
	horizontal?: boolean;
	size: TypeValidNumbers;
	padding?: TypeValidNumbers;
	children: React.ReactNode;
}

const Gap = ({ horizontal = false, size, padding, children }: GapProps) => {
	const gapStyle = {
		display: horizontal ? 'flex' : 'grid',
		gap: `${size}px`,
		padding: padding ? `${padding}px` : 0,
	};

	return <div style={gapStyle}>{children}</div>;
};

export default Gap;
