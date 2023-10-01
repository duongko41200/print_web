import React from 'react';

import { Flex, Box } from 'theme-ui';
import { Typography, Button } from 'antd';
import AddIcon from '@mui/icons-material/Add';

import ProtectedPage from '@components/auth/ProtectedPage';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import GeneralLayout from '@layouts/general/GeneralLayout';
import AdminPage from '@components/auth/AdminPage';
import ProductsTable from '@components/table/ProductsTable';
import UploadProductDialog from '@components/dialog/UploadProductDialog';

const { Title } = Typography;

interface ProductsProps {}

const Products: React.FC<ProductsProps> = ({}) => {
	return (
		<ProtectedPage>
			<AdminPage>
				<GeneralLayout>
					<Flex className='content-header' sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
						<Box>
							<Title>Products management</Title>
						</Box>

						<Box>
							<UploadProductDialog />
						</Box>
					</Flex>

					<Box className='accounts-table'>
						<ProductsTable />
					</Box>
				</GeneralLayout>
			</AdminPage>
		</ProtectedPage>
	);
};

export default ProtectedRoute(Products);
