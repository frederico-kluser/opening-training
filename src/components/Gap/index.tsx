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
	centralize?: boolean;
}

const Gap = ({ horizontal = false, size, padding, children, centralize }: GapProps) => {
	const gapStyle = {
		display: horizontal ? 'flex' : 'grid',
		gap: `${size}px`,
		padding: padding ? `${padding}px` : 0,
		...(horizontal && {
			flexWrap: 'wrap',
		}),
		...(centralize && {
			alignContent: 'center',
			alignItems: 'center',
			height: '100vh',
			justifyContent: 'center',
			width: '100vw',
			left: 0,
			position: 'fixed',
			top: 0,
		}),
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return <div style={gapStyle as any}>{children}</div>;
};

export default Gap;
