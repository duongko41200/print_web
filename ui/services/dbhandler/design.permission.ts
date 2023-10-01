import { fetchAuthData } from './fetchData';

import getConfig from 'next/config';
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

export async function createDesignPermission(data: any, onSuccess?: (data: any) => void, onError?: (err: any) => void) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designpermissions`;

	return await fetchAuthData(url, 'post', data, onSuccess, onError);
}

export async function updateDesignPermission(
	id: string,
	data: any,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designpermissions/${id}`;
	return await fetchAuthData(url, 'patch', data, onSuccess, onError);
}

export async function getPermissionsInDesign(
	id: string,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designs/${id}/permissions`;
	return await fetchAuthData(url, 'get', null, onSuccess, onError);
}

export async function getDesignPermissionByToken(
	token: string,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designpermissions/token/${token}`;
	return await fetchAuthData(url, 'get', null, onSuccess, onError);
}

export async function updateDesignPermissionByToken(
	token: string,
	data: any,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designpermissions/token/${token}`;
	return await fetchAuthData(url, 'patch', data, onSuccess, onError);
}

export async function getDesignPermission(
	designId: string,
	userId: string,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designpermissions/one/${designId}/${userId}`;
	return fetchAuthData(url, 'get', null, onSuccess, onError);
}
