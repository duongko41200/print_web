import React, { useContext, useCallback, useEffect, RefObject } from 'react';
import { fabric } from 'fabric';
import { Socket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import ResizeObserver from 'resize-observer-polyfill';
import { toast } from 'react-toastify';

import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import { IconButton, Tooltip } from '@mui/material';
import { Box } from 'theme-ui';

import { SocketContext } from '@pages/designs/[designId]';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setObjectType, saveHistory, setActiveObjects, ActiveObjects, removeActive } from '../CanvasSlice';
import { removeCursorPosition, updateCursorPosition } from './CursorSlice';
import FabricCanvasContext from '../CanvasContext';
import { getAuthTokenFromCookie } from '@utils/cookie';
import { initCustomMethods } from '@utils/canvas/canvas';
import { loadAndUseFont } from '@utils/canvas/handler';
import { updateDesign } from 'services/dbhandler';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

interface dataProps {
	id: string;
	data: fabric.Object;
}

interface LayerProps {
	id: string;
	index: number;
}

interface DataLayerProps {
	id: string;
	data: LayerProps[];
}

interface CanvasProps {}

let emitObjectMoving = true;
let lastObjectPositions = {};

let emitCursor = true;
let lastCursorPosition;

let cursorLayerCanvas: fabric.Canvas;

