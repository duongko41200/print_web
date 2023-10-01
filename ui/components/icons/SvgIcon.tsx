import React from 'react';

interface SvgIconProps {
	width?: number;
	height?: number;
}

export const LogoIcon: React.FC<SvgIconProps> = ({ width, height }) => {
	return (
		<img
			loading='lazy'
			src='/static/images/icons/svg/logo.svg'
			alt='app logo'
			width={width || 32}
			height={height || 32}
		/>
	);
};

export const HandShakeIcon: React.FC<SvgIconProps> = ({ width, height }) => {
	return (
		<img
			loading='lazy'
			src='/static/images/icons/svg/hand-shake.svg'
			alt='shake hand'
			width={width || 32}
			height={height || 32}
		/>
	);
};

export const CursorIcon: React.FC<SvgIconProps> = ({ width, height }) => {
	return (
		<img
			loading='lazy'
			src='/static/images/icons/svg/cursor.svg'
			alt='shared cursor'
			width={width || 32}
			height={height || 32}
		/>
	);
};

export const PixabayIcon: React.FC<SvgIconProps> = ({ width, height }) => {
	return (
		<img
			loading='lazy'
			src='/static/images/icons/svg/pixabay.svg'
			alt=''
			width={width || 32}
			height={height || 32}
		/>
	);
};
