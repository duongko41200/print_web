import React, {RefObject, useContext} from 'react';
import { Flex, Box } from 'theme-ui';
import { Button } from '@mui/material';
import {
	CDropdown,
	CDropdownToggle,
	CDropdownMenu,
	CDropdownItem,
} from '@coreui/react';
import UndoRedo from './UndoRedo';

import FabricCanvasContext from '../canvas/CanvasContext';

interface ToolbarProps {}

const Toolbar: React.FC<ToolbarProps> = ({}) => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const onResetPosition = () => {
		canvas.current.viewportTransform = [1, 0, 0, 1, 0, 0];
		canvas.current.renderAll();
	};
	const onExport = () => {
		let image = new Image();
		image.crossOrigin = 'anonymous';
		image.src = canvas.current.myExportData('png');
		let w = window.open('');
		w.document.write(image.outerHTML);
	};
	function exportCanvasAsSVG() {
		// Export the canvas as SVG
		const svgData = canvas.current.myExportData('svg');

		// Create a download link for the SVG file
		const downloadLink = document.createElement('a');
		downloadLink.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
			svgData
		)}`;
		downloadLink.download = 'canvas.svg';
		downloadLink.click();
	}

	function exportCanvasAsJSON() {
		// Export the canvas as JSON
		const jsonData = JSON.stringify(canvas.current.myExportData('json'), null, 2);

		// Create a download link for the JSON file
		const downloadLink = document.createElement('a');
		downloadLink.href = `data:text/json;charset=utf-8,${encodeURIComponent(
			jsonData
		)}`;
		downloadLink.download = 'canvas.json';
		downloadLink.click();
	}

	// NOTE: this should be put in menu context
	function handleGroup() {
		const activeSelection =
			canvas.current.getActiveObject() as fabric.ActiveSelection;
		if (!activeSelection || activeSelection.type !== 'activeSelection') {
			return;
		}

		activeSelection.toGroup();
		canvas.current.requestRenderAll();
	}

	function handleUngroup() {
		const activeSelection =
			canvas.current.getActiveObject() as fabric.ActiveSelection;
		if (!activeSelection || activeSelection.type !== 'group') {
			return;
		}

		const group = activeSelection.toActiveSelection();
		if (group.id) {
			delete group.id;
		}
		canvas.current.requestRenderAll();
	}

	return (
		<Flex sx={{
			alignItems: 'center',
			justifyContent: 'space-between'
		}}>
			<Box>
				<UndoRedo />
			</Box>

			<Box>
				<CDropdown autoClose='outside'>
					<CDropdownToggle color='light'>Group</CDropdownToggle>

					<CDropdownMenu>
						<CDropdownItem
							onClick={handleGroup}
							style={{
								color: '#000',
							}}
						>
							Group
						</CDropdownItem>

						<CDropdownItem
							onClick={handleUngroup}
							style={{
								color: '#000',
							}}
						>
							Ungroup
						</CDropdownItem>
					</CDropdownMenu>
				</CDropdown>
			</Box>

			<Box>
				<CDropdown autoClose='outside'>
					<CDropdownToggle color='light'>Export</CDropdownToggle>

					<CDropdownMenu>
						<CDropdownItem
							onClick={onExport}
							style={{
								color: '#000',
							}}
						>
							Download PNG Image
						</CDropdownItem>

						<CDropdownItem
							onClick={exportCanvasAsSVG}
							style={{
								color: '#000',
							}}
						>
							Download SVG
						</CDropdownItem>

						<CDropdownItem
							onClick={exportCanvasAsJSON}
							style={{
								color: '#000',
							}}
						>
							Download JSON
						</CDropdownItem>

						<CDropdownItem
							onClick={onResetPosition}
							style={{
								color: '#000',
							}}
						>
							Reset position
						</CDropdownItem>
					</CDropdownMenu>
				</CDropdown>
			</Box>

			<Box padding='0 10px'>
				<Button
					variant='outlined'
					color='error'
					onClick={() => {
						canvas.current.remove(...canvas.current.getObjects());
						canvas.current.requestRenderAll();
					}}
				>
					Remove all
				</Button>
			</Box>
		</Flex>
	);
};

export default Toolbar;
