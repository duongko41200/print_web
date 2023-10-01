import React, { RefObject, useContext, useState, useEffect } from 'react';

import {
	CDropdown,
	CDropdownToggle,
	CDropdownMenu,
	CDropdownItem,
} from '@coreui/react';
import LineWeightIcon from '@mui/icons-material/LineWeight';
import FabricCanvasContext from '../canvas/CanvasContext';

import {
	NoneLineIcon,
	LargeDashIcon,
	SolidIcon,
	NormalDashIcon,
	SmallDashIcon,
} from './BorderIcon';
import { Box, Flex } from 'theme-ui';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Slider from '@mui/material/Slider';
import ColorPicker from '../colorpicker/ColorPicker';
import CustomSlider from '../slider/CustomSlider';

import { ActiveObjects } from '../canvas/CanvasSlice';

interface BorderPickerProps {
	activeObjects: ActiveObjects;
}

let originalStates = [];
function setOriginalStates(objects: Array<fabric.Object>) {
	originalStates = objects.map((el) => {
		return {
			id: el.id,
			stroke: el.stroke,
			strokeWidth: el.strokeWidth,
			strokeDashArray: el.strokeDashArray,
		};
	});
}

const BorderPicker: React.FC<BorderPickerProps> = ({ activeObjects }) => {
	const [borderType, setBorderType] = useState<string | null>(
		getBorderType(activeObjects.objects)
	);
	const [borderWeight, setBorderWeight] = useState<number>(
		activeObjects.objects.find(({ superType }) => superType === 'shape')
			.strokeWidth || 0
	);

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const handleBorderType = (
		event: React.MouseEvent<HTMLElement>,
		newBorderType: string | null
	) => {
		if (newBorderType && newBorderType !== borderType) {
			setOriginalStates(activeObjects.objects);

			switch (newBorderType) {
				case 'none':
					activeObjects.objects.forEach((el) => {
						el.set({
							stroke: null,
							strokeWidth: 0,
						});
					});

					if (activeObjects.group) {
						activeObjects.group.addWithUpdate();
					}
					if (activeObjects.activeSelection) {
						activeObjects.activeSelection.addWithUpdate();
					}

					canvas.current.fire('object:modified');
					canvas.current.requestRenderAll();
					break;
				case 'solid':
					activeObjects.objects.forEach((el) => {
						el.set({
							stroke: el.stroke ? el.stroke : '#000',
							strokeWidth: el.strokeWidth ? el.strokeWidth : 1,
							strokeDashArray: [],
						});
					});

					if (activeObjects.group) {
						activeObjects.group.addWithUpdate();
					}
					if (activeObjects.activeSelection) {
						activeObjects.activeSelection.addWithUpdate();
					}

					canvas.current.fire('object:modified');
					canvas.current.requestRenderAll();
					break;
				default:
					activeObjects.objects.forEach((el) => {
						el.set({
							stroke: el.stroke ? el.stroke : '#000',
							strokeWidth: el.strokeWidth ? el.strokeWidth : 1,
							strokeDashArray: newBorderType
								.split(' ')
								.map((el: any) => Number(el)),
						});
					});

					if (activeObjects.group) {
						activeObjects.group.addWithUpdate();
					}
					if (activeObjects.activeSelection) {
						activeObjects.activeSelection.addWithUpdate();
					}

					canvas.current.fire('object:modified');
					canvas.current.requestRenderAll();
					break;
			}

			setBorderType(newBorderType);

			const target = activeObjects.objects.map((el) => {
				return {
					id: el.id,
					stroke: el.stroke,
					strokeWidth: el.strokeWidth,
					strokeDashArray: el.strokeDashArray,
				};
			});
			canvas.current.fire('history:updated', {
				originals: originalStates,
				target,
			});
		}
	};

	const handleBorderWeightChange = (newBorderWeight: number) => {
		setOriginalStates(activeObjects.objects);

		if (newBorderWeight === 0) {
			setBorderType('none');

			activeObjects.objects.forEach((el) => {
				el.set({
					stroke: el.stroke,
					strokeWidth: 0,
				});
			});

			if (activeObjects.activeSelection) {
				activeObjects.activeSelection.addWithUpdate();
			}
			if (activeObjects.group) {
				activeObjects.group.addWithUpdate();
			}

			canvas.current.fire('object:modified');
			canvas.current.requestRenderAll();
		} else {
			setBorderType(borderType === 'none' ? 'solid' : borderType);

			activeObjects.objects.forEach((el) => {
				el.set({
					stroke: el.stroke ? el.stroke : '#000',
					strokeWidth: newBorderWeight,
				});
			});

			if (activeObjects.activeSelection) {
				activeObjects.activeSelection.addWithUpdate();
			}
			if (activeObjects.group) {
				activeObjects.group.addWithUpdate();
			}
			
			canvas.current.fire('object:modified');
			canvas.current.requestRenderAll();
		}
	};

	const handleBorderWeightCommitted = (
		originalValue: number,
		newValue: number
	) => {
		const originals = originalStates.map((el) => {
			el.strokeWidth = originalValue;
			if (originalValue === 0) {
				el.stroke = null;
			}

			return el;
		});

		const target = activeObjects.objects.map((el) => {
			return {
				id: el.id,
				stroke: el.stroke,
				strokeWidth: newValue,
			};
		});

		canvas.current.fire('history:updated', {
			originals,
			target,
		});
	};

	// Initialize border state when selecting object
	useEffect(() => {
		if (!activeObjects.objects) {
			return;
		}

		const curBorderType = getBorderType(activeObjects.objects);
		setBorderType(curBorderType);
		setBorderWeight(
			activeObjects.objects.find(({ superType }) => superType === 'shape')
				.strokeWidth || 0
		);
	}, [activeObjects]);

	return (
		<CDropdown autoClose='outside'>
			<CDropdownToggle color='light'>
				<LineWeightIcon />
			</CDropdownToggle>

			<CDropdownMenu>
				<CDropdownItem
					style={{
						backgroundColor: 'transparent',
						color: '#000',
						cursor: 'unset',
					}}
				>
					<ToggleButtonGroup
						size='small'
						value={borderType}
						exclusive
						onChange={handleBorderType}
						aria-label='border type'
					>
						<ToggleButton value='none' aria-label='none stroke'>
							<NoneLineIcon />
						</ToggleButton>
						<ToggleButton value='solid' aria-label='solid stroke'>
							<SolidIcon />
						</ToggleButton>
						<ToggleButton
							value='12 2'
							aria-label='large dash stroke'
						>
							<LargeDashIcon />
						</ToggleButton>
						<ToggleButton
							value='6 2'
							aria-label='normal dash stroke'
						>
							<NormalDashIcon />
						</ToggleButton>
						<ToggleButton
							value='2 2'
							aria-label='small dash stroke'
						>
							<SmallDashIcon />
						</ToggleButton>
					</ToggleButtonGroup>
				</CDropdownItem>

				<CDropdownItem
					style={{
						backgroundColor: 'transparent',
						color: '#000',
						cursor: 'unset',
					}}
				>
					<CustomSlider
						title='Border weight'
						value={borderWeight}
						setValue={setBorderWeight}
						handleOnChange={handleBorderWeightChange}
						handleOnChangeCommitted={handleBorderWeightCommitted}
						step={1}
					/>
				</CDropdownItem>

				{borderWeight && (
					<CDropdownItem
						style={{
							backgroundColor: 'transparent',
							color: '#000',
							cursor: 'unset',
						}}
					>
						<Box padding='0 10px' title='Border color'>
							<ColorPicker
								activeObjects={activeObjects}
								objectKey='stroke'
							/>
						</Box>
					</CDropdownItem>
				)}
			</CDropdownMenu>
		</CDropdown>
	);
};

function getBorderType(activeObjects: fabric.Object[]): string {
	const shapeObjects = activeObjects.filter((el) => el.superType === 'shape');

	if (!shapeObjects[0].stroke) {
		return 'none';
	}

	if (
		Array.isArray(shapeObjects[0].strokeDashArray) &&
		shapeObjects[0].strokeDashArray.length === 0
	) {
		return 'solid';
	}

	return shapeObjects[0].strokeDashArray
		? shapeObjects[0].strokeDashArray.join(' ')
		: 'solid';
}

export default BorderPicker;
