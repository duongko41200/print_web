import React from 'react';
import styled from '@emotion/styled';

import { Flex } from 'theme-ui';
import {
	TopIcon,
	LeftIcon,
	BottomIcon,
	RightIcon,
	MiddleIcon,
	CenterIcon,
	ForwardIcon,
	BackwardIcon,
	ToFrontIcon,
	ToBackIcon,
	MoreIcon,
} from './GeneralIcon';

const ButtonContainer = styled.button({
	color: '#000',
	background: '#fff',
	': hover': {
		background: '#f5f5f5',
	},
	borderRadius: '6px',
	padding: '6px',
	minWidth: '120px',
	maxWidth: '100%',
	height: 'auto',
	minHeight: '40px',
	border: 'none',
	transition: 'all 0.3s ease',
	'&.disabled': {
		color: '#666',
		cursor: 'default'
	}
});

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
	disabled?: boolean
}

export const TopButton: React.FC<ButtonProps> = ({ ...props }) => {
	return (
		<ButtonContainer {...props}>
			<Flex sx={{columnGap: '10px', alignItems: 'center', justifyContent: 'flex-start'}}>
				<TopIcon />

				<div>Top</div>
			</Flex>
		</ButtonContainer>
	);
};
export const LeftButton: React.FC<ButtonProps> = ({ ...props }) => {
	return (
		<ButtonContainer {...props}>
			<Flex sx={{columnGap: '10px', alignItems: 'center', justifyContent: 'flex-start'}}>
				<LeftIcon />

				<div>Left</div>
			</Flex>
		</ButtonContainer>
	);
};
export const MiddleButton: React.FC<ButtonProps> = ({ ...props }) => {
	return (
		<ButtonContainer {...props}>
			<Flex sx={{columnGap: '10px', alignItems: 'center', justifyContent: 'flex-start'}}>
				<MiddleIcon />

				<div>Middle</div>
			</Flex>
		</ButtonContainer>
	);
};
export const CenterButton: React.FC<ButtonProps> = ({ ...props }) => {
	return (
		<ButtonContainer {...props}>
			<Flex sx={{columnGap: '10px', alignItems: 'center', justifyContent: 'flex-start'}}>
				<CenterIcon />

				<div>Center</div>
			</Flex>
		</ButtonContainer>
	);
};
export const BottomButton: React.FC<ButtonProps> = ({ ...props }) => {
	return (
		<ButtonContainer {...props}>
			<Flex sx={{columnGap: '10px', alignItems: 'center', justifyContent: 'flex-start'}}>
				<BottomIcon />

				<div>Bottom</div>
			</Flex>
		</ButtonContainer>
	);
};
export const RightButton: React.FC<ButtonProps> = ({ ...props }) => {
	return (
		<ButtonContainer {...props}>
			<Flex sx={{columnGap: '10px', alignItems: 'center', justifyContent: 'flex-start'}}>
				<RightIcon />

				<div>Right</div>
			</Flex>
		</ButtonContainer>
	);
};
export const ForwardButton: React.FC<ButtonProps> = ({ disabled,...props }) => {
	return (
		<ButtonContainer className={disabled ? 'disabled' : ''} {...props}>
			<Flex sx={{columnGap: '10px', alignItems: 'center', justifyContent: 'flex-start'}}>
				<ForwardIcon />

				<div>Forward</div>
			</Flex>
		</ButtonContainer>
	);
};
export const BackwardButton: React.FC<ButtonProps> = ({ disabled, ...props }) => {
	return (
		<ButtonContainer  className={disabled ? 'disabled' : ''} {...props}>
			<Flex sx={{columnGap: '10px', alignItems: 'center', justifyContent: 'flex-start'}}>
				<BackwardIcon />

				<div>Backward</div>
			</Flex>
		</ButtonContainer>
	);
};
export const ToFrontButton: React.FC<ButtonProps> = ({ disabled,...props }) => {
	return (
		<ButtonContainer  className={disabled ? 'disabled' : ''} {...props}>
			<Flex sx={{columnGap: '10px', alignItems: 'center', justifyContent: 'flex-start'}}>
				<ToFrontIcon />

				<div>To Front</div>
			</Flex>
		</ButtonContainer>
	);
};
export const ToBackButton: React.FC<ButtonProps> = ({ disabled,...props }) => {
	return (
		<ButtonContainer  className={disabled ? 'disabled' : ''} {...props}>
			<Flex sx={{columnGap: '10px', alignItems: 'center', justifyContent: 'flex-start'}}>
				<ToBackIcon />

				<div>To Back</div>
			</Flex>
		</ButtonContainer>
	);
};

export const MoreButton: React.FC<ButtonProps> = ({...props}) => {
	return (
		<ButtonContainer {...props}>
			<Flex sx={{alignItems:'center', justifyContent: 'center'}}>
				<MoreIcon />
			</Flex>
		</ButtonContainer>
	)
}