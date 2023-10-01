import React, { RefObject, useContext, useState, useEffect } from 'react';

import {
	CDropdown,
	CDropdownToggle,
	CDropdownMenu,
	CDropdownItem,
} from '@coreui/react';
import LineWeightIcon from '@mui/icons-material/LineWeight';
import FabricCanvasContext from '../canvas/CanvasContext';


import { Box } from 'theme-ui';

import ColorPicker from '../colorpicker/ColorPicker';
import CustomSlider from '../slider/CustomSlider';

import { useAppSelector } from '../../store/hooks';

interface StrokeWeightProps {
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

const StrokeWeight: React.FC<StrokeWeightProps> = ({ }) => {
	const activeObjects = useAppSelector(state => state.canvas.activeObjects);

	const [borderWeight, setBorderWeight] = useState<number>(getFirstPathObj(activeObjects.objects).strokeWidth || 0);

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	// INIT DISPLAYING OPTION
	useEffect(() => {
		if (!activeObjects){
			return;
		}

		if (borderWeight === getFirstPathObj(activeObjects.objects).strokeWidth){
			return;
		}

		setBorderWeight(getFirstPathObj(activeObjects.objects).strokeWidth || 0);
	}, [activeObjects])

	const handleStrokeWeightChange = (newBorderWeight: number) => {
		setOriginalStates(activeObjects.objects);

		if (newBorderWeight === 0) {
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


	return (
		<CDropdown autoClose='outside'>
			<CDropdownToggle color='light'>
				<LineWeightIcon />
			</CDropdownToggle>

			<CDropdownMenu style={{width: '300px'}}>
				<CDropdownItem
					style={{
						backgroundColor: 'transparent',
						color: '#000',
						cursor: 'unset',
					}}
				>
					<CustomSlider
						title='Border weight'
						inputField
						value={borderWeight}
						setValue={setBorderWeight}
						handleOnChange={handleStrokeWeightChange}
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

function getFirstPathObj(objects: fabric.Path[]){
	if (!objects){
		return;
	}
	return objects.find((el) => el.superType === 'path');
}

export default StrokeWeight;
