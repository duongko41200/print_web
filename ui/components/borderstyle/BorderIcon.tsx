import { CSSProperties } from 'react';
import styled from '@emotion/styled';

const IconContainer = styled.div<CSSProperties>({
	borderRadius: '4px',
	padding: '10px',
	background: 'rgba(255, 255, 255, 0.15)',
	cursor: 'pointer',
});

export function SolidIcon() {
	return (
		<IconContainer>
			<svg
				width='24'
				height='24'
				viewBox='0 0 24 24'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<line
					x2='24'
					y1='50%'
					y2='50%'
					stroke='currentColor'
					strokeWidth='2'
					shapeRendering='crispEdges'
				></line>
			</svg>
		</IconContainer>
	);
}

export function LargeDashIcon(props) {
	return (
		<IconContainer {...props} className='navbar-icon'>
			<svg
				width='24'
				height='24'
				viewBox='0 0 24 24'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<line
					x1='-1'
					x2='25'
					y1='50%'
					y2='50%'
					stroke='currentColor'
					strokeDasharray='12 2'
					strokeWidth='2'
					shapeRendering='crispEdges'
				></line>
			</svg>
		</IconContainer>
	);
}

export function NormalDashIcon(props) {
	return (
		<IconContainer {...props} className='navbar-icon'>
			<svg
				width='24'
				height='24'
				viewBox='0 0 24 24'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<line
					x1='1'
					x2='23'
					y1='50%'
					y2='50%'
					stroke='currentColor'
					strokeDasharray='6 2'
					strokeWidth='2'
					shapeRendering='crispEdges'
				></line>
			</svg>
		</IconContainer>
	);
}

export function SmallDashIcon(props) {
	return (
		<IconContainer {...props} className='navbar-icon'>
			<svg
				width='24'
				height='24'
				viewBox='0 0 24 24'
				fill='none'
				xmlns='http://www.w3.org/2000/svg'
			>
				<line
					x1='1'
					x2='23'
					y1='50%'
					y2='50%'
					stroke='currentColor'
					strokeDasharray='2 2'
					strokeWidth='2'
					shapeRendering='crispEdges'
				></line>
			</svg>
		</IconContainer>
	);
}

export function NoneLineIcon(props) {
	return (
		<IconContainer {...props} className='navbar-icon'>
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
					d='M19.071 19.071c-3.905 3.905-10.237 3.905-14.142 0-3.905-3.905-3.905-10.237 0-14.142 3.905-3.905 10.237-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142ZM5.482 17.457 17.457 5.482A8.5 8.5 0 0 0 5.482 17.457Zm1.06 1.06A8.501 8.501 0 0 0 18.519 6.544L6.543 18.518Z'
					fill='currentColor'
				></path>
			</svg>
		</IconContainer>
	);
}
