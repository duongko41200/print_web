import axios from 'axios';
import { fetchAuthData } from './fetchData';
import { getAuthTokenFromCookie, removeAuthTokenCookie, setAuthTokenCookie } from 'utils/cookie';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

export async function getUsers(
	page?: number,
	limit?: number,
	sort?: string,
	filters?: any,
	query?: string,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
): Promise<Array<any>> {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/users`;
	if (!filters) filters = {};

	try {
		const token = getAuthTokenFromCookie();
		const res = await axios.post(
			url,
			{ filters },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
				params: {
					page,
					limit,
					sort,
					q: query,
				},
			}
		);

		if (res.data.status === 'success') {
			onSuccess && onSuccess(res.data);
			return res.data;
		}

		return null;
	} catch (err) {
		console.error(err);
		onError && onError(err);
	}
}

export async function updateUser(
	id: string,
	data: any,
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/users/${id}`;
	return fetchAuthData(url, 'patch', data, onSuccess, onError);
}

export async function updateMe(data: any, onSuccess?: (data: any) => void, onError?: (error: any) => void) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/users/me`;
	return fetchAuthData(url, 'patch', data, onSuccess, onError);
}

export async function updateMyPassword(data: any, onSuccess?: (data: any) => void, onError?: (error: any) => void) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/users/my-password`;
	return fetchAuthData(url, 'patch', data, onSuccess, onError);
}

export async function logout(onSuccess?: () => void, onError?: (error: any) => void) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/users/logout`;
	try {
		const res = await axios.get(url);

		if (res.data.status === 'success') {
			removeAuthTokenCookie();
			onSuccess && onSuccess();
		}
	} catch (err) {
		console.error(err);
		onError && onError(err);
	}
}

export async function login(
	data: { email: string; password: string },
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/users/login`;
	try {
		const res = await axios.post(url, data);

		if (res.data.status === 'success') {
			setAuthTokenCookie(res.data.token);
			onSuccess && onSuccess(res.data);
		}
	} catch (err) {
		console.error(err);
		onError && onError(err);
	}
}

export async function loginWithGoogle(
	onSuccess?: (data: any) => void,
	onError?: (error: any) => void
) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/auth/google`;
	try {
		const res = await axios.get(url);

		if (res.data.status === 'success') {
			setAuthTokenCookie(res.data.token);
			onSuccess && onSuccess(res.data);
		}
	} catch (err) {
		console.error(err);
		onError && onError(err);
	}
}

export async function signup(data: any, onSuccess?: (data: any) => void, onError?: (error: any) => void) {
	const url = `${publicRuntimeConfig.API_URL}/api/v1/users/signup`;
	try {
		const res = await axios.post(url, data);

		if (res.data.status === 'success') {
			setAuthTokenCookie(res.data.token);
			onSuccess && onSuccess(res.data);
		}
	} catch (err) {
		console.error(err);
		onError && onError(err);
	}
}
