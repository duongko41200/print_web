import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fabric } from 'fabric';
import { RootState } from '@store/store';

interface Action {
	actionType?: string;
	old: fabric.Object[];
	new: fabric.Object[];
}

interface HistoryState {
	past: Action[];
	future: Action[];
}

interface ActiveObjects {
	activeSelection?: fabric.ActiveSelection;
	objects: fabric.Object[] & fabric.Textbox[] & fabric.Path[] & fabric.Image[];
	group?: fabric.Group;
}
export type { ActiveObjects };

interface CanvasState {
	objectType: string;
	activeObjects: ActiveObjects;
	history: HistoryState;
}

const initialState: CanvasState = {
	objectType: null,
	activeObjects: null,
	history: {
		past: [],
		future: [],
	},
};

export const undo = createAsyncThunk('canvas/undo', async (data: any, { getState }) => {
	const state = getState() as RootState;
	const present = state.canvas.history.past[state.canvas.history.past.length - 1];
	
	data.callback(present);

	return present;
});

export const redo = createAsyncThunk('canvas/redo', async (data: any, { getState }) => {
	const state = getState() as RootState;
	const present = state.canvas.history.future[state.canvas.history.future.length - 1];
	
	data.callback(present);

	return present;
});

export const saveHistory = createAsyncThunk('canvas/saveHistory', async (data: any, { getState }) => {
	if (!data.actionType) {
		data.actionType = 'object';
	}

	return data;
});

export const canvasSlice = createSlice({
	name: 'canvas',
	initialState,
	reducers: {
		setObjectType: (state, action) => {
			const { payload } = action;
			state.objectType = payload;
		},

		setActiveObjects: (state, action) => {
			const { payload } = action;
			state.activeObjects = payload;
		},

		removeActive: (state) => {
			state.activeObjects = null;
			state.objectType = null;
		},
	},
	// MYNOTE: all the side effect mutation of state should be put here
	extraReducers: (builder) => {
		builder
			.addCase(undo.fulfilled, (state, action) => {
				state.history.past.pop();
				state.history.future.push(action.payload);
			})
			.addCase(redo.fulfilled, (state, action) => {
				state.history.future.pop();
				state.history.past.push(action.payload);
			})
			.addCase(saveHistory.fulfilled, (state, action) => {
				state.history.past.push(action.payload);
				state.history.future = [];
			});
	},
});

export const { setObjectType, setActiveObjects, removeActive } = canvasSlice.actions;

export default canvasSlice.reducer;
