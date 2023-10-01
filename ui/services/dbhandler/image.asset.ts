import { fetchAuthData } from './fetchData';

import getConfig from 'next/config';
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

export async function deleteImageAsset(
	id: string,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<Array<any>> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/imageassets/${id}`;
	return fetchAuthData(url, 'delete', null, onSuccess, onError);
}

export async function updateImageAsset(
	id: string,
	data:any,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<Array<any>> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/imageassets/${id}`;
	return fetchAuthData(url, 'patch', data, onSuccess, onError);
}

export async function createImageAsset(
	data: any,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<Array<any>> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/imageassets`;
	return fetchAuthData(url, 'post', data, onSuccess, onError);
}

export async function getMyImageAssets(
	query?: any,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<Array<any>> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/imageassets`;
	return fetchAuthData(url, 'get', query, onSuccess, onError);
}