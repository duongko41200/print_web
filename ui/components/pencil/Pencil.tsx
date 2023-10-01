import React, { useEffect, useState, useContext, RefObject } from 'react';

import { Flex, Grid, Box } from 'theme-ui';
import { PencilIcon, MarkerIcon, PointerIcon } from './PencilIcon';
import PencilColor from './PencilColor';

import FabricCanvasContext from '../canvas/CanvasContext';

interface PencilsProps {}

const pencilConfig = {
	width: 2,
	color: 'rgb(45, 144, 235)',
};

const markerConfig = {
	width: 5,
	color: 'red',
};

const highlightPencilConfig = {
	width: 10,
	color: 'yellow',
};

const Pencils: React.FC<PencilsProps> = ({}) => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const [mode, setMode] = useState<string>(null);
	const [color, setColor] = useState<string>(null);

	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		const canvasObj = canvas.current;

		// turn off drawing mode when leave this tab
		return () => {
			canvasObj.isDrawingMode = false;
		};
	}, []);
	
	// toggle drawing mode
	useEffect(() => {
		if (!canvas.current) {
			return;
		}

		if (!mode) {
			canvas.current.isDrawingMode = false;
			return;
		}


		canvas.current.isDrawingMode = true;

		switch (mode) {
			case 'pencil':
				Object.assign(canvas.current.freeDrawingBrush, pencilConfig);
				break;
			case 'marker':
				Object.assign(canvas.current.freeDrawingBrush, markerConfig);
				break;

			default:
				break;
		}

		if (color) {
			canvas.current.freeDrawingBrush.color = color;
		} else {
			setColor(canvas.current.freeDrawingBrush.color);
		}
	}, [canvas.current, mode]);

	// change color
	useEffect(() => {
		if (!color) {
			return;
		}

		canvas.current.freeDrawingBrush.color = color;
	}, [color]);

	const onClickPencil = () => {
		if (mode === 'pencil') {
			setMode(null);
			return;
		}
		setMode('pencil');
	};

	const onClickMarker = () => {
		if (mode === 'marker') {
			return setMode(null);
		}

		setMode('marker');
	};

	const onClickPointer = () => {
		setMode(null);
	};

	return (
		<Flex sx={{ flexDirection: 'column', rowGap: '10px' }}>
			<PencilIcon selected={mode === 'pencil'} onClick={onClickPencil} style={{ color: 'rgb(45, 144, 235)' }} />
			<MarkerIcon selected={mode === 'marker'} onClick={onClickMarker} style={{ color: 'red' }} />

			<Flex sx={{ alignItems: 'center', justifyContent: 'flex-start', columnGap: '20px' }}>
				<Box>
					<PointerIcon onClick={onClickPointer} selected={!mode} />
				</Box>

				<Box>
					<PencilColor color={color} setColor={setColor} />
				</Box>
			</Flex>
		</Flex>
	);
};

export default Pencils;
