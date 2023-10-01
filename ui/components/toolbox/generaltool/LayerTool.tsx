import React, { RefObject, useContext } from 'react';

import { Grid } from 'theme-ui';
import { CDropdown, CDropdownToggle, CDropdownMenu } from '@coreui/react';

import {
	BackwardButton,
	ForwardButton,
	ToFrontButton,
	ToBackButton,
} from './GeneralButton';

import FabricCanvasContext from '../../canvas/CanvasContext';
import { useAppSelector } from '../../../store/hooks';

interface LayerToolProps {}

let originals = [];
function setOriginals(objects: Array<fabric.Object>) {
	originals = objects.map((el, index) => {
		return {
			id: el.id,
			index,
		};
	});
}

const LayerTool: React.FC<LayerToolProps> = ({}) => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const activeObjects = useAppSelector((state) => state.canvas.activeObjects);

	const handleClick = (type: string) => {
		if (!activeObjects || !type) {
			return;
		}

		setOriginals(canvas.current.getObjects());

		switch (type) {
			case 'backward':
				if (activeObjects.group) {
					activeObjects.group.sendBackwards(true);
				} else if (activeObjects.activeSelection) {
					activeObjects.activeSelection.sendBackwards(true);
				} else {
					activeObjects.objects[0].sendBackwards(true);
				}

				break;

			case 'forward':
				if (activeObjects.group) {
					activeObjects.group.bringForward(true);
				} else if (activeObjects.activeSelection) {
					activeObjects.activeSelection.bringForward(true);
				} else {
					activeObjects.objects[0].bringForward(true);
				}

				break;

			case 'toBack':
				if (activeObjects.group) {
					activeObjects.group.sendToBack();
				} else if (activeObjects.activeSelection) {
					activeObjects.activeSelection.sendToBack();
				} else {
					activeObjects.objects[0].sendToBack();
				}

				break;

			case 'toFront':
				if (activeObjects.group) {
					activeObjects.group.bringToFront();
				} else if (activeObjects.activeSelection) {
					activeObjects.activeSelection.bringToFront();
				} else {
					activeObjects.objects[0].bringToFront();
				}

				break;

			default:
				break;
		}

		const newLayer = canvas.current.getObjects().map((el, index) => {
			return {
				id: el.id,
				index,
			};
		});

		if (!compareArray(originals, newLayer)) {
			canvas.current.fire('layer:updated', {
				target: newLayer,
				transform: {
					originals,
					target: newLayer,
				},
			});
			canvas.current.requestRenderAll();
		}
	};

	return (
		<CDropdown direction='center' autoClose='outside'>
			<CDropdownToggle color='light'>Layer</CDropdownToggle>
			<CDropdownMenu>
				<Grid padding='5px 8px' sx={{ gridTemplateColumns: '1fr 1fr' }}>
					<BackwardButton onClick={() => handleClick('backward')} />
					<ForwardButton onClick={() => handleClick('forward')} />
					<ToFrontButton onClick={() => handleClick('toFront')} />
					<ToBackButton onClick={() => handleClick('toBack')} />
				</Grid>
			</CDropdownMenu>
		</CDropdown>
	);
};

// TODO: move to utils
function compareArray(arr1: Array<any>, arr2: Array<any>) {
	const sortedArr1 = [...arr1].sort((a, b) => a.id - b.id);
	const sortedArr2 = [...arr2].sort((a, b) => a.id - b.id);

	const string1 = JSON.stringify(sortedArr1);
	const string2 = JSON.stringify(sortedArr2);

	return string1 === string2;
}

export default LayerTool;
