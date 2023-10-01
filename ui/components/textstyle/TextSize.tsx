import React, { useState, useEffect, RefObject, useContext } from 'react';

import { TextField, Button, ButtonGroup } from '@mui/material';

import FabricCanvasContext from '../canvas/CanvasContext';
import { ActiveObjects } from '../canvas/CanvasSlice';

interface TextSizeProps {
	activeObjects: ActiveObjects;
}

const TextSize: React.FC<TextSizeProps> = ({ activeObjects }) => {
	const [fontSize, setFontSize] = useState<number>(getFirstTextboxObj(activeObjects.objects).fontSize);

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	// handler function for FONT SIZE
	const handleDecrement = () => {
		if (fontSize === 1) {
			return;
		}

		const originals = activeObjects.objects.map((el: fabric.Textbox) => {
			return {
				id: el.id,
				fontSize: el.fontSize,
			};
		});

		setFontSize((fontSize) => fontSize - 1);

		activeObjects.objects.forEach((el: fabric.Textbox) => {
			el.set({
				fontSize: fontSize - 1,
			});
		});

		canvas.current.fire('object:modified', { transform: { originals } });
		canvas.current.requestRenderAll();
	};

	const handleIncrement = () => {
		if (fontSize >= 80) {
			return;
		}

		const originals = activeObjects.objects.map((el: fabric.Textbox) => {
			return {
				id: el.id,
				fontSize: el.fontSize,
			};
		});

		setFontSize((fontSize) => fontSize + 1);

		activeObjects.objects.forEach((el: fabric.Textbox) => {
			el.set({
				fontSize: fontSize + 1,
			});
		});

		canvas.current.fire('object:modified', { transform: { originals } });
		canvas.current.requestRenderAll();
	};

	const handleEditFontSize = (
		event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
	) => {
		let newFontSize = parseInt(event.target.value) as number;

		if (newFontSize <= 1) {
			newFontSize = 1;
		}
		if (newFontSize >= 80) {
			newFontSize = 80;
		}

		const originals = activeObjects.objects.map((el: fabric.Textbox) => {
			return {
				id: el.id,
				fontSize: el.fontSize,
			};
		});

		activeObjects.objects.forEach((el: fabric.Textbox) => {
			el.set({
				fontSize: newFontSize,
			});
		});

		setFontSize(newFontSize);
		canvas.current.fire('object:modified', { transform: { originals } });
		canvas.current.requestRenderAll();
	};

	// init displaying font size
	useEffect(() => {
		if (!activeObjects || fontSize === getFirstTextboxObj(activeObjects.objects).fontSize) {
			return;
		}

		setFontSize(getFirstTextboxObj(activeObjects.objects).fontSize);
	}, [activeObjects]);

	return (
		<ButtonGroup size='small'>
			<Button disabled={fontSize === 1} onClick={handleDecrement}>
				-
			</Button>
			<TextField
				type='tel'
				size='small'
				sx={{
					width: '60px',
					fontSize: '10px',
					textAlign: 'center',
					'& input': {
						textAlign: 'center',
					},
				}}
				value={fontSize}
				onBlur={handleEditFontSize}
				onChange={(event) => {
					if (!event.target.value) {
						event.target.value = '0';
					}
					let newFontSize = parseInt(event.target.value);
					if (newFontSize <= 0) {
						newFontSize = 0;
					}
					if (newFontSize >= 80) {
						newFontSize = 80;
					}
					setFontSize(newFontSize);
				}}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						event.target.blur();
					}
				}}
			/>
			<Button disabled={fontSize >= 80} onClick={handleIncrement}>
				+
			</Button>
		</ButtonGroup>
	);
};

function getFirstTextboxObj(objects: fabric.Textbox[]): fabric.Textbox{
	return objects.find(el => el.superType === 'textbox');
}

export default TextSize;
