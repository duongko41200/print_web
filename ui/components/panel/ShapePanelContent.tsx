import React, { RefObject, useContext } from 'react';
import { fabric } from 'fabric';

import { Button } from '@mui/material';
import { Box, Flex, Grid } from 'theme-ui';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

import FabricCanvasContext from '@components/canvas/CanvasContext';
interface ShapePanelContentProps {
	setIsSidebarOpen: (value: boolean) => void;
}

const ShapePanelContent: React.FC<ShapePanelContentProps> = ({ setIsSidebarOpen }) => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const shapes = [
		{
			type: 'rectangle',
			previewImage: '/static/images/elements/shapes/rectangle.png',
		},
		{
			type: 'circle',
			previewImage: '/static/images/elements/shapes/circle.png',
		},
		{
			type: 'line',
			previewImage: '/static/images/elements/shapes/line.svg',
		},
		{
			type: 'triangle',
			previewImage: '/static/images/elements/shapes/triangle.png',
		},
	];

	const addShapeToCanvas = (type: string) => {
		const options: fabric.Object = {
			width: 100,
			height: 100,
			fill: '#878787',
			left: canvas.current.width / 2,
			top: canvas.current.height / 2,
			originX: 'top',
			originY: 'left',
			stroke: null,
			superType: 'shape',
			strokeUniform: true,
			strokeWidth: 0,
			noScaleCache: false,
		};
		let shape: fabric.Object = null;
		switch (type) {
			case 'rectangle':
				shape = new fabric.Rect(options);
				break;
			case 'circle':
				shape = new fabric.Circle({ radius: 50, ...options });
				break;
			case 'triangle':
				shape = new fabric.Triangle(options);
				break;
			case 'line':
				const lineLength = 100;
				const lineStartX = canvas.current.width / 2 - lineLength / 2;
				const lineStartY = canvas.current.height / 2;
				const lineEndX = canvas.current.width / 2 + lineLength / 2;
				const lineEndY = canvas.current.height / 2;
				shape = new fabric.Line([lineStartX, lineStartY, lineEndX, lineEndY], {
					stroke: '#878787',
					strokeWidth: 4,
				});
				break;
			default:
				break;
		}

		if (shape) {
			canvas.current.add(shape);
		}

		canvas.current.requestRenderAll();
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
				<div>Shapes</div>
				<Button sx={{ color: '#666' }} onClick={() => setIsSidebarOpen(false)}>
					<KeyboardDoubleArrowLeftIcon />
				</Button>
			</Flex>

			<Grid gap={3} columns={[2]}>
				{shapes.map((el, i) => {
					return (
						<Flex
							key={i}
							onClick={() => addShapeToCanvas(el.type)}
							sx={{
								alignItems: 'center',
								cursor: 'pointer',
							}}
						>
							<img
							loading='lazy'
								src={el.previewImage}
								alt='Preview for shapes'
								style={{
									width: '-webkit-fill-available',
								}}
							/>
						</Flex>
					);
				})}
			</Grid>
		</Box>
	);
};

export default ShapePanelContent;
