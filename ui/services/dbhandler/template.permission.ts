import axios from 'axios';
import { getAuthTokenFromCookie } from 'utils/cookie';
import { fetchAuthData } from './fetchData';

import getConfig from 'next/config';
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

export async function createTemplatePermission(
	data: any,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	try {
		const token = getAuthTokenFromCookie();

		const url = `${publicRuntimeConfig.API_URL}/api/v1/templatepermissions`;
		const res = await axios.post(url, data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (res.data.status === 'success') {
			if (onSuccess) {
				onSuccess(res.data);
			}
			return res.data.data;
		}

		return null;
	} catch (err) {
		console.log(err);
		if (onError) {
			onError(err);
		}
	}
}

export async function updateTemplatePermission(
	id: string,
	data: any,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	try {
		const token = getAuthTokenFromCookie();

		const url = `${publicRuntimeConfig.API_URL}/api/v1/templatepermissions/${id}`;
		const res = await axios.patch(url, data, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (res.data.status === 'success') {
			onSuccess && onSuccess(res.data);
			return res.data.data;
		}

		return null;
	} catch (err) {
		console.error(err);
		onError && onError(err);
	}
}

export async function getPermissionsInTemplate(
	id: string,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	try {
		const token = getAuthTokenFromCookie();

		const url = `${publicRuntimeConfig.API_URL}/api/v1/templates/${id}/permissions`;
		const res = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (res.data.status === 'success') {
			if (onSuccess) {
				onSuccess(res.data);
			}
			return res.data.data;
		}

		return null;
	} catch (err) {
		console.log(err);
		if (onError) {
			onError(err);
		}
	}
}

export async function getTemplatePermissionByToken(
	token: string,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	try {
		const authToken = getAuthTokenFromCookie();

		const url = `${publicRuntimeConfig.API_URL}/api/v1/templatepermissions/token/${token}`;
		const res = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		});

		if (res.data.status === 'success') {
			onSuccess && onSuccess(res.data);
			return res.data.data;
		}

		return null;
	} catch (err) {
		console.log(err);
		onError && onError(err);
	}
}

export async function updateTemplatePermissionByToken(
	token: string,
	data: any,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	try {
		const authToken = getAuthTokenFromCookie();

		const url = `${publicRuntimeConfig.API_URL}/api/v1/templatepermissions/token/${token}`;
		const res = await axios.patch(url, data, {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		});

		if (res.data.status === 'success') {
			onSuccess && onSuccess(res.data);
			return res.data.data;
		}

		return null;
	} catch (err) {
		console.log(err);
		onError && onError(err);
	}
}

export async function getTemplatePermission(
	templateId: string,
	userId: string,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/templatepermissions/one/${templateId}/${userId}`;
	return fetchAuthData(url, 'get', null, onSuccess, onError);
}
