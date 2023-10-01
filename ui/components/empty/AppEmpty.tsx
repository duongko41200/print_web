import React from 'react';
import { Box, Flex } from 'theme-ui';
import { Typography } from 'antd';

import EmptyIcon from './EmptyIcon';

const { Paragraph } = Typography;

interface AppEmptyProps {
	title: string;
	icon?: React.ReactNode;
}

const AppEmpty: React.FC<AppEmptyProps> = ({ title, icon = <EmptyIcon /> }) => {
	return (
		<Flex
			padding='20px 0'
			sx={{
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
				color: 'rgba(0, 0, 0, 0.25)',
			}}
		>
			<Box>{icon}</Box>

			<Box>
				<Paragraph style={{ color: 'rgba(0, 0, 0, 0.25)' }}>{title}</Paragraph>
			</Box>
		</Flex>
	);
};

export default AppEmpty;
