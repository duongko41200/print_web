import { fetchAuthData } from './fetchData';

import getConfig from 'next/config';
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

export async function getProducts(
	page?: number,
	limit?: number,
	sort?: string,
	query?: string,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<Array<any>> {
	const data = {
		page,
		limit,
		sort,
		q: query,
	};

	const url = `${publicRuntimeConfig.API_URL}/api/v1/products`;
	return fetchAuthData(url, 'get', data, onSuccess, onError);
}

export async function updateProduct(
	id: string,
	data: any,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/products/${id}`;
	return fetchAuthData(url, 'patch', data, onSuccess, onError);
}

export async function deleteProduct(
	id: string,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/products/${id}`;
	return fetchAuthData(url, 'delete', null, onSuccess, onError);
}

export async function getAllProducts(
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/products/list`;
	return fetchAuthData(url, 'get', null, onSuccess, onError);
}