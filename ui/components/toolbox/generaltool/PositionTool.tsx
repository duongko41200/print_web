import React, { RefObject, useContext } from 'react';

import { Grid } from 'theme-ui';
import { CDropdown, CDropdownToggle, CDropdownMenu } from '@coreui/react';

import {
	TopButton,
	LeftButton,
	RightButton,
	MiddleButton,
	CenterButton,
	BottomButton,
} from './GeneralButton';

import FabricCanvasContext from '@components/canvas/CanvasContext';
import { ActiveObjects } from '@components/canvas/CanvasSlice';

interface PositionToolProps {
	activeObjects: ActiveObjects;
}

let originals;
function setOriginals(activeObjects: ActiveObjects){
	if (activeObjects.group){
		originals = [{id: activeObjects.group.id, top: activeObjects.group.top, left: activeObjects.group.left}]
	} else {
		originals = activeObjects.objects.map(el => {
			return {
				id: el.id,
				top: el.top,
				left: el.left
			}
		});
	}
}

const PositionTool: React.FC<PositionToolProps> = ({ activeObjects }) => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const handleClick = (position: string) => {
		if (!activeObjects || !position) {
			return;
		}

		setOriginals(activeObjects);

		switch (position) {
			case 'top':
				if (activeObjects.group) {
					activeObjects.group.set({
						top:
							(activeObjects.group.height / 2) *
							activeObjects.group.scaleY,
					});
				} else {
					activeObjects.objects.forEach((el) => {
						el.set({
							top:
								((-activeObjects.activeSelection?.height || 0) +
									el.height * el.scaleY +
									el.strokeWidth) /
								2,
						});
						el.setCoords();
					});
				}

				break;
			case 'left':
				if (activeObjects.group) {
					activeObjects.group.set({
						left: activeObjects.group.width / 2,
					});
				} else {
					activeObjects.objects.forEach((el) => {
						el.set({
							left:
								((-activeObjects.activeSelection?.width || 0) +
									el.width * el.scaleX +
									el.strokeWidth) /
								2,
						});
						el.setCoords();
					});
				}

				break;
			case 'middle':
				if (activeObjects.group) {
					activeObjects.group.centerV();
				} else if (activeObjects.activeSelection) {
					activeObjects.objects.forEach((el) => {
						el.set({
							top: 0,
						});
						el.setCoords();
					});
				} else {
					activeObjects.objects.forEach((el) => {
						el.centerV();
						el.setCoords();
					});
				}

				break;
			case 'center':
				if (activeObjects.group) {
					activeObjects.group.centerH();
				} else if (activeObjects.activeSelection) {
					activeObjects.objects.forEach((el) => {
						el.set({
							left: 0,
						});
						el.setCoords();
					});
				} else {
					activeObjects.objects.forEach((el) => {
						el.centerH();
						el.setCoords();
					});
				}

				break;
			case 'bottom':
				if (activeObjects.group) {
					activeObjects.group.set({
						top:
							canvas.current.height / canvas.current.getZoom() -
							(activeObjects.group.height *
								activeObjects.group.scaleY -
								activeObjects.group.strokeWidth) /
								2,
					});
				} else if (activeObjects.activeSelection) {
					activeObjects.objects.forEach((el) => {
						el.set({
							top:
								(activeObjects.activeSelection.height -
									el.height * el.scaleY -
									el.strokeWidth) /
								2,
						});
						el.setCoords();
					});
				} else {
					activeObjects.objects.forEach((el) => {
						el.set({
							top:
								canvas.current.height / canvas.current.getZoom() -
								(el.height * el.scaleY + el.strokeWidth) / 2,
						});
						el.setCoords();
					});
				}
				
				break;
			case 'right':
				if (activeObjects.group) {
					activeObjects.group.set({
						left:
							canvas.current.width / canvas.current.getZoom() -
							(activeObjects.group.width *
								activeObjects.group.scaleX -
								activeObjects.group.strokeWidth) /
								2,
					});
				} else if (activeObjects.activeSelection) {
					activeObjects.objects.forEach((el) => {
						el.set({
							left:
								(activeObjects.activeSelection.width -
									el.width * el.scaleX -
									el.strokeWidth) /
								2,
						});
						el.setCoords();
					});
				} else {
					activeObjects.objects.forEach((el) => {
						el.set({
							left:
								canvas.current.width / canvas.current.getZoom() -
								(el.width * el.scaleX + el.strokeWidth) / 2,
						});
						el.setCoords();
					});
				}

				break;

			default:
				break;
		}

		if (activeObjects.activeSelection) {
			activeObjects.activeSelection.addWithUpdate();
		}

		// sync to other client
		canvas.current.fire('object:modified', {transform: {originals}});
		canvas.current.requestRenderAll();
	};

	return (
		<CDropdown direction='center' autoClose='outside'>
			<CDropdownToggle color='light'>Position</CDropdownToggle>
			<CDropdownMenu>
				<Grid padding='5px 8px' sx={{ gridTemplateColumns: '1fr 1fr' }}>
					<TopButton onClick={() => handleClick('top')} />
					<LeftButton onClick={() => handleClick('left')} />
					<MiddleButton onClick={() => handleClick('middle')} />
					<CenterButton onClick={() => handleClick('center')} />
					<BottomButton onClick={() => handleClick('bottom')} />
					<RightButton onClick={() => handleClick('right')} />
				</Grid>
			</CDropdownMenu>
		</CDropdown>
	);
};

export default PositionTool;
