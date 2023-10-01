import React, {MutableRefObject, forwardRef} from 'react';
import Link from 'next/link';

import { Flex, Box } from 'theme-ui';

import { Card, CardProps, Typography } from 'antd';
import Image from 'next/image';

const { Meta } = Card;
const { Text } = Typography;

export interface CustomCardProps extends CardProps {
	imageUrl: string;
	href?: string;
	actions?: React.ReactNode[];
	avatar?: React.ReactNode;
	title: string;
	description?: React.ReactNode;
	width?: number | string;
	height?: number | string;
}

const CustomCard: React.FC<CustomCardProps> = forwardRef<HTMLDivElement, CustomCardProps>(({
	title,
	description,
	imageUrl,
	href = '',
	actions,
	avatar,
	width = '100%',
	height = 200,
	...other
}, ref) => {
	return (
		<Card
			className='custom-card'
			ref={ref}
			style={{ width: width, overflow: 'hidden' }}
			size='small'
			cover={
				<Link href={href} target={href ? '_blank' : ''}>
					<Flex
						margin={10}
						padding={10}
						backgroundColor='#f5f5f5'
						sx={{
							alignItems: 'center',
							justifyContent: 'center',
							height: height,
						}}
					>
						<img
							style={{
								objectFit: 'contain',
								maxWidth: '100%',
								maxHeight: '100%',
							}}
							alt=''
							src={imageUrl}
							loading='lazy'
						/>
					</Flex>
				</Link>
			}
			actions={actions}
			hoverable
			{...other}
		>
			<Meta
				avatar={avatar}
				title={<Text ellipsis={{tooltip: title}}>{title}</Text>}
				description={description}
			/>
		</Card>
	);
});

export default CustomCard;
