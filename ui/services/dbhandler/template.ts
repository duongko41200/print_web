import axios from 'axios';
import { getAuthTokenFromCookie } from 'utils/cookie';
import { fetchAuthData } from './fetchData';

import getConfig from 'next/config';
const {  publicRuntimeConfig } = getConfig()

export async function updateTemplate(
	id: string,
	data: any,
	onSuccess?: (data: any) => void,
	onError?: (err: any) => void
) {
	try {
		const token = getAuthTokenFromCookie();

		const url = `${publicRuntimeConfig.API_URL}/api/v1/templates/${id}`;
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

export async function getTemplate(id: string, onSuccess?: (data: any) => void, onError?: (error: any) => void) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/templates/${id}`;
	return fetchAuthData(url, 'get', null, onSuccess, onError);
}

export async function getTemplates(
	query?: { page?: number; limit?: number; sort?: string; q?: string },
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<Array<any>> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/templates`;
	return fetchAuthData(url, 'get', query, onSuccess, onError);
}

export async function cloneTemplate(id: string, onSuccess?: (data: any) => void, onError?: (error: any) => void) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/templates/${id}/clone`;
	return fetchAuthData(url, 'post', null, onSuccess, onError);
}

export async function searchMyTemplates(
	query: string,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/templates/mines/search`;
	return fetchAuthData(url, 'get', { q: query }, onSuccess, onError);
}

export async function deleteTemplate(
	id: string,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/templates/${id}`;
	return fetchAuthData(url, 'delete', null, onSuccess, onError);
}

export async function createTemplate(
	data?: any,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/templates`;
	return fetchAuthData(url, 'post', data, onSuccess, onError);
}

export async function updateTemplateNumUsed(
	id: string,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/templates/${id}/numUsed`;
	return fetchAuthData(url, 'patch', null, onSuccess, onError);
}