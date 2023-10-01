import { CSSProperties } from 'react';
import styled from '@emotion/styled';

const IconContainer = styled.div<CSSProperties>({
	borderRadius: '4px',
	background: 'rgba(255, 255, 255, 0.15)',
	cursor: 'pointer',
});

export function BoldIcon() {
	return (
		<IconContainer>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
			>
				<path
					fill='currentColor'
					fillRule='evenodd'
					d='M7.08 4.72h4.44c2.03 0 3.5.3 4.41.87.92.57 1.37 1.49 1.37 2.75 0 .85-.2 1.55-.6 2.1-.4.54-.93.87-1.6.98v.1c.91.2 1.56.58 1.96 1.13.4.56.6 1.3.6 2.2 0 1.31-.47 2.33-1.4 3.06A6.1 6.1 0 0 1 12.41 19H7.08V4.72zm3.03 5.66h1.75c.82 0 1.42-.13 1.79-.38.36-.26.55-.68.55-1.26 0-.55-.2-.94-.6-1.18a3.86 3.86 0 0 0-1.9-.36h-1.6v3.18zm0 2.4v3.72h1.97c.83 0 1.45-.16 1.84-.48.4-.32.6-.8.6-1.46 0-1.19-.85-1.78-2.54-1.78h-1.87z'
				></path>
			</svg>
		</IconContainer>
	);
}

export function ItalicIcon() {
	return (
		<IconContainer>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
			>
				<path
					fill='currentColor'
					fillRule='evenodd'
					d='m14.73 6.5-3.67 11H14l-.3 1.5H6l.3-1.5h2.81l3.68-11H10l.3-1.5H18l-.3 1.5h-2.97z'
				></path>
			</svg>
		</IconContainer>
	);
}

export function UnderscoreIcon() {
	return (
		<IconContainer>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
			>
				<path
					d='M6 21.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM15.754 14.006V5h1.528v8.95c0 1.574-.476 2.807-1.424 3.703-.948.896-2.253 1.347-3.92 1.347-1.667 0-2.952-.454-3.862-1.356-.904-.902-1.358-2.145-1.358-3.733V5h1.528v9.025c0 1.168.32 2.072.966 2.704.646.632 1.592.945 2.83.945 1.183 0 2.1-.313 2.746-.945.646-.638.966-1.548.966-2.723Z'
					fill='currentColor'
				></path>
			</svg>
		</IconContainer>
	);
}

export function AlignLeftIcon() {
	return (
		<IconContainer>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
				className='feather feather-align-left'
			>
				<line x1='17' y1='10' x2='3' y2='10'></line>
				<line x1='21' y1='6' x2='3' y2='6'></line>
				<line x1='21' y1='14' x2='3' y2='14'></line>
				<line x1='17' y1='18' x2='3' y2='18'></line>
			</svg>
		</IconContainer>
	);
}

export function AlignRightIcon() {
	return (
		<IconContainer>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
			>
				<path
					fill='currentColor'
					fillRule='evenodd'
					d='M20.25 5.25a.75.75 0 1 1 0 1.5H3.75a.75.75 0 0 1 0-1.5h16.5zm0 4a.75.75 0 1 1 0 1.5h-8.5a.75.75 0 1 1 0-1.5h8.5zm0 4a.75.75 0 1 1 0 1.5H3.75a.75.75 0 1 1 0-1.5h16.5zm0 4a.75.75 0 1 1 0 1.5h-8.5a.75.75 0 1 1 0-1.5h8.5z'
				></path>
			</svg>
		</IconContainer>
	);
}

export function AlignJustifyIcon() {
	return (
		<IconContainer>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
				fill='none'
				stroke='currentColor'
				strokeWidth='2'
				strokeLinecap='round'
				strokeLinejoin='round'
				className='feather feather-align-justify'
			>
				<line x1='21' y1='10' x2='3' y2='10'></line>
				<line x1='21' y1='6' x2='3' y2='6'></line>
				<line x1='21' y1='14' x2='3' y2='14'></line>
				<line x1='21' y1='18' x2='3' y2='18'></line>
			</svg>
		</IconContainer>
	);
}

export function AlignCenterIcon() {
	return (
		<IconContainer>
			<svg
				xmlns='http://www.w3.org/2000/svg'
				width='24'
				height='24'
				viewBox='0 0 24 24'
			>
				<path
					fill='currentColor'
					fillRule='evenodd'
					d='M3.75 5.25h16.5a.75.75 0 1 1 0 1.5H3.75a.75.75 0 0 1 0-1.5zm4 4h8.5a.75.75 0 1 1 0 1.5h-8.5a.75.75 0 1 1 0-1.5zm-4 4h16.5a.75.75 0 1 1 0 1.5H3.75a.75.75 0 1 1 0-1.5zm4 4h8.5a.75.75 0 1 1 0 1.5h-8.5a.75.75 0 1 1 0-1.5z'
				></path>
			</svg>
		</IconContainer>
	);
}

export function SpacingIcon() {
	return (
		<IconContainer>
			<svg
				width='24'
				height='24'
				viewBox='0 0 24 24'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<path
					fillRule='evenodd'
					clipRule='evenodd'
					d='M3 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 6Zm0 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12Zm.75 5.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z'
					fill='currentColor'
				></path>
				<path
					d='M17.75 4a.75.75 0 0 0-.75.75v14.5a.75.75 0 0 0 1.5 0V4.75a.75.75 0 0 0-.75-.75Z'
					fill='currentColor'
				></path>
				<path
					fillRule='evenodd'
					clip-rule='evenodd'
					d='M14.72 16.43a.75.75 0 0 1 1.06 0l1.97 1.97 1.97-1.97a.75.75 0 1 1 1.06 1.06l-2.145 2.146a1.254 1.254 0 0 1-1.364.271 1.248 1.248 0 0 1-.406-.271L14.72 17.49a.75.75 0 0 1 0-1.06ZM20.78 7.573a.75.75 0 0 1-1.06 0l-1.97-1.97-1.97 1.97a.75.75 0 1 1-1.06-1.06l2.145-2.146a1.255 1.255 0 0 1 1.364-.272c.152.063.29.156.406.272l2.145 2.146a.75.75 0 0 1 0 1.06Z'
					fill='currentColor'
				></path>
			</svg>
		</IconContainer>
	);
}
