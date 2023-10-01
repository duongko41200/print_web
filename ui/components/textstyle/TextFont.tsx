import React, { useState, useEffect, useContext, RefObject } from 'react';
import FontFaceObserver from 'fontfaceobserver';

import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import FabricCanvasContext from '../canvas/CanvasContext';
import { toast } from 'react-toastify';
import { ActiveObjects } from '../canvas/CanvasSlice';

interface TextFontProps {
	activeObjects: ActiveObjects;
}

const fonts = [
	'Arial',
	'Dancing Script',
	'Inter',
	'Merriweather',
	'Montserrat',
	'Open Sans',
	'Oswald',
	'Pacifico',
	'Pinyon Script',
	'Roboto',
	'Roboto Condensed',
	'Roboto Mono',
	'Sedgwick Ave',
	'Ysabeau Infant',
];

const TextFont: React.FC<TextFontProps> = ({ activeObjects }) => {
	const [font, setFont] = useState(
		getFirstTextboxObject(activeObjects.objects).fontFamily
	);

	useEffect(() => {
		if (!activeObjects && font === getFirstTextboxObject(activeObjects.objects).fontFamily) {
			return;
		}

		setFont(getFirstTextboxObject(activeObjects.objects).fontFamily);
	}, [activeObjects]);

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const handleChange = (event: SelectChangeEvent) => {
		const newFont = event.target.value;
		if (newFont === font) {
			return;
		}

		setFont(newFont);

		loadAndUse(newFont, () => {
			const originals = activeObjects.objects.map((el: fabric.Textbox) => {
				return {
					id: el.id,
					fontFamily: el.fontFamily,
				};
			});

			activeObjects.objects.forEach((el: fabric.Textbox) => {
				el.set({
					fontFamily: newFont,
				});
			})

			canvas.current.fire('object:modified', {
				transform: { originals },
			});
			canvas.current.renderAll();
		});
	};

	return (
		<FormControl sx={{ m: 1, minWidth: 120, maxWidth: 120 }} size='small'>
			<Select
				labelId='select-text-font'
				id='demo-select-small'
				value={font}
				onChange={handleChange}
				sx={{ fontFamily: font }}
			>
				{fonts.map((el, index) => (
					<MenuItem sx={{ fontFamily: el }} key={index} value={el}>
						{el}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

function loadAndUse(font: string, callback: () => void) {
	const myFont = new FontFaceObserver(font);
	myFont
		.load()
		.then(function () {
			// when font is loaded, use it
			callback();
		})
		.catch(function (e) {
			console.log(e);
			toast.error('Error loading font: ' + font);
		});
}


function getFirstTextboxObject(objects: fabric.Textbox[]): fabric.Textbox {
	return objects.find(({superType}) => superType === 'textbox');
}

export default TextFont;
