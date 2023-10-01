/**
 * @brief Home page
 */

import React from 'react';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '@mui/material';
import GeneralLayout from '@layouts/general/GeneralLayout';
import Banner from '@components/banner/Banner';
import PageSection from '@components/section/PageSection';

import ProtectedRoute from '@components/auth/ProtectedRoute';
import { useAppSelector } from '@store/hooks';
import ProtectedPage from '@components/auth/ProtectedPage';

interface indexProps {}

const Home: React.FC<indexProps> = ({}) => {
	const currentUser = useAppSelector((state) => state.app.currentUser);
	if (!currentUser) {
		return <>...</>;
	}

	return (
		<ProtectedPage>
			<GeneralLayout>
				<Banner />

				<PageSection
					title='Popular products'
					type = 'products'
					imageField='thumbnail'
				/>

				<PageSection
					title='Recent Designs'
					type = 'designs'
					imageField='thumbnail'
				/>

				<PageSection
					title='Hot templates'
					type = 'templates'
					imageField='thumbnail'
				/>
			</GeneralLayout>
		</ProtectedPage>
	);
};

export default ProtectedRoute(Home);
