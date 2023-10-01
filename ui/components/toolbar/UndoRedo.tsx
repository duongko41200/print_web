import React, { useContext, RefObject } from 'react';
import { connect } from 'react-redux';
import { fabric } from 'fabric';

import { ButtonGroup, Button } from '@mui/material';

import { RootState } from '@store/store';
import FabricCanvasContext from '../canvas/CanvasContext';

interface UndoRedoProps {
	canUndo: boolean;
	canRedo: boolean;
}

const UndoRedo: React.FC<UndoRedoProps> = ({ canUndo, canRedo }) => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	return (
		<ButtonGroup size='small'>
			<Button onClick={() => canvas.current.undo()} disabled={!canUndo}>
				Undo
			</Button>
			<Button onClick={() => canvas.current.redo()} disabled={!canRedo}>
				Redo
			</Button>
		</ButtonGroup>
	);
};

const mapStateToProps = (state: RootState) => {
	return {
		canUndo: state.canvas.history.past.length > 0,
		canRedo: state.canvas.history.future.length > 0,
	};
};

export default connect(mapStateToProps)(UndoRedo);
