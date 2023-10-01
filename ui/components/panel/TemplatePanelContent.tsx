import React, { RefObject, useContext, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

import Masonry from "react-responsive-masonry";
import { SearchOutlined } from '@ant-design/icons';
import { Button } from '@mui/material';
import { Box, Flex, Grid } from 'theme-ui';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { getTemplates, updateTemplateNumUsed } from 'services/dbhandler';
import FabricCanvasContext from '@components/canvas/CanvasContext';

import getConfig from 'next/config';
import { loadAndUseFont } from '@utils/canvas/handler';
import { confirmAlert } from 'react-confirm-alert';
import { Input } from 'antd';
const { publicRuntimeConfig } = getConfig();

interface TemplatePanelContentProps {
	setIsSidebarOpen: (value: boolean) => void;
}

const TemplatePanelContent: React.FC<TemplatePanelContentProps> = ({ setIsSidebarOpen }) => {
	const [templates, setTemplates] = useState([]);
	const [page, setPage] = useState(1);
	const [query, setQuery] = useState('');

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const fetchData = async () => {
		const newTemplates = await getTemplates({ q: query, page, limit: 20, sort: '-numUsed,-updatedAt,-createdAt' });
		if (page > 1) {
			setTemplates((prev) => [...prev, ...newTemplates]);
		} else {
			setTemplates([...newTemplates]);
		}
	};

	useEffect(() => {
		fetchData();
	}, [page, query]);

	const addTemplateToCanvas = (template: any) => {
		if (!canvas.current) {
			return;
		}

		confirmAlert({
			title: 'Use template',
			message: 'Do you want to use this template? This will remove current design!',
			buttons: [
				{
					label: 'Confirm',
					onClick: async () => {
						canvas.current.remove(...canvas.current.getObjects());

						fabric.util.enlivenObjects(
							template.objects,
							(enlivenedObjects: fabric.Object[]) => {
								enlivenedObjects.forEach((object) => {
									object.id = null;
									if (object.superType === 'textbox') {
										loadAndUseFont(object.fontFamily, () => canvas.current.add(object));
									} else {
										canvas.current.add(object);
									}
								});
							},
							'fabric'
						);

						await updateTemplateNumUsed(template.id);
					},
				},
				{
					label: 'Cancel',
					onClick: () => {},
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
				<div>Templates</div>
				<Button sx={{ color: '#666' }} onClick={() => setIsSidebarOpen(false)}>
					<KeyboardDoubleArrowLeftIcon />
				</Button>
			</Flex>

			<Box paddingBottom='10px' sx={{ width: '100%' }}>
				<Input
					size='middle'
					placeholder='Search template'
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
				{templates ? (
					templates.map((el, i) => {
						return (
							<TemplateItem
								key={i}
								template={el}
								onClick={(template) => addTemplateToCanvas(template)}
								isLast={i === templates.length - 1}
								newLimit={() => setPage(page + 1)}
							/>
						);
					})
				) : (
					<></>
				)}
			</Masonry>
		</Box>
	);
};

function TemplateItem({ template, onClick, isLast, newLimit, ...other }) {
	const templateRef = useRef(null);

	useEffect(() => {
		if (!templateRef?.current) {
			return;
		}

		const observer = new IntersectionObserver(([entry]) => {
			if (isLast && entry.isIntersecting) {
				newLimit();
				observer.unobserve(entry.target);
			}
		});

		observer.observe(templateRef.current);
	}, [isLast]);

	const thumbnailUrl = `${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${template.thumbnail}?origin=${Date.now()}`;
	return (
		<Flex
			ref={templateRef}
			onClick={() => onClick(template)}
			sx={{
				alignItems: 'center',
				cursor: 'pointer',
				borderRadius: '10px',
				border: '1px solid #ddd',
				overflow: 'hidden',
				transition: 'all 0.3s ease',
				'&:hover': {
					filter: 'brightness(0.6)',
					backgroundColor: '#dddddd50',
				},
				height: 'fit-content',
				margin: '3px'
			}}
		>
			<img
				loading='lazy'
				src={thumbnailUrl}
				alt='Preview for template'
				style={{
					width: '-webkit-fill-available',
				}}
			/>
		</Flex>
	);
}

export default TemplatePanelContent;
