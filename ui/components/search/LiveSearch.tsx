import React, { useRef, useState, useEffect } from 'react';

import { Input, Tabs, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Flex, Box } from 'theme-ui';
import { searchMyDesigns, searchMyTemplates } from 'services/dbhandler';
import Link from 'next/link';

import getConfig from 'next/config';
import AppEmpty from '@components/empty/AppEmpty';
const { publicRuntimeConfig } = getConfig();

const { Text } = Typography;

interface LiveSearchProps {}

export function TemplatesTab({ query }) {
	const [templates, setTemplates] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			const data = await searchMyTemplates(query);
			setTemplates(data);
		};

		fetchData();
	}, [query]);

	return (
		<Flex sx={{ flexDirection: 'column', rowGap: 9 }}>
			{!templates || templates.length === 0 ? (
				<AppEmpty title='No template' />
			) : (
				templates.map((el, index) => (
					<Link
						key={index}
						style={{ textDecoration: 'none', color: '#000' }}
						href={`/templates/${el.id}`}
						target='_blank'
					>
						<TabItem name={el.name} image={el.thumbnail} />
					</Link>
				))
			)}
		</Flex>
	);
}

export function DesignsTab({ query }) {
	const [designs, setDesigns] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			const data = await searchMyDesigns(query);
			setDesigns(data);
		};

		fetchData();
	}, [query]);

	return (
		<Flex sx={{ flexDirection: 'column', rowGap: 9 }}>
			{!designs || designs.length === 0 ? (
				<AppEmpty title='No design' />
			) : (
				designs.map((el, index) => (
					<Link
						key={index}
						style={{ textDecoration: 'none', color: '#000' }}
						href={`/designs/${el.id}`}
						target='_blank'
					>
						<TabItem name={el.name} image={el.thumbnail} />
					</Link>
				))
			)}
		</Flex>
	);
}

function TabItem({ image, name }) {
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
					src={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${image}?origin=${Date.now()}`}
					alt={name}
				/>
			</Flex>

			<Flex className='name' sx={{ alignItems: 'center' }}>
				<Text ellipsis={{ tooltip: name }}>{name}</Text>
			</Flex>
		</Flex>
	);
}

const LiveSearch: React.FC<LiveSearchProps> = ({}) => {
	const [showDropdown, setShowDropdown] = useState<boolean>(false);
	const [query, setQuery] = useState<string>('');
	const dropdownRef = useRef<HTMLElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const tabItems = [
		{ label: 'Templates', key: '1', children: <TemplatesTab query={query} /> },
		{ label: 'Designs', key: '2', children: <DesignsTab query={query} /> },
	];

	useEffect(() => {
		document.addEventListener('click', handleClick);

		return () => {
			// Remove the click event listener when the component is unmounted
			document.removeEventListener('click', handleClick);
		};
	}, []);

	const handleClick = (event: MouseEvent) => {
		// Check if the clicked element is within the component (input or dropdown)
		if (!inputRef.current.contains(event.target as Node) && !dropdownRef.current?.contains(event.target as Node)) {
			setShowDropdown(false);
		}
	};

	return (
		<div style={{ position: 'relative', width: '400px' }} ref={inputRef}>
			<Input
				size='large'
				value={query}
				placeholder='Search your templates or designs'
				prefix={<SearchOutlined />}
				onFocus={() => setShowDropdown(true)}
				onBlur={(e) => {
					if (!dropdownRef.current.contains(e.relatedTarget)) {
						setShowDropdown(false);
					}
				}}
				onChange={(e) => setQuery(e.target.value)}
			/>

			{showDropdown && (
				<Flex
					ref={dropdownRef}
					sx={{
						boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px',
						position: 'absolute',
						left: 0,
						background: '#fff',
						width: '100%',
						flexDirection: 'column',
						maxHeight: '500px',
						overflowY: 'auto',
						scrollbarGutter: 'stable',
						zIndex: 9999,
					}}
				>
					<Box>
						<Tabs
							onChange={() => setQuery('')}
							defaultActiveKey='1'
							type='card'
							size='small'
							items={tabItems}
							centered
						/>
					</Box>
				</Flex>
			)}
		</div>
	);
};

export default LiveSearch;
