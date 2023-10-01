import React, { useState, RefObject, useContext, useEffect } from 'react';

import {
	AlignCenterIcon,
	AlignLeftIcon,
	AlignJustifyIcon,
	AlignRightIcon,
} from './TextIcon';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import FabricCanvasContext from '../canvas/CanvasContext';
import { ActiveObjects } from '../canvas/CanvasSlice';

interface TextStyleProps {
	activeObjects: ActiveObjects;
}

const TextStyle: React.FC<TextStyleProps> = ({ activeObjects }) => {
	const [textAlign, setTextAlign] = useState(getFirstTextboxObj(activeObjects.objects).textAlign);

	// INIT DISPLAYING TEXT STYLE OPTIONS
	useEffect(() => {
		if (!activeObjects && textAlign === getFirstTextboxObj(activeObjects.objects).textAlign) {
			return;
		}

		setTextAlign(getFirstTextboxObj(activeObjects.objects).textAlign);
	}, [activeObjects]);

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const handleTextAlign = (event: React.MouseEvent, newAlign: string) => {
		if (!newAlign) {
			return;
		}

		const originals = activeObjects.objects.map((el: fabric.Textbox) => {
			return {
				id: el.id,
				textAlign: textAlign,
			};
		});

		setTextAlign(newAlign);

		activeObjects.objects.forEach((el: fabric.Textbox) => {
			el.set({
				textAlign: newAlign,
			});
		})

		canvas.current.fire('object:modified', { transform: { originals } });
		canvas.current.requestRenderAll();
	};


	return (
		<ToggleButtonGroup
			size='small'
			value={textAlign}
			onChange={handleTextAlign}
			aria-label='align text'
			exclusive
		>
			<ToggleButton value='left' aria-label='align left'>
				<AlignLeftIcon />
			</ToggleButton>
			<ToggleButton value='center' aria-label='align center'>
				<AlignCenterIcon />
			</ToggleButton>
			<ToggleButton value='right' aria-label='align right'>
				<AlignRightIcon />
			</ToggleButton>
			<ToggleButton value='justify' aria-label='align justify'>
				<AlignJustifyIcon />
			</ToggleButton>
		</ToggleButtonGroup>
	);
};

// TODO: consider moving this to utils
function getFirstTextboxObj(objects: fabric.Textbox[]): fabric.Textbox{
	return objects.find(el => el.superType === 'textbox');
}

export default TextStyle;
