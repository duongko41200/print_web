import React, { useState, useEffect, RefObject, useContext } from 'react';

import { BoldIcon, ItalicIcon, UnderscoreIcon } from './TextIcon';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import FabricCanvasContext from '../canvas/CanvasContext';
import { ActiveObjects } from '../canvas/CanvasSlice';

interface TextStyleProps {
	activeObjects: ActiveObjects;
}

const TextStyle: React.FC<TextStyleProps> = ({ activeObjects }) => {
	const [textStyles, setTextStyles] = useState([]);

	// init displaying text styles
	useEffect(() => {
		if (!activeObjects) {
			return;
		}
		const styles = getTextStyles(activeObjects.objects);
		if (compareArrays(styles, textStyles)) {
			return;
		}

		setTextStyles(styles);
	}, [activeObjects]);

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const handleTextStyle = (
		event: React.MouseEvent,
		newStyles: Array<string>
	) => {
		const originals = activeObjects.objects.map((el: fabric.Textbox) => {
			return {
				id: el.id,
				fontWeight: el.fontWeight,
				fontStyle: el.fontStyle,
				underline: el.underline,
			};
		});

		setTextStyles(newStyles);

		if (newStyles.includes('bold')) {
			activeObjects.objects.forEach((el: fabric.Textbox) => {
				el.set({
					fontWeight: 'bold',
				});
			});
		} else {
			activeObjects.objects.forEach((el: fabric.Textbox) => {
				el.set({
					fontWeight: 'normal',
				});
			});
		}

		if (newStyles.includes('italic')) {
			activeObjects.objects.forEach((el: fabric.Textbox) => {
				el.set({
					fontStyle: 'italic',
				});
			});
		} else {
			activeObjects.objects.forEach((el: fabric.Textbox) => {
				el.set({
					fontStyle: 'normal',
				});
			});
		}

		if (newStyles.includes('underline')) {
			activeObjects.objects.forEach((el: fabric.Textbox) => {
				el.set({
					underline: true,
				});
			});
		} else {
			activeObjects.objects.forEach((el: fabric.Textbox) => {
				el.set({
					underline: false,
				});
			});
		}

		canvas.current.fire('object:modified', { transform: { originals } });
		canvas.current.requestRenderAll();
	};

	return (
		<ToggleButtonGroup
			size='small'
			value={textStyles}
			onChange={handleTextStyle}
			aria-label='border type'
		>
			<ToggleButton value='bold' aria-label='bold text'>
				<BoldIcon />
			</ToggleButton>
			<ToggleButton value='italic' aria-label='italic text'>
				<ItalicIcon />
			</ToggleButton>
			<ToggleButton value='underline' aria-label='underline text'>
				<UnderscoreIcon />
			</ToggleButton>
		</ToggleButtonGroup>
	);
};

function getTextStyles(activeObjects: fabric.Textbox[]): Array<string> {
	const firstTextboxObj = activeObjects.find(el => el.superType === 'textbox');

	const styles = [];

	if (firstTextboxObj.underline) {
		styles.push('underline');
	}
	if (firstTextboxObj.fontStyle === 'italic') {
		styles.push('italic');
	}
	if (firstTextboxObj.fontWeight === 'bold') {
		styles.push('bold');
	}

	return styles;
}

// TODO: move to utils
function compareArrays(array1: string[], array2: string[]): boolean {
	// Sort the arrays
	const sortedArray1 = array1.slice().sort();
	const sortedArray2 = array2.slice().sort();

	// Compare the sorted arrays
	return JSON.stringify(sortedArray1) === JSON.stringify(sortedArray2);
}

export default TextStyle;
