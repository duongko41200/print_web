import React, { useEffect, useState } from 'react';

import { Input, Typography } from 'antd';
import { Box, Flex } from 'theme-ui';
import { getAllProducts } from 'services/dbhandler/product';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

const { Text } = Typography;

interface ProductMenuProps {
	onSelect?: (product: any) => void;
}

let allProducts = [];
const ProductMenu: React.FC<ProductMenuProps> = ({ onSelect }) => {
	const [products, setProducts] = useState([]);
	const [query, setQuery] = useState('');

	useEffect(() => {
		const filteredProducts = allProducts.filter((el) => removeAccents(el.name).includes(removeAccents(query)));
		setProducts(filteredProducts);
	}, [query]);

	function removeAccents(str: string) {
		return str
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/đ/g, 'd')
			.replace(/Đ/g, 'D')
			.toLowerCase();
	}

	useEffect(() => {
		const fetchData = async () => {
			const data = await getAllProducts();
			setProducts(data);
			allProducts = [...data];
		};

		fetchData();
	}, []);

	return (
		<Flex sx={{ flexDirection: 'column', rowGap: 15, width: 350 }}>
			<Box padding='0 15px'>
				<Input placeholder='Search product' onChange={(e) => setQuery(e.target.value)} />
			</Box>

			<Box padding='0 15px'>
				{products.map((el, index) => (
					<ProductItem onClick={() => onSelect(el)} key={index} product={el} />
				))}
			</Box>
		</Flex>
	);
};

function ProductItem({ product, onClick }) {
	return (
		<Flex
			onClick={onClick}
			padding='5px 0'
			className='product-menu-item'
			sx={{
				alignItem: 'center',
				height: '50px',
				columnGap: 12,
				cursor: 'pointer',
				':hover': {
					background: '#f5f5f5',
				},
				borderRadius: 8,
			}}
		>
			<Box className='image' sx={{ width: '50px' }}>
				<img
					loading='lazy'
					style={{ width: '100%', height: '100%', objectFit: 'contain' }}
					src={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${product.thumbnail || product.image}`}
					alt={product.name}
				/>
			</Box>

			<Box className='name'>
				<Text ellipsis={{ tooltip: product.name }}>{product.name}</Text>
			</Box>
		</Flex>
	);
}

export default ProductMenu;
