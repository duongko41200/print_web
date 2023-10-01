import React, { RefObject, useContext, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

import Masonry from "react-responsive-masonry";
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { Box, Flex } from 'theme-ui';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

import FabricCanvasContext from '@components/canvas/CanvasContext';

import { getPixabayImages } from 'services/external.apis';

interface PixabayPanelContentProps {
	setIsSidebarOpen: (value: boolean) => void;
}

const PixabayPanelContent: React.FC<PixabayPanelContentProps> = ({ setIsSidebarOpen }) => {
	const [images, setImages] = useState([]);
	const [page, setPage] = useState(1);
	const [query, setQuery] = useState('');

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const fetchData = async () => {
		const response = await getPixabayImages({ page, q: query });

		if (page > 1) {
			setImages((prev) => [...prev, ...response.hits]);
		} else {
			setImages([...response.hits]);
		}
	};

	useEffect(() => {
		fetchData();
	}, [page, query]);

	const addImageToCanvas = (url: string) => {
		fabric.Image.fromURL(
			url,
			function (img) {
				img.crossOrigin = 'anonymous';
				img.set({
					left: canvas.current.width / 2,
					top: canvas.current.height / 2,
					originX: 'center',
					originY: 'center',
					superType: 'image',
				});
				img.scaleToWidth(200);
				canvas.current.add(img);
			},
			{ crossOrigin: 'anonymous' }
		);
	};

	return (
		<Box
			sx={{
				padding: '0 10px',
				color: '#000',
				fontFamily: 'Arial',
			}}
		>
			<Flex
				sx={{
					fontWeight: 600,
					fontSize: '0.84rem',
					padding: '0.8rem 0',
					color: '#666',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<div>Images</div>
				<Button sx={{ color: '#666' }} onClick={() => setIsSidebarOpen(false)}>
					<KeyboardDoubleArrowLeftIcon />
				</Button>
			</Flex>

			<Box paddingBottom='10px' sx={{ width: '100%' }}>
				<Input
					size='middle'
					placeholder='Search images'
					prefix={<SearchOutlined />}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							setQuery(event.target.value);
							setPage(1);
						}
					}}
				/>
			</Box>

			<Masonry columnsCount={2}>
				{images.map((el, i) => {
					return (
						<ImageItem
							key={i}
							image={el}
							onClick={(url) => addImageToCanvas(url)}
							isLast={i === images.length - 1}
							newLimit={() => setPage(page + 1)}
						/>
					);
				})}
			</Masonry>
		</Box>
	);
};

function ImageItem({ image, isLast, onClick, newLimit, ...other }) {
	const imageRef = useRef(null);

	useEffect(() => {
		if (!imageRef?.current) {
			return;
		}

		const observer = new IntersectionObserver(([entry]) => {
			if (isLast && entry.isIntersecting) {
				newLimit();
				observer.unobserve(entry.target);
			}
		});

		observer.observe(imageRef.current);
	}, [isLast]);

	const previewURL = `${image.previewURL}`;
	const largeImageURL = `${image.largeImageURL}`;

	return (
		<Flex
			ref={imageRef}
			onClick={() => onClick(largeImageURL)}
			sx={{
				alignItems: 'center',
				position: 'relative',
				cursor: 'pointer',
				borderRadius: '10px',
				overflow: 'hidden',
				transition: 'all 0.3s ease',
				'&:hover': {
					filter: 'brightness(0.6)',
					backgroundColor: '#dddddd50',
				},
				margin: '3px'
			}}
		>
			<img
				loading='lazy'
				src={previewURL}
				alt='Preview for images'
				style={{
					width: '-webkit-fill-available',
				}}
			/>
		</Flex>
	);
}

export default PixabayPanelContent;
