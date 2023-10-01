import React, { useEffect, useState } from 'react';

import { Typography } from 'antd';
import { Flex } from 'theme-ui';
import { searchMyDesigns } from 'services/dbhandler';
import Link from 'next/link';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

const { Text } = Typography;

interface DesignMenuProps {
	query: string;
}

const DesignMenu: React.FC<DesignMenuProps> = ({ query }) => {
	const [designs, setDesigns] = useState([]);

	const fetchData = async () => {
		const data = await searchMyDesigns(query);
		setDesigns(data);
	};

	useEffect(() => {
		fetchData();
	}, [query]);

	return (
		<Flex sx={{ flexDirection: 'column', rowGap: 9, width: 350 }}>
			{designs.map((el, index) => (
				<Link style={{ textDecoration: 'none', color: '#000' }} href={`/designs/${el.id}`} target='_blank'>
					<DesignItem key={index} design={el} />
				</Link>
			))}
		</Flex>
	);
};

function DesignItem({ design }) {
	return (
		<Flex
			padding='5px 10px'
			className='design-menu-item'
			sx={{
				alignItem: 'center',
				height: '50px',
				columnGap: 12,
				cursor: 'pointer',
				':hover': {
					background: '#f5f5f5',
				},
			}}
		>
			<Flex className='image' sx={{ width: '50px', alignItems: 'center', justifyContent: 'center' }}>
				<img
					loading='lazy'
					style={{ width: '100%', height: '100%', objectFit: 'contain' }}
					src={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${design.thumbnail}?origin=${Date.now()}`}
					alt={design.name}
				/>
			</Flex>

			<Flex className='name' sx={{ alignItems: 'center' }}>
				<Text ellipsis={{ tooltip: design.name }}>{design.name}</Text>
			</Flex>
		</Flex>
	);
}

export default DesignMenu;
