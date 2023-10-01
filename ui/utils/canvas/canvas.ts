import { fabric } from 'fabric';
import { promisify } from 'util';

import store from '@store/store';

import { handleRedo, handleUndo } from './handler';
import { redo, undo } from '@components/canvas/CanvasSlice';
import { ActiveSelection } from 'fabric/fabric-impl';

export function initCustomMethods(canvas: fabric.Canvas) {
	fabric.Canvas.prototype.resetPosition = function (callback) {
		const zoom = canvas.initZoom || 1;
		canvas.viewportTransform = [zoom, 0, 0, zoom, 0, 0];

		canvas.renderAll();

		callback && callback();
	};

	fabric.Canvas.prototype.myFindObjectsByAttr = function (attr: string, value: any): fabric.Object[] {
		return canvas.getObjects().filter((el) => el[attr] == value);
	};

	fabric.Canvas.prototype.myExportData = function (type: string, quality = 1, callback) {
		const transform = canvas.viewportTransform.slice();
		const zoom = canvas.initZoom || 1;
		canvas.viewportTransform = [zoom, 0, 0, zoom, 0, 0];

		let data;
		if (type === 'png') {
			data = canvas.toDataURL({
				format: 'png',
				multiplier: quality,
			});
		}
		if (type === 'svg') {
			data = canvas.toSVG();
		}
		if (type === 'json') {
			data = canvas.toJSON();
		}
		canvas.viewportTransform = transform;

		callback && callback(null, data);

		return data;
	};

	fabric.Canvas.prototype.exportObjects = (type, all = true, callback): string => {
		const activeObjects = canvas.getActiveObjects();
		const objects = canvas.getObjects();

		if (!all && activeObjects.length > 0) {
			const clonedObjs = activeObjects.map((obj) => fabric.util.object.clone(obj));
			const group = new fabric.Group(clonedObjs);

			let data: string;
			if (type === 'png') {
				data = group.toDataURL({
					format: 'png',
					multiplier: 10,
				});
			}
			if (type === 'svg') {
				data = group.toSVG();
				data = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${group.width}" height="${group.height}">
				${data}
			  </svg>`;
			}

			callback && callback(null, data);

			return data;
		}

		if (all && objects.length > 0) {
			const clonedObjs = objects.map((obj) => fabric.util.object.clone(obj));
			const group = new fabric.Group(clonedObjs);

			let data: string;
			if (type === 'png') {
				data = group.toDataURL({
					format: 'png',
					multiplier: 10,
				});
			}
			if (type === 'svg') {
				data = group.toSVG();
			}

			callback && callback(null, data);

			return data;
		}

		return null;
	};

	fabric.Canvas.prototype.removeSelectedObjects = function () {
		canvas.remove(...canvas.getActiveObjects());
		canvas.discardActiveObject();
		canvas.requestRenderAll();
	};

	fabric.Canvas.prototype.group = function () {
		const activeSelection = canvas.getActiveObject() as fabric.ActiveSelection;
		if (!activeSelection || activeSelection.type !== 'activeSelection') {
			return;
		}

		activeSelection.toGroup();
		canvas.requestRenderAll();
	};

	fabric.Canvas.prototype.ungroup = function () {
		const activeSelection = canvas.getActiveObject() as fabric.ActiveSelection;
		if (!activeSelection || activeSelection.type !== 'group') {
			return;
		}

		const group = activeSelection.toActiveSelection();
		if (group.id) {
			delete group.id;
		}
		canvas.requestRenderAll();
	};

	fabric.Canvas.prototype.undo = function () {
		store.dispatch(
			undo({
				callback: (present: any) => {
					handleUndo(present, canvas);
				},
			})
		);
	};

	fabric.Canvas.prototype.redo = function () {
		store.dispatch(
			redo({
				callback: (present: any) => {
					handleRedo(present, canvas);
				},
			})
		);
	};

	fabric.Canvas.prototype.selectAllObjects = function () {
		// Deselect any currently selected objects or active group
		canvas.discardActiveObject();

		// Get all objects on the canvas
		const allObjects = canvas.getObjects();

		// Set all objects as the active selection
		canvas.setActiveObject(new fabric.ActiveSelection(allObjects, { canvas }));

		// Request a render to update the canvas
		canvas.requestRenderAll();
	};

	fabric.Canvas.prototype.cloneObjects = function () {
		var activeObject = canvas.getActiveObject() as ActiveSelection;
		if (activeObject.type === 'activeSelection') {
			// it's an group, let's clone all the objects
			activeObject.getObjects().forEach(function (object) {
				object.clone(function (cloned) {
					const matrix = object.calcTransformMatrix();
					const { translateX: left, translateY: top } = fabric.util.qrDecompose(matrix);

					cloned.id = null;
					cloned.left = left + 30;
					cloned.top = top - 30;
					canvas.add(cloned);
				});
			});
		} else {
			// it's a single object, let's clone it
			activeObject.clone(function (cloned) {
				cloned.id = null;
				cloned.left += 30;
				cloned.top -= 30;
				canvas.add(cloned);
			});
		}

		canvas.requestRenderAll();
	};

	fabric.Canvas.prototype.download = async function (name: string, type: string) {
		if (type === 'png') {
			try {
				const data = await promisify(canvas.myExportData).bind(canvas)('png', 10);
				const a = document.createElement('a');
				a.href = data;
				a.download = `${name}-${Date.now()}.png`;
				a.click();
			} catch (err) {
				console.log(err);
			}
		}

		if (type === 'svg') {
			// Export the canvas as SVG
			const svgData = canvas.myExportData('svg');

			// Create a download link for the SVG file
			const downloadLink = document.createElement('a');
			downloadLink.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
			downloadLink.download = `${name}-${Date.now()}.svg`;
			downloadLink.click();
		}

		if (type === 'json') {
			// Export the canvas as JSON
			const jsonData = JSON.stringify(canvas.myExportData('json'), null, 2);

			// Create a download link for the JSON file
			const downloadLink = document.createElement('a');
			downloadLink.href = `data:text/json;charset=utf-8,${encodeURIComponent(jsonData)}`;
			downloadLink.download = `${name}-${Date.now()}.json`;
			downloadLink.click();
		}
	};

	fabric.Canvas.prototype.downloadObjects = async function (name: string, type: string, all = true) {
		if (type === 'png') {
			const data = await promisify(canvas.exportObjects).bind(canvas)('png', all);
			const a = document.createElement('a');
			a.href = data;
			a.download = `${name}-${Date.now()}.png`;
			a.click();
		}

		if (type === 'svg') {
			// Export the canvas as SVG
			const svgData = canvas.exportObjects('svg', all);

			const blob = new Blob([svgData], { type: 'image/svg+xml' });
			const blobURL = URL.createObjectURL(blob);

			// Create a download link for the SVG file
			const downloadLink = document.createElement('a');
			downloadLink.href = blobURL;
			downloadLink.download = `${name}-${Date.now()}.svg`;
			downloadLink.click();
		}
	};

	fabric.Canvas.prototype.getAbsoluteObject = function (object: fabric.Object): fabric.Object {
		const matrix = object.calcTransformMatrix();
		let { translateX: left, translateY: top, angle, scaleX, scaleY } = fabric.util.qrDecompose(matrix);

		let newObj = {
			...object.toObject(['id', 'superType']),
			left,
			top,
			angle,
			scaleX,
			scaleY,
		} as fabric.Object;
		
		return newObj;
	};

	fabric.Canvas.prototype.getAbsoluteObjects = function (): fabric.Object[] {
		return canvas.getObjects().map(obj => canvas.getAbsoluteObject(obj));
	};
}

interface CustomObject {
	id: string;
	superType: string;
	undo: boolean;
	removed: boolean;
	fontFamily: string;
}

interface CustomCanvas {
	initZoom: number;

	resetPosition: (callback?: () => void) => void;
	myFindObjectsByAttr: (attr: string, value: any) => fabric.Object[];
	myExportData: (type: string, quality?: number, callback?: (error: any, data: string) => void) => string;
	exportObjects: (type: string, all?: boolean, callback?: (error: any, data: string) => void) => string;
	removeSelectedObjects: () => void;
	group: () => void;
	ungroup: () => void;
	undo: () => void;
	redo: () => void;
	selectAllObjects: () => void;
	cloneObjects: () => void;
	download: (name: string, type: string) => Promise<void>;
	downloadObjects: (name: string, type: string, all?: boolean) => Promise<void>;
	getAbsoluteObject: (object: fabric.Object) => fabric.Object;
	getAbsoluteObjects: () => fabric.Object[];
}

declare module 'fabric' {
	namespace fabric {
		interface Object extends CustomObject {}
		interface Canvas extends CustomCanvas {}
	}
}
