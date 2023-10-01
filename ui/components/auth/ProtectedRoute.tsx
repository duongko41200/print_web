// components/ProtectedRoute.js
import React, { useEffect } from 'react';
import { getAuthTokenFromCookie, removeAuthTokenCookie } from '../../utils/cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAppDispatch } from '@store/hooks';
import { setCurrentUser } from '@components/slice/AppSlice';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

const ProtectedRoute = (WrappedComponent: React.FC) => {
	const WithProtectedRoute = (props: any) => {
		const token = getAuthTokenFromCookie();
		const router = useRouter();
		const dispatch = useAppDispatch();

		const fetchData = async () => {
			if (token) {
				try {
					const currentUser = await fetchUserData(token);
					if (!currentUser) {
						toast.error('Something went wrong. Please log in again');
						removeAuthTokenCookie();
						router.push('/auth/login');
						return;
					}

					// Replace 'setUser' with your store action to set the current user
					dispatch(setCurrentUser(currentUser));

					return <WrappedComponent {...props} />;
				} catch (err) {
					console.log(err);
					toast.error(err.response?.data?.message || 'An error occurred.');
					removeAuthTokenCookie();
					router.push('/auth/login');
				}
			}
		};

		useEffect(() => {
			// Check if the token is not present and the router is ready
			if (!token) {
				toast('Please log in to continue');
				router.replace('/auth/login'); // Or replace with your login page URL
				return;
			}

			fetchData();
		}, []);

		// If the token is present or the router is not ready yet, render the component
		return <WrappedComponent {...props} />;
	};

	return WithProtectedRoute;
};

async function fetchUserData(token: string) {
	try {
		const url = `${publicRuntimeConfig.API_URL}/api/v1/users/token`;
		const res = await axios.post(url, {
			token,
		});

		if (res.data.status === 'success') {
			return res.data.data;
		}

		return null;
	} catch (err) {
		console.log(err);
		return null;
	}
}

export default ProtectedRoute;
