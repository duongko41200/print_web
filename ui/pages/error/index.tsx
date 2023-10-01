import React from 'react';
import Link from 'next/link';
import { Box, Flex } from 'theme-ui';
import { Typography } from 'antd';
import { Button } from '@mui/material';

const { Text } = Typography;

interface ErrorProps {
	message?: string;
}

const Error: React.FC<ErrorProps> = ({ message }) => {
	if (!message) {
		message = 'Something went wrong';
	}

	if (message === 'authorization') {
		message = `You don't have permission to access this page`;
	}

	return (
		<Flex
			padding='20px 0'
			sx={{
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				color: 'rgba(0, 0, 0, 0.25)',
				rowGap: 10,
			}}
		>
			<Box>
				<img src='/static/images/icons/svg/error.svg' alt='' width={80} height={80} />
			</Box>

			<Box sx={{ width: '80%', textAlign: 'center' }}>
				<Text strong style={{ fontSize: 24 }}>
					{message}
				</Text>
			</Box>

			<Box padding='15px 0 0 0'>
				<Button variant='outlined' href='/'>
					Back to home
				</Button>
			</Box>
		</Flex>
	);
};

export function getServerSideProps({ query }) {
	const { message } = query;

	return {
		props: {
			message,
		},
	};
}

export default Error;
