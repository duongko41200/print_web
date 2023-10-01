import React, { useContext, useCallback, useEffect, RefObject } from 'react';
import { fabric } from 'fabric';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import { Socket } from 'socket.io-client';

import ControlCameraIcon from '@mui/icons-material/ControlCamera';
import { IconButton, Tooltip } from '@mui/material';
import FabricCanvasContext from '@components/canvas/CanvasContext';
import { Box } from 'theme-ui';

import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setObjectType, saveHistory, setActiveObjects, ActiveObjects, removeActive } from '../CanvasSlice';
import { updateTemplate } from 'services/dbhandler';
import { initCustomMethods } from '@utils/canvas/canvas';
import { loadAndUseFont } from '@utils/canvas/handler';
import { getAuthTokenFromCookie } from '@utils/cookie';
import { SocketContext } from '@pages/templates/[templateId]';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

interface CanvasProps {}

const Canvas: React.FC<CanvasProps> = ({}) => {
	const fabricRef = useFabricCanvas();
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);
	const dispatch = useAppDispatch();

	const socket: Socket = useContext(SocketContext);
	const currentUser = useAppSelector((state) => state.app.currentUser);
	const template = useAppSelector((state) => state.app.template);
	const token = getAuthTokenFromCookie();

	useEffect(() => {
		// update immediately when user leave
		async function handleBeforeUnload() {
			if (!template || !canvas.current) {
				return;
			}
			await updateTemplate(template.id, { elements: canvas.current.getAbsoluteObjects() });
		}

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	// loading elements in the first time
	useEffect(() => {
		if (!canvas.current || !template) {
			return;
		}
		if (template.objects) {
			fabric.util.enlivenObjects(
				template.objects,
				(enlivenedObjects: fabric.Object[]) => {
					enlivenedObjects.forEach((object) => {
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
	}, [canvas.current, template]);

	// keyboard event listener
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

	const handleOnKeyUp = async (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!canvas.current) {
			return;
		}

		if ((e.key === 's' || e.key === 'S') && e.ctrlKey) {
			e.preventDefault();

			const thumbnail = canvas.current.myExportData('png');
			await updateTemplate(
				template.id,
				{ objects: canvas.current.getAbsoluteObjects(), thumbnail },
				() => toast.success('Save data successfully'),
				(err) => toast.error(err.response.data.message)
			);
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

	// Set socket and canvas event lister
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

				// autosave
				const thumbnail = canvas.current.myExportData('png');
				socket.emit('edit-template', {
					id: template.id,
					objects: canvas.current.getAbsoluteObjects(),
					thumbnail,
					token,
					collection: 'template',
				});
			}
		}

		function onBeforeTransformObject(opt: fabric.IEvent): void {
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
			if (publicRuntimeConfig.NODE_ENV === 'development'){
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

			// autosave
			const thumbnail = canvas.current.myExportData('png');
			socket.emit('edit-template', {
				id: template.id,
				objects: canvas.current.getAbsoluteObjects(),
				thumbnail,
				token,
				collection: 'template',
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

			// autosave
			const thumbnail = canvas.current.myExportData('png');
			socket.emit('edit-template', {
				id: template.id,
				objects: canvas.current.getAbsoluteObjects(),
				thumbnail,
				token,
				collection: 'template',
			});
		}

		function onRemoveObjectHandler(opt: fabric.IEvent): void {
			if (publicRuntimeConfig.NODE_ENV === 'development'){
				console.log('[x] Object removed: ', opt.target);
			}

			const obj = opt.target;
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

			// autosave
			const thumbnail = canvas.current.myExportData('png');
			socket.emit('edit-template', {
				id: template.id,
				objects: canvas.current.getAbsoluteObjects(),
				thumbnail,
				token,
				collection: 'template',
			});
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
			if (zoom > 5) zoom = 5;
			if (zoom < 0.5) zoom = 0.5;

			canvas.current.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

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
				this.requestRenderAll();
				this.lastPosX = e.clientX;
				this.lastPosY = e.clientY;
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

			if (publicRuntimeConfig.NODE_ENV === 'development'){
				console.log('[x] Saved to history: ', {
					old: opt.originals,
					new: opt.target,
				});
			}
		}

		function onUpdateLayer(opt: any) {
			if (publicRuntimeConfig.NODE_ENV === 'development'){
				console.log('[x] Update layer: ', opt.target);
			}

			const newLayer = opt.target as fabric.Object[];
			const originals = opt.transform.originals as fabric.Object[];

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

			// autosave
			const thumbnail = canvas.current.myExportData('png');
			socket.emit('edit-template', {
				id: template.id,
				objects: canvas.current.getAbsoluteObjects(),
				thumbnail,
				token,
				collection: 'template',
			});
		}

		canvas.current.on('object:added', onAddNewObjectHandler);
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
		canvas.current.on('mouse:up', releaseHandler.bind(canvas.current));

		canvas.current.on('history:updated', onModifyObjectHistoryHandler);
		canvas.current.on('layer:updated', onUpdateLayer);

		return () => {
			canvas.current.off('object:modified', onModifyObjectHandler);
			canvas.current.off('object:added', onAddNewObjectHandler);
			canvas.current.off('object:modified', onModifyObjectHandler);
			canvas.current.off('object:removed', onRemoveObjectHandler);
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
		};
	}, [canvas.current]);

	// init editor canvas
	useEffect(() => {
		if (!canvas.current || !fabric) {
			return;
		}

		initCustomMethods(canvas.current);

		if (currentUser.id != template.user.id) {
			fabric.Object.prototype.selectable = false;
		}

		canvas.current.setWidth(canvas.current.wrapperEl.parentNode.offsetWidth);
		canvas.current.setHeight(canvas.current.wrapperEl.parentNode.offsetHeight);
		canvas.current.backgroundColor = '#fff';

		if (template.type === 'landscape') {
			canvas.current.setWidth(500).setHeight(300);
		} else if (template.type === 'portrait') {
			canvas.current.setWidth(300).setHeight(500);
		} else {
			canvas.current.setWidth(500).setHeight(500);
		}

		// canvas.current.setDimensions({width: 1, height: 1}, {cssOnly: true});
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
	}, [canvas.current]);

	return (
		<Box
			sx={{ ':hover': { outline: '2px solid green' }, position: 'relative' }}
			tabIndex={0}
			onKeyUp={handleOnKeyUp}
			onKeyDown={handleOnKeyDown}
		>
			<canvas id='canvas' ref={fabricRef}></canvas>

			<Box sx={{ position: 'absolute', left: '-100px', bottom: 10 }}>
				<Tooltip title='Reset to initial position'>
					<IconButton onClick={() => canvas.current.resetPosition()} size='large' color='primary'>
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
			backgroundColor: '#fff',
			preserveObjectStacking: true,
			width: 500,
			height: 450,
		});
	}, []);

	return fabricRef;
};

export default Canvas;
export { useFabricCanvas, Canvas };
