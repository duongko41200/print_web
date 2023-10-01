import { fetchAuthData } from "./fetchData";

import getConfig from 'next/config';
const { serverRuntimeConfig, publicRuntimeConfig } = getConfig()

export async function createDesignFromTemplate(
	id: string,
	data: any,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<Array<any>> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/templates/${id}/designs`;
	return fetchAuthData(url, 'post', data, onSuccess, onError);
}

export async function createDesignFromProduct(
	id: string,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<any> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designs/`;
	return fetchAuthData(url, 'post', {productId: id}, onSuccess, onError);
}

export async function searchMyDesigns(
	query: string,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<any> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designs/mines/search`;
	return fetchAuthData(url, 'get', {q: query}, onSuccess, onError);
}

export async function getAllDesigns(
	query: {page?:number, limit?:number, sort?:string},
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<any> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designs`;
	return fetchAuthData(url, 'get', query, onSuccess, onError);
}

export async function updateDesign(
	id: string,
	data: any,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<any> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designs/${id}`;
	return fetchAuthData(url, 'patch', data, onSuccess, onError);
}

export async function deleteDesign(
	id: string,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<any> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designs/${id}`;
	return fetchAuthData(url, 'delete', null, onSuccess, onError);
}

export async function getDesign(
	id: string,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<any> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/designs/${id}`;
	return fetchAuthData(url, 'get', null, onSuccess, onError);
}