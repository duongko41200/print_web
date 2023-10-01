import React, { RefObject, useContext } from 'react';

import { CButton } from '@coreui/react';

import { fabric } from 'fabric';

import FabricCanvasContext from '@components/canvas/CanvasContext';
import { useAppSelector } from '@store/hooks';

interface CropImageProps {}

const CropImage: React.FC<CropImageProps> = ({}) => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);
	const activeObjects = useAppSelector((state) => state.canvas.activeObjects);

	const handleCropImage = () => {
		if (!canvas || !activeObjects.objects) {
			return;
		}
		const imageObject = activeObjects.objects[0];

		// 1, draw a rect on image
		let cropArea = new fabric.Rect({
			left: imageObject.left,
			top: imageObject.top,
			originX: 'center',
			originY: 'center',
			width: imageObject.width / 2,
			height: imageObject.height / 2,
			opacity: 0.2,
			hasRotatingPoint: false,
			id: `crop-${imageObject.id}`,
			scaleX: imageObject.scaleX,
			scaleY: imageObject.scaleY,
			angle: imageObject.angle,
		} as fabric.Object);

		canvas.current.add(cropArea);
		canvas.current.setActiveObject(cropArea);

		// 2, set event for cropping rect
		cropArea.on('moving', (e) => {
			if (cropArea.isContainedWithinObject(imageObject)) {
				cropArea.lastLeft = cropArea.left;
				cropArea.lastTop = cropArea.top;
				cropArea.set('left', e.pointer.x);
				cropArea.set('top', e.pointer.y);
				cropArea.setCoords();

				canvas.current.renderAll();
			} else {
				cropArea.left = cropArea.lastLeft;
				cropArea.top = cropArea.lastTop;
			}
		});

		// 3, draw new image with data above
		canvas.current.renderAll();
	};

	return (
		<>
			<CButton onClick={handleCropImage} color='light'>
				Crop
			</CButton>
		</>
	);
};

export default CropImage;
