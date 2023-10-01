import React from 'react';

import { Box } from 'theme-ui';
import { Typography } from 'antd';

import ProtectedPage from '@components/auth/ProtectedPage';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import GeneralLayout from '@layouts/general/GeneralLayout';
import AccountsTable from '@components/table/AccountsTable';
import AdminPage from '@components/auth/AdminPage';

const {Title} = Typography;

interface AccountsProps {

}


const Accounts:React.FC<AccountsProps> = ({}) => {
	return (
		<ProtectedPage>
			<AdminPage>
				<GeneralLayout>
					<Box className='content-header'>
						<Title>Accounts management</Title>
					</Box>

					<Box className='accounts-table'>
						<AccountsTable />
					</Box>
				</GeneralLayout>
			</AdminPage>
		</ProtectedPage>
	)
}


export default ProtectedRoute(Accounts);