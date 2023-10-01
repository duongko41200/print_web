/* src/CursorOverlay/cursorSlice.js */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	cursors: [],
};

const cursorSlice = createSlice({
	name: 'cursor',
	initialState,
	reducers: {
		updateCursorPosition: (state, action) => {
			const { id, x, y, userId, userName, avatar } = action.payload;

			const index = state.cursors.findIndex((c) => c.userId === userId);

			if (index !== -1) {
				state.cursors[index] = {
					userName,
					userId,
					x,
					y,
					avatar,
				};
			} else {
				state.cursors.push({
					id,
					userName,
					userId,
					x,
					y,
					avatar,
				});
			}
		},
		removeCursorPosition: (state, action) => {
			state.cursors = state.cursors.filter((c) => c.userId !== action.payload);
		},
	},
});

export const { updateCursorPosition, removeCursorPosition } = cursorSlice.actions;

export default cursorSlice.reducer;
