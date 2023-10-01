import React, { RefObject, useContext, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { toast } from 'react-toastify';

import Masonry from "react-responsive-masonry";
import { Button, IconButton } from '@mui/material';
import { Box, Flex, Grid } from 'theme-ui';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

import FabricCanvasContext from '@components/canvas/CanvasContext';
import Upload from '@components/Upload/Upload';
import { deleteImageAsset, getMyImageAssets } from 'services/dbhandler';

import getConfig from 'next/config';
import { confirmAlert } from 'react-confirm-alert';
const { publicRuntimeConfig } = getConfig();

interface ImagePanelContentProps {
	setIsSidebarOpen: (value: boolean) => void;
}

const ImagePanelContent: React.FC<ImagePanelContentProps> = ({ setIsSidebarOpen }) => {
	const [imageAssets, setImageAssets] = useState([]);
	const [page, setPage] = useState(1);

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const fetchData = async () => {
		const newImageAssets = await getMyImageAssets({ limit: 20, page, sort: '-createdAt' });

		if (page > 1) {
			setImageAssets((prev) => [...prev, ...newImageAssets]);
		} else {
			setImageAssets([...newImageAssets]);
		}
	};

	useEffect(() => {
		fetchData();
	}, [page]);

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

	const removeImage = (image: any) => {
		confirmAlert({
			title: 'Delete image asset',
			message: 'Do you want to delete this image asset? This can not be undone!',
			buttons: [
				{
					label: 'Cancel',
					onClick: () => {},
				},
				{
					label: 'Confirm',
					onClick: async () => {
						await deleteImageAsset(
							image.id,
							() => {
								setImageAssets((pre) => pre.filter((el) => el.id != image.id));
							},
							(err) => toast.error(err.response.data.message)
						);
					},
				},
			],
		});
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

			<Masonry columnsCount={2}>
				{imageAssets.map((el, i) => {
					return (
						<ImageItem
							key={i}
							image={el}
							onClick={(url) => addImageToCanvas(url)}
							onRemove={(image) => removeImage(image)}
							isLast={i === imageAssets.length - 1}
							newLimit={() => setPage(page + 1)}
						/>
					);
				})}
				<Flex sx={{ alignItems: 'center', cursor: 'pointer' }}>
					<Upload images={imageAssets} setImages={setImageAssets} />
				</Flex>
			</Masonry>
		</Box>
	);
};

function ImageItem({ image, isLast, onClick, onRemove, newLimit, ...other }) {
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

	const imageUrl = `${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${image.image}`;
	return (
		<Flex
			ref={imageRef}
			onClick={() => onClick(imageUrl)}
			sx={{
				alignItems: 'center',
				position: 'relative',
				cursor: 'pointer',
				borderRadius: '10px',
				overflow: 'hidden',
				transition: 'all 0.3s ease',
				':hover': {
					backgroundColor: '#dddddd50',
					'& .delete-button': {
						color: 'green',
						display: 'block',
					},
				},
				margin: '3px'
			}}
		>
			<img
				loading='lazy'
				src={imageUrl}
				alt='Preview for images'
				style={{
					width: '-webkit-fill-available',
				}}
			/>

			<Box
				className='delete-button'
				sx={{ position: 'absolute', right: -1, top: -1, display: 'none', zIndex: 9999 }}
			>
				<IconButton
					onClick={(e) => {
						e.stopPropagation();
						onRemove(image);
					}}
					style={{ color: '#B70404' }}
				>
					<HighlightOffIcon />
				</IconButton>
			</Box>
		</Flex>
	);
}

export default ImagePanelContent;