const Canvas: React.FC<CanvasProps> = ({}) => {
	const fabricRef = useFabricCanvas();
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);
	const socket: Socket = useContext(SocketContext);
	const dispatch = useAppDispatch();

	const currentUser = useAppSelector((state) => state.app.currentUser);
	const designPermission = useAppSelector((state) => state.app.designPermission);
	const design = useAppSelector((state) => state.app.design);
	const token = getAuthTokenFromCookie();

	useEffect(() => {
		cursorLayerCanvas = new fabric.Canvas('canvas-cursor', {
			selection: false,
		});

		cursorLayerCanvas.getElement().parentNode.style.position = 'absolute';
		cursorLayerCanvas.getElement().parentNode.style.left = 0;
		cursorLayerCanvas.getElement().parentNode.style.top = 0;
		cursorLayerCanvas.getElement().parentNode.style.zIndex = 2;
		cursorLayerCanvas.getElement().parentNode.style.pointerEvents = 'none';
	}, []);

	useEffect(() => {
		// update immediately when user leave
		async function handleBeforeUnload() {
			if (!design || !canvas.current) {
				return;
			}
			await updateDesign(design.id, { elements: canvas.current.getAbsoluteObjects() });
		}

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	// collaborative sync
	useEffect(() => {
		if (!socket) {
			return;
		}

		// Sync canvas to all client
		function onReceiveFromSocketServer(data: dataProps) {
			if (publicRuntimeConfig.NODE_ENV === 'development') {
				console.log('Some clients are editing: ', data);
			}

			const objects = canvas.current.getObjects();
			const receiveObj = data.data;

			if (Array.isArray(receiveObj)) {
				let existed = false;
				receiveObj.forEach((obj) => {
					const existingObj = objects.find((el) => el.id === obj.id);
					if (existingObj) {
						existed = true;

						if (obj.superType === 'textbox') {
							loadAndUseFont(obj.fontFamily, () => {
								existingObj.set(obj);
								canvas.current.renderAll();
							});
						} else {
							existingObj.set(obj);
						}
						existingObj.setCoords();
					}
				});

				if (!existed) {
					fabric.util.enlivenObjects(
						receiveObj,
						(enlivenedObjects: fabric.Object[] & fabric.Textbox[]) => {
							enlivenedObjects.forEach((object) => {
								object.toJSON = (function (toJSON) {
									return function () {
										return fabric.util.object.extend(toJSON.call(this), {
											id: this.id,
											superType: this.superType,
										});
									};
								})(object.toJSON);

								if (object.superType === 'textbox') {
									loadAndUseFont(object.fontFamily, () => canvas.current.add(object));
								} else {
									canvas.current.add(object);
								}
							});
						},
						'fabric'
					);
				}
			} else {
				const existingObj = objects.find((el) => el.id === receiveObj.id);
				if (!existingObj && !receiveObj.removed) {
					// create new object on sync
					fabric.util.enlivenObjects(
						[receiveObj],
						(enlivenedObjects: fabric.Object[] & fabric.Textbox[]) => {
							enlivenedObjects.forEach((object) => {
								object.toJSON = (function (toJSON) {
									return function () {
										return fabric.util.object.extend(toJSON.call(this), {
											id: this.id,
											superType: this.superType,
										});
									};
								})(object.toJSON);

								if (object.superType === 'textbox') {
									loadAndUseFont(object.fontFamily, () => canvas.current.add(object));
								} else {
									canvas.current.add(object);
								}
							});
						},
						'fabric'
					);
				} else {
					// remove object on sync
					if (receiveObj.removed) {
						existingObj.removed = true;
						canvas.current.remove(existingObj);
					}
				}
			}

			canvas.current.renderAll();
		}

		function onUpdatedLayer(data: DataLayerProps) {
			if (publicRuntimeConfig.NODE_ENV === 'development'){
				console.log('[x] New layer from other client: ', data.data);
			}

			const newLayer = data.data;

			newLayer.forEach((layer) => {
				const curObj = canvas.current.getObjects().find((el) => el.id === layer.id);
				if (curObj) {
					canvas.current.moveTo(curObj, layer.index);
				}
			});

			canvas.current.renderAll();
		}

		// listen event
		socket.on('sendDataServer', onReceiveFromSocketServer);
		socket.on('updated-layer', onUpdatedLayer);

		socket.on('update-cursor-position', (cursorData) => {
			const cursors = cursorLayerCanvas.getObjects().filter((el) => el.id == cursorData.userId);

			if (cursors && cursors.length > 0) {
				// update cursor position
				cursors.forEach((el: fabric.Object) => {
					el.set({ left: cursorData.x, top: cursorData.y });
					el.setCoords();
					cursorLayerCanvas.renderAll();
				});
			} else {
				// add new cursor image
				fabric.loadSVGFromURL('/static/images/icons/svg/cursor.svg', function (imgs) {
					imgs.forEach((img) => {
						img.set({
							id: cursorData.userId,
							left: cursorData.x,
							top: cursorData.y,
							originX: 'center',
							originY: 'center',
							superType: 'cursor',
							selectable: false,
						});
						img.scaleToWidth(20);

						img.toObject = (function (toObject) {
							return function () {
								return fabric.util.object.extend(toObject.call(this), {
									id: this.id,
									superType: this.superType,
								});
							};
						})(img.toObject);

						cursorLayerCanvas.add(img);
					});

					cursorLayerCanvas.renderAll();
				});
			}

			dispatch(updateCursorPosition(cursorData));
		});
		socket.on('user-disconnected', (leavedUser) => {
			const cursors = cursorLayerCanvas.getObjects().filter((el) => el.id == leavedUser.id);
			if (cursors && cursors.length > 0) {
				// update cursor position
				cursors.forEach((el: fabric.Object) => {
					cursorLayerCanvas.remove(el);
				});
				cursorLayerCanvas.renderAll();
			}
			dispatch(removeCursorPosition(leavedUser.id));
		});

		return () => {
			socket.off('sendDataServer', onReceiveFromSocketServer);
			socket.off('updated-layer', onUpdatedLayer);
			socket.off('cursor-position');
			socket.off('user-disconnected');
		};
	}, [socket]);

	const handleOnKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!canvas.current) {
			return;
		}

		if ((e.key === 's' || e.key === 'S') && e.ctrlKey) {
			e.preventDefault();
		}

		if ((e.key === 'z' || e.key === 'Z') && e.ctrlKey) {
			e.preventDefault();
		}
		if ((e.key === 'y' || e.key === 'Y') && e.ctrlKey) {
			e.preventDefault();
		}

		if ((e.key === 'd' || e.key === 'D') && e.ctrlKey) {
			e.preventDefault();
		}

		if ((e.key === 'g' || e.key === 'G') && e.ctrlKey) {
			e.preventDefault();
		}

		if ((e.key === 'g' || e.key === 'G') && e.ctrlKey && e.shiftKey) {
			e.preventDefault();
		}

		if ((e.key === 'g' || e.key === 'G') && e.ctrlKey && e.shiftKey) {
			e.preventDefault();
		}

		if ((e.key === 'a' || e.key === 'A') && e.ctrlKey) {
			e.preventDefault();
		}

		if (e.key === 'Delete' || e.key === 'Backspace') {
			e.preventDefault();
		}
	};

	const handleOnKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!canvas.current) {
			return;
		}

		if ((e.key === 's' || e.key === 'S') && e.ctrlKey) {
			e.preventDefault();
			toast.info('Your design is saved automatically');
		}

		if ((e.key === 'z' || e.key === 'Z') && e.ctrlKey) {
			e.preventDefault();
			canvas.current.undo();
		}
		if ((e.key === 'y' || e.key === 'Y') && e.ctrlKey) {
			e.preventDefault();
			canvas.current.redo();
		}

		if ((e.key === 'd' || e.key === 'D') && e.ctrlKey) {
			e.preventDefault();
			canvas.current.cloneObjects();
		}

		if ((e.key === 'g' || e.key === 'G') && e.ctrlKey) {
			e.preventDefault();
			canvas.current.group();
		}

		if ((e.key === 'g' || e.key === 'G') && e.ctrlKey && e.shiftKey) {
			e.preventDefault();
			canvas.current.ungroup();
		}

		if ((e.key === 'g' || e.key === 'G') && e.ctrlKey && e.shiftKey) {
			e.preventDefault();
			canvas.current.ungroup();
		}

		if ((e.key === 'a' || e.key === 'A') && e.ctrlKey) {
			e.preventDefault();
			canvas.current.selectAllObjects();
		}

		if (e.key === 'Delete' || e.key === 'Backspace') {
			e.preventDefault();
			canvas.current.removeSelectedObjects();
		}
	};

	// Set socket event lister
	useEffect(() => {
		if (!canvas.current || !fabric) {
			return;
		}

		// for objects
		function onAddNewObjectHandler(opt: fabric.IEvent<MouseEvent>): void {
			if (publicRuntimeConfig.NODE_ENV === 'development') {
				console.log('[+] New object added', opt.target);
			}

			const obj = opt.target;
			// if (obj && obj.superType === 'cursor') {
			// 	return;
			// }

			if (!obj.superType && obj.type === 'path') {
				obj.superType = 'path';
			}

			if (obj.id && obj.removed) {
				// this mean users have ungroup
				delete obj.removed;
				delete obj.id;
			}

			if (!obj.id) {
				// new object added not from sync
				obj.set('id', uuid());
				obj.toJSON = (function (toJSON) {
					return function () {
						return fabric.util.object.extend(toJSON.call(this), {
							id: this.id,
							superType: this.superType,
						});
					};
				})(obj.toJSON);

				const matrix = obj.calcTransformMatrix();
				let absolutePosition = fabric.util.qrDecompose(matrix);
				absolutePosition.left = absolutePosition.translateX;
				absolutePosition.top = absolutePosition.translateY;

				// save history to redux store
				dispatch(
					saveHistory({
						old: null,
						new: [
							{
								...obj.toObject(['id', 'superType']),
								...absolutePosition,
							},
						],
					})
				);

				const thumbnail = canvas.current.myExportData('png');
				socket.emit('edit-design', {
					id: design.id,
					objects: canvas.current.getAbsoluteObjects(),
					data: {
						...obj.toObject(['id', 'superType']),
						...absolutePosition,
					},
					thumbnail,
					token,
					collection: 'design',
				});
			}
		}

		function onMovingObjectHandler(opt: fabric.IEvent): void {
			const selectedObjs = canvas.current.getActiveObjects();
			const positions = selectedObjs.map((el: fabric.Object) => {
				// calc actual left, top and angle
				el.set({
					originX: 'center',
					originY: 'center',
				});
				const matrix = el.calcTransformMatrix();
				const { translateX: left, translateY: top, angle } = fabric.util.qrDecompose(matrix);

				return {
					id: el.id,
					left,
					top,
				};
			});
			lastObjectPositions = positions;

			if (emitObjectMoving) {
				emitObjectMoving = false;
				socket.emit('edit-design', {
					id: design.id,
					data: positions,
					token,
				});

				setTimeout(() => {
					emitObjectMoving = true;

					socket.emit('edit-design', {
						id: design.id,
						data: lastObjectPositions,
						token,
					});
				}, 50);
			}
		}

		function onBeforeTransformObject(opt: fabric.IEvent): void {
			if (publicRuntimeConfig.NODE_ENV === 'development') {
				console.log('[x] Before transforming object: ', opt.transform);
				console.log(opt);
			}

			const _activeObjs = canvas.current.getActiveObjects();
			const activeObjs = _activeObjs.map((el) => {
				// calc actual left, top and angle
				el.set({
					originX: 'center',
					originY: 'center',
				});
				const matrix = el.calcTransformMatrix();
				let { translateX: left, translateY: top, angle, scaleX, scaleY } = fabric.util.qrDecompose(matrix);

				let newObj = {
					...el.toObject(['id']),
					left,
					top,
					angle,
					scaleX,
					scaleY,
				};

				return newObj;
			});
			opt.transform.originals = activeObjs;
			opt.originals = activeObjs;
		}

		function onModifyObjectHandler(opt: fabric.IEvent): void {
			if (publicRuntimeConfig.NODE_ENV === 'development') {
				console.log('[x] Object modified: ', opt);
			}

			let selectedObjs = canvas.current.getActiveObjects();
			let updatedObjs = [];
			updatedObjs = selectedObjs.map((el) => {
				// calc actual left, top and angle
				el.set({
					originX: 'center',
					originY: 'center',
				});
				const matrix = el.calcTransformMatrix();
				let { translateX: left, translateY: top, angle, scaleX, scaleY } = fabric.util.qrDecompose(matrix);

				let newObj = {
					...el.toObject(['id']),
					left,
					top,
					angle,
					scaleX,
					scaleY,
				};

				return newObj;
			});

			// save history to redux store
			if (opt.transform) {
				dispatch(
					saveHistory({
						old: opt.transform.originals,
						new: updatedObjs,
					})
				);
			}

			// sync to other clients
			const thumbnail = canvas.current.myExportData('png');
			socket.emit('edit-design', {
				id: design.id,
				data: updatedObjs,
				objects: canvas.current.getAbsoluteObjects(),
				thumbnail,
				token,
				collection: 'design',
			});
		}

		function onChangeText(opt: fabric.IEvent) {
			const obj = opt.target as fabric.Textbox;

			dispatch(
				saveHistory({
					old: [
						{
							id: obj.id,
							text: obj._textBeforeEdit,
						},
					],
					new: [
						{
							id: obj.id,
							text: obj.text,
						},
					],
				})
			);
		}

		function onRemoveObjectHandler(opt: fabric.IEvent): void {
			if (publicRuntimeConfig.NODE_ENV === 'development') {
				console.log('[x] Object removed: ', opt.target);
			}

			const obj = opt.target;
			// if (obj && obj.superType === 'cursor') {
			// 	return;
			// }

			if (obj.removed) {
				return; // obj already removed, no sync again
			}
			obj.set('removed', true);
			obj.toJSON = (function (toJSON) {
				return function () {
					return fabric.util.object.extend(toJSON.call(this), {
						id: this.id,
						removed: this.removed,
					});
				};
			})(obj.toJSON);

			// save history into redux
			if (!obj.undo) {
				dispatch(
					saveHistory({
						old: [obj],
						new: null,
					})
				);
			}

			// sync to other clients
			const thumbnail = canvas.current.myExportData('png');
			socket.emit('edit-design', {
				id: design.id,
				data: obj,
				objects: canvas.current.getAbsoluteObjects(),
				thumbnail,
				token,
				collection: 'design',
			});
			canvas.current.discardActiveObject();
		}

		function onSelectObjectHandler(opt: fabric.IEvent) {
			// get selection type
			let selectedType = '';
			let selectedObject: ActiveObjects = {
				group: null,
				activeSelection: null,
				objects: null,
			};

			const activeObject = canvas.current.getActiveObject() as fabric.ActiveSelection &
				fabric.Group &
				fabric.Object;

			if (activeObject.type === 'group' || activeObject.type === 'activeSelection') {
				// user choose group of multiple objects
				let types = [];
				const objects = activeObject.getObjects();
				const activeTypes = objects.map((el) => el.superType || el.type);
				if (activeTypes.includes('path')) {
					types.push('path');
				}
				if (activeTypes.includes('shape')) {
					types.push('shape');
				}
				if (activeTypes.includes('textbox')) {
					types.push('textbox');
				}

				selectedType = types.join(':');

				selectedObject.objects = objects as fabric.Object[] & fabric.Textbox[] & fabric.Path[] & fabric.Image[];
				selectedObject[activeObject.type] = activeObject;
			} else {
				// user choose only one object
				selectedType = activeObject.superType || activeObject.type;
				selectedObject.objects = [activeObject];
			}

			dispatch(setObjectType(selectedType));
			dispatch(setActiveObjects(selectedObject));
		}

		function onDeselectObjectHandler() {
			// use setTimeout to handle side effect in redux reducers
			dispatch(removeActive());
		}

		// for canvas
		const zoomHandler = (opt: fabric.IEvent<WheelEvent>): void => {
			var delta = opt.e.deltaY; // > 0 (zoom in); < 0 (zoom out)
			var zoom = canvas.current.getZoom();
			zoom *= 0.999 ** delta;
			if (zoom > 5 * canvas.current.initZoom) zoom = 5 * canvas.current.initZoom;
			if (zoom < 0.5 * canvas.current.initZoom) zoom = 0.5 * canvas.current.initZoom;

			canvas.current.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

			// sync to cursor layout
			cursorLayerCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

			cursorLayerCanvas.renderAll();

			opt.e.preventDefault();
			opt.e.stopPropagation();
		};

		// on click
		function clickHandler(opt: fabric.IEvent<MouseEvent>): void {
			const evt = opt.e;
			if (evt.ctrlKey === true) {
				this.isDragging = true;
				this.selection = false;
				this.lastPosX = evt.clientX;
				this.lastPosY = evt.clientY;
			}
		}

		// on dragging
		function dragHandler(opt: fabric.IEvent<MouseEvent>): void {
			if (this.isDragging) {
				var e = opt.e;
				var vpt = this.viewportTransform;
				vpt[4] += e.clientX - this.lastPosX;
				vpt[5] += e.clientY - this.lastPosY;

				// sync to cursor layout
				cursorLayerCanvas.viewportTransform = [...vpt];
				cursorLayerCanvas.renderAll();

				this.requestRenderAll();
				this.lastPosX = e.clientX;
				this.lastPosY = e.clientY;
			}
		}

		const emitCursorPosition = (cursorData) => {
			if (!socket) {
				return;
			}

			socket.emit('cursor-position', cursorData);
		};

		// move cursor => sync
		function onMouseMove(opt: fabric.IEvent<MouseEvent>) {
			if (!design || !currentUser) {
				return;
			}
			var zoom = canvas.current.getZoom();
			var viewportMatrix = canvas.current.viewportTransform;
			const pointer = canvas.current.getPointer(opt.e);

			const X = pointer.x;
			const Y = pointer.y;

			const { translateX: clientX, translateY: clientY } = fabric.util.qrDecompose([zoom, 0, 0, zoom, X, Y]);

			lastCursorPosition = {
				id: design.id,
				x: clientX,
				y: clientY,
				userId: currentUser.id,
				userName: currentUser.name,
				avatar: currentUser.avatar,
				matrix: [1, 0, 0, 1, X, Y],
			};
			if (emitCursor) {
				emitCursorPosition({
					id: design.id,
					x: clientX,
					y: clientY,
					userId: currentUser.id,
					userName: currentUser.name,
					avatar: currentUser.image,
				});
				emitCursor = false;

				if (publicRuntimeConfig.NODE_ENV === 'development') {
					console.log('sending-position');
				}

				setTimeout(() => {
					emitCursor = true;

					// this to make sure we send the latest position to other user
					emitCursorPosition(lastCursorPosition);
				}, 50);
			}
		}

		// on release click
		function releaseHandler(opt: fabric.IEvent<MouseEvent>): void {
			// on mouse up we want to recalculate new interaction
			// for all objects, so we call setViewportTransform
			this.setViewportTransform(this.viewportTransform);
			this.isDragging = false;
			this.selection = true;
		}

		// CUSTOM EVENT
		function onModifyObjectHistoryHandler(opt: any) {
			dispatch(
				saveHistory({
					old: opt.originals,
					new: opt.target,
				})
			);

			if (publicRuntimeConfig.NODE_ENV === 'development') {
				console.log('[x] Saved to history: ', {
					old: opt.originals,
					new: opt.target,
				});
			}
		}

		function onUpdateLayer(opt: any) {
			if (publicRuntimeConfig.NODE_ENV === 'development') {
				console.log('[x] Update layer: ', opt.target);
			}

			const newLayer = opt.target as fabric.Object[];
			const originals = opt.transform.originals as fabric.Object[];

			// sync to other clients
			const thumbnail = canvas.current.myExportData('png');

			// save to history
			if (originals) {
				dispatch(
					saveHistory({
						actionType: 'layer',
						old: originals,
						new: newLayer,
					})
				);
			}

			socket.emit('update-design-layer', {
				id: design.id,
				data: newLayer,
				objects: canvas.current.getAbsoluteObjects(),
				thumbnail,
				token,
				collection: 'design',
			});
		}

		function onUndoRedoObject(opt: any) {
			if (publicRuntimeConfig.NODE_ENV === 'development') {
				console.log('Sync update undo redo: ', opt);
			}

			const data = opt.target;

			// sync to other clients
			const thumbnail = canvas.current.myExportData('png');
			socket.emit('edit-design', {
				id: design.id,
				objects: canvas.current.getAbsoluteObjects(),
				data: data,
				thumbnail: thumbnail,
				token,
				collection: 'design',
			});
		}

		function onFlipImage(opt: fabric.IEvent) {
			const obj = opt.target;

			// save history to redux store
			if (opt.transform) {
				dispatch(
					saveHistory({
						old: opt.transform.originals,
						new: [
							{
								id: obj.id,
								flipX: obj.flipX,
								flipY: obj.flipY,
							},
						],
					})
				);
			}

			// sync to other clients
			const thumbnail = canvas.current.myExportData('png');
			socket.emit('edit-design', {
				id: design.id,
				data: [obj],
				objects: canvas.current.getAbsoluteObjects(),
				thumbnail,
				token,
				collection: 'design',
			});
		}

		canvas.current.on('object:added', onAddNewObjectHandler);
		canvas.current.on('object:moving', onMovingObjectHandler);
		canvas.current.on('object:modified', onModifyObjectHandler);
		canvas.current.on('object:removed', onRemoveObjectHandler);
		canvas.current.on('selection:updated', onSelectObjectHandler);
		canvas.current.on('selection:created', onSelectObjectHandler);
		canvas.current.on('selection:cleared', onDeselectObjectHandler);
		canvas.current.on('before:transform', onBeforeTransformObject);
		canvas.current.on('text:editing:exited', onChangeText);

		canvas.current.on('mouse:wheel', zoomHandler);
		canvas.current.on('mouse:down', clickHandler.bind(canvas.current));
		canvas.current.on('mouse:move', dragHandler.bind(canvas.current));
		canvas.current.on('mouse:move', onMouseMove);
		canvas.current.on('mouse:up', releaseHandler.bind(canvas.current));

		canvas.current.on('history:updated', onModifyObjectHistoryHandler);
		canvas.current.on('layer:updated', onUpdateLayer);
		canvas.current.on('object:undoredo', onUndoRedoObject);
		canvas.current.on('image:flip', onFlipImage);

		return () => {
			canvas.current.off('object:modified', onModifyObjectHandler);
			canvas.current.off('object:added', onAddNewObjectHandler);
			canvas.current.off('object:moving', onMovingObjectHandler);
			canvas.current.off('object:modified', onModifyObjectHandler);
			canvas.current.off('object:removed', onRemoveObjectHandler);
			canvas.current.off('mouse:move', onMouseMove);
			canvas.current.off('selection:updated', onSelectObjectHandler);
			canvas.current.off('selection:created', onSelectObjectHandler);
			canvas.current.off('selection:cleared', onDeselectObjectHandler);
			canvas.current.off('before:transform', onBeforeTransformObject);
			canvas.current.off('text:editing:exited', onChangeText);

			canvas.current.off('mouse:wheel', zoomHandler);
			canvas.current.off('mouse:down', clickHandler.bind(canvas.current));
			canvas.current.off('mouse:move', dragHandler.bind(canvas.current));
			canvas.current.off('mouse:up', releaseHandler.bind(canvas.current));

			canvas.current.off('history:modified', onModifyObjectHistoryHandler);
			canvas.current.off('layer:updated', onUpdateLayer);
			canvas.current.off('object:undoredo', onUndoRedoObject);
			canvas.current.off('image:flip', onFlipImage);
		};
	}, [canvas.current]);

	// loading elements in the first time
	useEffect(() => {
		if (!canvas.current || !design) {
			return;
		}
		if (design.objects) {
			fabric.util.enlivenObjects(
				design.objects,
				(enlivenedObjects: fabric.Object[]) => {
					enlivenedObjects.forEach((object) => {
						object.toJSON = (function (toJSON) {
							return function () {
								return fabric.util.object.extend(toJSON.call(this), {
									id: this.id,
									superType: this.superType,
								});
							};
						})(object.toJSON);

						if (object.superType === 'textbox') {
							loadAndUseFont(object.fontFamily, () => {
								canvas.current.add(object);
							});
						} else {
							canvas.current.add(object);
						}
					});
				},
				'fabric'
			);
		}
	}, [canvas, design]);

	// add background(product) to canvas
	const addBackground = () => {
		if (!canvas.current || !fabric || !cursorLayerCanvas) {
			return;
		}

		fabric.Image.fromURL(
			`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${design.product.image}?origin`,
			(image: fabric.Image) => {
				image.crossOrigin = 'anonymous';
				// let scaleX = canvas.current.getWidth() / image.width;
				// let scaleY = canvas.current.getHeight() / image.height;
				// if (image.height >= image.width) {
				// 	scaleX = scaleY;
				// 	if (canvas.current.getWidth() < image.width * scaleX) {
				// 		scaleX = scaleX * (canvas.current.getWidth() / (image.width * scaleX));
				// 	}
				// } else {
				// 	scaleY = scaleX;
				// 	if (canvas.current.getHeight() < image.height * scaleX) {
				// 		scaleX = scaleX * (canvas.current.getHeight() / (image.height * scaleX));
				// 	}
				// }

				const imageRatio = image.width / image.height;
				let scale = 1;
				if (image.width > image.height) {
					scale = 500 / image.width;
					canvas.current.setWidth(500).setHeight(500 / imageRatio);
				} else {
					scale = 500 / image.height;
					canvas.current.setHeight(500).setWidth(500 * imageRatio);
				}
				cursorLayerCanvas.setWidth(canvas.current.width).setHeight(canvas.current.height);
				cursorLayerCanvas.setDimensions({ width: canvas.current.width, height: canvas.current.height });

				canvas.current.setBackgroundImage(image, canvas.current.renderAll.bind(canvas.current));

				// canvas.current.setWidth(image.width).setHeight(image.height);
				// canvasWrapperRef.current.style.width = image.width;
				// canvasWrapperRef.current.style.height = image.height;
				// const zoomPoint = { x: canvas.current.getCenter().top, y: canvas.current.getCenter().left };
				canvas.current.zoomToPoint(new fabric.Point(image.top, image.left), scale);
				cursorLayerCanvas.zoomToPoint(new fabric.Point(image.top, image.left), scale);

				cursorLayerCanvas.renderAll();
				canvas.current.renderAll();

				fabric.Canvas.prototype.initZoom = scale;
			},
			{ crossOrigin: 'anonymous' }
		);
	};

	useEffect(() => {
		if (!currentUser || !design || !canvas) {
			return;
		}

		if (designPermission && designPermission.status === 'accepted' && designPermission.type === 'view') {
			fabric.Object.prototype.selectable = false;
			// fabric.Canvas.prototype.selection = false;
		}
	}, [currentUser, designPermission, design, canvas]);

	// init editor canvas
	useEffect(() => {
		if (!canvas.current || !fabric || !design) {
			return;
		}

		initCustomMethods(canvas.current);

		// canvas.current.setWidth(canvas.current.wrapperEl.parentNode.offsetWidth);
		// canvas.current.setHeight(canvas.current.wrapperEl.parentNode.offsetHeight);

		addBackground();

		fabric.Object.prototype.borderColor = '#7d2ae8';
		fabric.Object.prototype.cornerColor = '#ffffff';
		fabric.Object.prototype.cornerStyle = 'circle';
		fabric.Object.prototype.cornerStrokeColor = '#666';
		fabric.Object.prototype.transparentCorners = false;
		fabric.Object.prototype.centeredRotation = true;
		fabric.Object.prototype.strokeUniform = true;
		fabric.Object.prototype.noScaleCache = false;
		fabric.Path.prototype.originX = 'center';
		fabric.Path.prototype.originY = 'center';
		fabric.ActiveSelection.prototype.originX = 'center';
		fabric.ActiveSelection.prototype.originY = 'center';
		fabric.Group.prototype.originX = 'center';
		fabric.Group.prototype.originY = 'center';
		fabric.Textbox.prototype.fontFamily = 'Roboto';
		// this code help to keep custom attributes when grouping, loading from JSON
		fabric.Object.prototype.toObject = (function (toObject) {
			return function (propertiesToInclude) {
				const objectData = toObject.call(this, propertiesToInclude);
				const customAttributes = {
					id: this.id || '',
					superType: this.superType || '',
					removed: this.removed || '',
					undo: this.undo || '',
				};

				return fabric.util.object.extend(objectData, customAttributes);
			};
		})(fabric.Object.prototype.toObject);

		// Custom rotation
		const originalControl = fabric.Object.prototype.controls.mtr;

		var rotateIcon =
			'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTEyIDZ2M2w0LTQtNC00djNjLTQuNDIgMC04IDMuNTgtOCA4IDAgMS41Ny40NiAzLjAzIDEuMjQgNC4yNkw2LjcgMTQuOGMtLjQ1LS44My0uNy0xLjc5LS43LTIuOCAwLTMuMzEgMi42OS02IDYtNnptNi43NiAxLjc0TDE3LjMgOS4yYy40NC44NC43IDEuNzkuNyAyLjggMCAzLjMxLTIuNjkgNi02IDZ2LTNsLTQgNCA0IDR2LTNjNC40MiAwIDgtMy41OCA4LTggMC0xLjU3LS40Ni0zLjAzLTEuMjQtNC4yNnoiLz48L3N2Zz4=';
		var img = document.createElement('img');
		img.src = rotateIcon;

		const customRotation = new fabric.Control({
			x: 0,
			y: -0.5,
			offsetY: -25,
			cursorStyle: 'crosshair',
			actionHandler: fabric.controlsUtils.rotationWithSnapping,
			actionName: 'rotate',
			render: renderIcon,
			cornerSize: 28,
			withConnection: false,
		});
		fabric.Object.prototype.controls.mtr = customRotation;
		fabric.Textbox.prototype.controls.mtr = customRotation;

		// here's where the render action for the control is defined
		function renderIcon(
			ctx: CanvasRenderingContext2D,
			left: number,
			top: number,
			styleOverride: any,
			fabricObject: fabric.Object
		) {
			var size = 20;
			ctx.save();
			ctx.translate(left, top);
			ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
			ctx.drawImage(img, -size / 2, -size / 2, size, size);
			ctx.restore();
		}

		// const resizeObserver = initResizeObserver();

		return () => {
			// resizeObserver.disconnect();
		};
	}, [design]);

	// TODO: Handler resize for responsive canvas
	const initResizeObserver = (): ResizeObserver => {
		if (!canvas.current) {
			return;
		}

		const canvasParent = canvas.current.wrapperEl.parentNode;
		if (!canvasParent) {
			return;
		}

		const resizeObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
			let { width = 0, height = 0 } = (entries[0] && entries[0].contentRect) || {};

			width = Math.max(width, 100);
			height = Math.max(height, 100);

			canvas.current.setWidth(width).setHeight(height);

			let imageBackground: fabric.Image = canvas.current.backgroundImage as fabric.Image;
			if (imageBackground) {
				let scaleX = width / imageBackground.width;
				let scaleY = height / imageBackground.height;
				if (imageBackground.height >= imageBackground.width) {
					scaleX = scaleY;
					if (canvas.current.getWidth() < imageBackground.width * scaleX) {
						scaleX = scaleX * (canvas.current.getWidth() / (imageBackground.width * scaleX));
					}
				} else {
					scaleY = scaleX;
					if (canvas.current.getHeight() < imageBackground.height * scaleX) {
						scaleX = scaleX * (canvas.current.getHeight() / (imageBackground.height * scaleX));
					}
				}

				canvas.current.zoomToPoint(new fabric.Point(imageBackground.left, imageBackground.top), scaleX);
				canvas.current.renderAll();
			}
		});
		resizeObserver.observe(canvasParent);

		return resizeObserver;
	};

	return (
		<Box
			sx={{ ':hover': { outline: '2px solid green' }, position: 'relative' }}
			tabIndex={0}
			onKeyUp={handleOnKeyUp}
			onKeyDown={handleOnKeyDown}
		>
			<canvas id='canvas' ref={fabricRef} style={{ zIndex: 1 }}></canvas>
			<canvas id='canvas-cursor'></canvas>

			<Box sx={{ position: 'absolute', left: '-100px', bottom: 10 }}>
				<Tooltip title='Reset to initial position'>
					<IconButton
						onClick={() =>
							canvas.current.resetPosition(() => {
								const zoom = canvas.current.initZoom || 1;
								cursorLayerCanvas.viewportTransform = [zoom, 0, 0, zoom, 0, 0];

								cursorLayerCanvas.renderAll();
							})
						}
						size='large'
						color='primary'
					>
						<ControlCameraIcon fontSize='large' />
					</IconButton>
				</Tooltip>
			</Box>
		</Box>
	);
};

const useFabricCanvas = () => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);
	const fabricRef = useCallback((element) => {
		if (!element) {
			return canvas.current?.dispose();
		}

		canvas.current = new fabric.Canvas(element, {
			preserveObjectStacking: true,
		});
	}, []);

	return fabricRef;
};

export default Canvas;
export { useFabricCanvas, Canvas };
