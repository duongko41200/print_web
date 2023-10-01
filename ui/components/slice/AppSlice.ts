import { createSlice } from '@reduxjs/toolkit';

interface AppState {
	currentUser: any;
	design: any;
	designPermission: any;
	template: any;
	templatePermission: any;
}

const initialState: AppState = {
	currentUser: null,
	designPermission: null,
	design: null,
	template: null,
	templatePermission: null,
};

export const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		setCurrentUser: (state, action) => {
			const { payload } = action;
			state.currentUser = payload;
		},
		setDesignPermission: (state, action) => {
			const { payload } = action;
			state.designPermission = payload;
		},
		setDesign: (state, action) => {
			const { payload } = action;
			state.design = payload;
		},
		setTemplate: (state, action) => {
			const { payload } = action;
			state.template = payload;
		},
		setTemplatePermission: (state, action) => {
			const { payload } = action;
			state.templatePermission = payload;
		},
	},
});

export const { setCurrentUser, setDesignPermission, setDesign, setTemplate, setTemplatePermission } = appSlice.actions;

export default appSlice.reducer;
