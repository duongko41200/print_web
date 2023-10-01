// components/ProtectedRoute.js
import axios from 'axios';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

import { useAppDispatch, useAppSelector } from '@store/hooks';
import { setTemplate, setTemplatePermission } from '../slice/AppSlice';
import { getTemplate, getTemplatePermission } from 'services/dbhandler';

const ProtectedTemplateRoute = (WrappedComponent: React.FC) => {
	const WithProtectedRoute = (props: any) => {
		const router = useRouter();
		const dispatch = useAppDispatch();

		const currentUser = useAppSelector((state) => state.app.currentUser);

		const fetchData = async () => {
			const template = await getTemplate(router.query.templateId as string, null, (err) =>
				router.push('/error?message=authorization')
			);

			if (template) {
				dispatch(setTemplate(template));
	
				const permission = await getTemplatePermission(template.id, currentUser.id);
				permission && dispatch(setTemplatePermission(permission));
			}

			return <WrappedComponent {...props} />;
		};

		useEffect(() => {
			if (!router.isReady || !currentUser) {
				return;
			}

			fetchData();
		}, [router.isReady, currentUser]);

		// If the token is present or the router is not ready yet, render the component
		return <WrappedComponent {...props} />;
	};

	return WithProtectedRoute;
};

export default ProtectedTemplateRoute;
