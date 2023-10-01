import { toast } from "react-toastify";
import FontFaceObserver from 'fontfaceobserver';

export const handleRedo = (
	present: {
		actionType?: string;
		old: fabric.Object[];
		new: fabric.Object[];
	},
	canvas: fabric.Canvas
) => {
	// discard activeSelection to set the right position of object
	const activeSelection = canvas.getActiveObject();
	if (activeSelection && activeSelection.type === 'activeSelection') {
		canvas.discardActiveObject();
	}

	switch (present.actionType) {
		case 'layer':
			const newLayer = present.new;
			if (newLayer) {
				newLayer.forEach((layer: any) => {
					const curObj = canvas.getObjects().find((el) => el.id === layer.id);
					if (curObj) {
						canvas.moveTo(curObj, layer.index);
					}
				});

				canvas.renderAll();

				canvas.fire('layer:updated', {
					target: newLayer,
					transform: {
						originals: null,
						target: newLayer,
					},
				});
			}

			break;

		case 'object':
			if (!present.old) {
				// add new object removed
				const newObjs = present.new.map((el) => {
					if (el.undo) delete el.undo;
					if (el.removed) delete el.removed;

					return el;
				});

				// TODO: move this to utils
				fabric.util.enlivenObjects(
					newObjs,
					function (objects: fabric.Object[]) {
						let origRenderOnAddRemove = canvas.renderOnAddRemove;
						canvas.renderOnAddRemove = false;

						objects.forEach(function (o) {
							canvas.add(o);
						});

						canvas.renderOnAddRemove = origRenderOnAddRemove;
						canvas.renderAll();
					},
					'fabric'
				);

				// sync to other clients
				canvas.fire('object:undoredo', { target: newObjs });
			}

			if (present.old && present.new) {
				// rollback updated object
				present.new.forEach((newObj) => {
					const curObj = canvas.getObjects().find((el) => el.id === newObj.id);
					if (curObj) {
						curObj.set(newObj);
					}
				});
				canvas.renderAll();

				// sync to other clients
				canvas.fire('object:undoredo', { target: present.new });
			}

			if (!present.new) {
				// remove new object added
				const removedObjs = present.old.map((el) => {
					el.undo = true;
					return el;
				});
				canvas.remove(...removedObjs);
				canvas.renderAll();
			}
			break;

		default:
			break;
	}
};

export const handleUndo = (
	present: {
		actionType?: string;
		old: fabric.Object[];
		new: fabric.Object[];
	},
	canvas: fabric.Canvas
) => {
	const activeObject = canvas.getActiveObject();
	if (activeObject && activeObject.type === 'activeSelection') {
		canvas.discardActiveObject();
	}

	switch (present.actionType) {
		case 'layer':
			const preLayer = present.old;
			if (preLayer) {
				preLayer.forEach((layer: any) => {
					const curObj = canvas.getObjects().find((el) => el.id === layer.id);
					if (curObj) {
						canvas.moveTo(curObj, layer.index);
					}
				});

				canvas.renderAll();

				canvas.fire('layer:updated', {
					target: preLayer,
					transform: {
						originals: null,
						target: preLayer,
					},
				});
			}

			break;
		case 'object':
			if (!present.old) {
				// remove new object added
				present.new.forEach((removedObj) => {
					const curObj = canvas.getObjects().find((el) => el.id === removedObj.id);
					if (curObj) {
						curObj.undo = true;
						canvas.remove(curObj);
					}
				});
				canvas.renderAll();
			}

			if (present.old && present.new) {
				// rollback updated object
				present.old.forEach((oldObj) => {
					const curObj = canvas.getObjects().find((el) => el.id === oldObj.id);
					if (curObj) {
						curObj.set(oldObj);
					}
				});
				canvas.renderAll();

				// sync to other clients
				canvas.fire('object:undoredo', { target: present.old });
			}

			if (!present.new) {
				// add new object removed
				const newObjs = present.old.map((el) => {
					if (el.removed) delete el.removed;
					if (el.undo) delete el.undo;

					return el;
				});

				canvas.add(...newObjs);
				canvas.renderAll();

				// // sync to other clients
				canvas.fire('object:undoredo', { target: newObjs });
			}
			break;

		default:
			break;
	}
};

export function loadAndUseFont(font: string, callback: () => void) {
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