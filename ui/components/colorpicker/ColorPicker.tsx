import React, { useState, useEffect, useContext, RefObject } from 'react';
import { ColorChangeHandler, SketchPicker } from 'react-color';
import reactCSS from 'reactcss';
import { Gradient, Pattern } from 'fabric/fabric-impl';

import FabricCanvasContext from '../canvas/CanvasContext';

import { ActiveObjects } from '../canvas/CanvasSlice';

interface ColorPickerProps {
	activeObjects: ActiveObjects;
	objectKey: keyof fabric.Object;
	forTypes?: string[];
}

let changeColor = true;
let lastColor = '';

const ColorPicker: React.FC<ColorPickerProps> = ({
	activeObjects,
	objectKey,
	forTypes,
}) => {
	const [showPicker, setShowPicker] = useState(false);
	const [color, setColor] = useState<string | Pattern | Gradient>(
		getFirstObj(activeObjects.objects, forTypes)[objectKey]
	);
	const [originalColor, setOriginalColor] = useState<
		string | Pattern | Gradient
	>(getFirstObj(activeObjects.objects, forTypes)[objectKey]);

	// INIT DISPLAYING OPTION
	useEffect(() => {
		if (!activeObjects) {
			return;
		}

		if (color === getFirstObj(activeObjects.objects, forTypes)[objectKey]) {
			return;
		}

		setColor(getFirstObj(activeObjects.objects, forTypes)[objectKey]);
	}, [activeObjects]);

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const handleClick = () => {
		setShowPicker(!showPicker);
	};

	const handleClose = () => {
		setShowPicker(false);
	};

	const handleChange: ColorChangeHandler = (newColor) => {
		if (newColor.hex === color) {
			return;
		}

		setColor(newColor.hex);
		lastColor = newColor.hex;

		if (changeColor && activeObjects.objects) {
			changeColor = false;
			// canvas.current
			activeObjects.objects.forEach((el) => {
				if (!forTypes || forTypes.includes(el.superType)) {
					el.set(objectKey, newColor.hex);
				}
			});
			canvas.current.fire('object:modified');
			canvas.current.requestRenderAll();

			setTimeout(() => {
				changeColor = true;

				activeObjects.objects.forEach((el) => {
					if (!forTypes || forTypes.includes(el.superType)) {
						el.set(objectKey, newColor.hex);
					}
				});
				canvas.current.fire('object:modified');
				canvas.current.requestRenderAll();
			}, 100);
		}
	};

	const handleChangeComplete: ColorChangeHandler = (newColor, event) => {
		if (newColor.hex === originalColor) {
			return;
		}

		const originals = activeObjects.objects
			.filter((el) => forTypes && forTypes.includes(el.superType))
			.map((el) => {
				return {
					id: el.id,
					[objectKey]: originalColor,
				};
			});

		const target = activeObjects.objects
			.filter((el) => forTypes && forTypes.includes(el.superType))
			.map((el) => {
				return {
					id: el.id,
					[objectKey]: newColor.hex,
				};
			});

		canvas.current.fire('history:updated', {
			originals,
			target,
		});

		setOriginalColor(newColor.hex);
	};

	const styles = reactCSS({
		default: {
			color: {
				width: '28px',
				height: '28px',
				borderRadius: '3px',
				background: color,
			},
			popover: {
				position: 'absolute',
				zIndex: '3',
			},
			cover: {
				position: 'fixed',
				top: '0px',
				right: '0px',
				bottom: '0px',
				left: '0px',
			},
			swatch: {
				padding: '4px',
				background: '#ffffff',
				borderRadius: '2px',
				cursor: 'pointer',
				display: 'inline-block',
				boxShadow: '0 0 0 1px rgba(0,0,0,.2)',
				verticalAlign: 'middle',
			},
		},
	});

	return (
		<div style={{ height: '100%' }}>
			<div style={styles.swatch} onClick={handleClick}>
				<div style={styles.color} />
			</div>
			{showPicker && (
				<div style={styles.popover}>
					<div style={styles.cover} onClick={handleClose} />
					<SketchPicker
						color={color || '#000'}
						onChange={handleChange}
						onChangeComplete={handleChangeComplete}
					/>
				</div>
			)}
		</div>
	);
};

function getFirstObj(
	objects: fabric.Object[],
	superTypes?: string[]
): fabric.Object {
	if (!superTypes) {
		return objects[0];
	}

	return objects.find((el) => superTypes.includes(el.superType));
}

export default ColorPicker;
