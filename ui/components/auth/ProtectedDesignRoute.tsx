// components/ProtectedRoute.js
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setDesign, setDesignPermission } from '../slice/AppSlice';
import { getDesign, getDesignPermission } from 'services/dbhandler';

const ProtectedDesignRoute = (WrappedComponent: React.FC) => {
	const WithProtectedRoute = (props: any) => {
		const router = useRouter();
		const dispatch = useAppDispatch();

		const currentUser = useAppSelector((state) => state.app.currentUser);

		const fetchData = async () => {
			try {
				const design = await getDesign(router.query.designId as string);
				dispatch(setDesign(design));

				const designPermission = await getDesignPermission(design.id, currentUser.id);
				dispatch(setDesignPermission(designPermission))
			} catch (err) {
				router.push('/error?message=authorization' )
			}
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


export default ProtectedDesignRoute;
