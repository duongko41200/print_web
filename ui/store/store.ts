import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import canvasSliceReducer from '@components/canvas/CanvasSlice';
import CursorSliceReducer from '@components/canvas/design/CursorSlice';
import appSliceReducer from '@components/slice/AppSlice';

export const store = configureStore({
	reducer: {
		canvas: canvasSliceReducer,
		cursor: CursorSliceReducer,
		app: appSliceReducer
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
