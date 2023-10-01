import React, { useState, useEffect, useContext, RefObject } from 'react';

import {
	CDropdown,
	CDropdownToggle,
	CDropdownMenu,
	CDropdownItem,
} from '@coreui/react';
import { Box, Flex } from 'theme-ui';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import { TextField, Slider } from '@mui/material';
import CustomSlider from '../slider/CustomSlider';

import FabricCanvasContext from '../canvas/CanvasContext';
import { ActiveObjects } from '../canvas/CanvasSlice';

interface TextSpacingProps {
	activeObjects: ActiveObjects;
}

let originalStates = [];
function setOriginalStates(newStates: Array<any>) {
	originalStates = newStates.map((el) => {
		return {
			id: el.id,
			charSpacing: el.charSpacing,
			lineHeight: el.lineHeight,
		};
	});
}

const TextSpacing: React.FC<TextSpacingProps> = ({ activeObjects }) => {
	const [letterSpacing, setLetterSpacing] = useState(
		getFirstTextboxObj(activeObjects.objects).charSpacing
	);
	const [lineSpacing, setLineSpacing] = useState(
		getFirstTextboxObj(activeObjects.objects).lineHeight
	);

	// INIT DISPLAYING OPTION
	useEffect(() => {
		if (!activeObjects) {
			return;
		}

		const firstTextboxObj = getFirstTextboxObj(activeObjects.objects);

		if (letterSpacing !== firstTextboxObj.charSpacing) {
			setLetterSpacing(firstTextboxObj.charSpacing);
		}

		if (lineSpacing !== firstTextboxObj.lineHeight) {
			setLineSpacing(firstTextboxObj.lineHeight);
		}
	}, [activeObjects]);

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	// handler functions
	const handleLetterSpacing = (newValue: number) => {
		if (!activeObjects || !canvas.current) {
			return;
		}

		if (
			newValue === getFirstTextboxObj(activeObjects.objects).charSpacing
		) {
			return;
		}

		setOriginalStates(activeObjects.objects);

		activeObjects.objects.forEach((el: fabric.Textbox) => {
			el.set({ charSpacing: newValue });
		});

		canvas.current.fire('object:modified');
		canvas.current.requestRenderAll();
	};

	const handleLineSpacing = (newValue: number) => {
		if (!activeObjects || !canvas.current) {
			return;
		}

		if (newValue === getFirstTextboxObj(activeObjects.objects).lineHeight) {
			return;
		}

		setOriginalStates(activeObjects.objects);

		activeObjects.objects.forEach((el: fabric.Textbox) => {
			el.set({ lineHeight: newValue });
		});

		canvas.current.fire('object:modified');
		canvas.current.requestRenderAll();
	};

	const handleLetterSpacingCommitted = (
		originalValue: number,
		newValue: number
	) => {
		const originals = originalStates.map((el) => {
			el.charSpacing = originalValue;

			return el;
		});

		const target = activeObjects.objects.map((el: fabric.Textbox) => {
			return {
				id: el.id,
				charSpacing: newValue,
			};
		});

		canvas.current.fire('history:updated', {
			originals,
			target,
		});
	};

	const handleLineSpacingCommitted = (
		originalValue: number,
		newValue: number
	) => {
		const originals = originalStates.map((el) => {
			el.lineHeight = originalValue;

			return el;
		});

		const target = activeObjects.objects.map((el: fabric.Textbox) => {
			return {
				id: el.id,
				lineHeight: newValue,
			};
		});

		canvas.current.fire('history:updated', {
			originals,
			target,
		});
	};

	return (
		<CDropdown autoClose='outside'>
			<CDropdownToggle color='light'>
				<FormatLineSpacingIcon />
			</CDropdownToggle>

			<CDropdownMenu style={{ width: '300px' }}>
				<CDropdownItem
					style={{
						backgroundColor: 'transparent',
						color: '#000',
						cursor: 'unset',
					}}
				>
					<CustomSlider
						title='Letter spacing'
						inputField
						value={letterSpacing}
						setValue={setLetterSpacing}
						handleOnChange={handleLetterSpacing}
						handleOnChangeCommitted={handleLetterSpacingCommitted}
						step={1}
						min={-200}
						max={800}
					/>
				</CDropdownItem>

				<CDropdownItem
					style={{
						backgroundColor: 'transparent',
						color: '#000',
						cursor: 'unset',
					}}
				>
					<CustomSlider
						title='Line spacing'
						inputField
						value={lineSpacing}
						setValue={setLineSpacing}
						handleOnChange={handleLineSpacing}
						handleOnChangeCommitted={handleLineSpacingCommitted}
						step={0.1}
						min={0.5}
						max={2.5}
					/>
				</CDropdownItem>
			</CDropdownMenu>
		</CDropdown>
	);
};

// TODO: consider moving this to utils
function getFirstTextboxObj(objects: fabric.Textbox[]): fabric.Textbox {
	return objects.find((el) => el.superType === 'textbox');
}

export default TextSpacing;
