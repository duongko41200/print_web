import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import {  SettingOutlined } from '@ant-design/icons';
import { Flex, Box, Grid } from 'theme-ui';
import { Avatar, Pagination, Dropdown, MenuProps, Modal } from 'antd';

import AppEmpty from '@components/empty/AppEmpty';
import CustomCard from '@components/card/Card';

import { TabContentProps } from './TabContentProps';
import { getAuthTokenFromCookie } from '@utils/cookie';
import { useAppSelector } from '@store/hooks';
import Link from 'next/link';
import { CModalBody } from '@coreui/react';
import EditDesignForm from '@components/form/EditDesignForm';
import { deleteDesign } from 'services/dbhandler';
import { useRouter } from 'next/navigation';

import getConfig from 'next/config';
import { confirmAlert } from 'react-confirm-alert';
import { getImageUrl } from '@utils/user';
const {  publicRuntimeConfig } = getConfig();

const DesignsTab: React.FC<TabContentProps> = ({ filters, tabKey }) => {
	const [designs, setDesigns] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState<number>(1);
	const [loading, setLoading] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedDesign, setSelectedDesign] = useState<any>(null);

	const currentUser = useAppSelector((state) => state.app.currentUser);
	const router = useRouter();

	const fetchData = async (curPage?: number) => {
		setLoading(true);
		const response = await getData(filters, {
			page: curPage || page,
		});
		setDesigns(response.data || []);
		setTotal(response.total);
		setLoading(false);
	};

	// fetch right data when tab is changed
	useEffect(() => {
		if (tabKey !== '1') {
			return;
		}

		fetchData(1);
		setPage(1);
	}, [filters]);

	let Designs: React.ReactNode;
	if (!designs || designs.length === 0) {
		Designs = <AppEmpty title='No designs' />;
	} else {
		Designs = (
			<Flex
				sx={{
					alignItems: 'center',
					flexDirection: 'column',
					rowGap: 30,
				}}
			>
				<Grid sx={{ gridTemplateColumns: '1fr 1fr 1fr', width: '100%' }}>
					{designs.map((el, index) => {
						const items: MenuProps['items'] = [
							{
								key: '1',
								label: (
									<Link
										style={{ textDecoration: 'none', color: 'inherit' }}
										href={`/designs/${el.id}`}
									>
										View
									</Link>
								),
							},
							{
								key: '2',
								label: (
									<Box
										onClick={() => {
											setSelectedDesign(el);
											setShowEditModal(true);
										}}
									>
										Edit
									</Box>
								),
								disabled: currentUser.id != el.user.id,
							},
							{
								key: '3',
								danger: true,
								label: (
									<Box
										onClick={() => {
											confirmAlert({
												title: 'Delete design',
												message: 'Confirm to delete this design? This can not be undone!',
												buttons: [
													{
														label: 'Cancel',
														onClick: () => {},
													},
													{
														label: 'Confirm',
														onClick: async () => {
															await deleteDesign(
																el.id,
																() =>
																	toast.success('Delete successfully', {
																		onClose: () => router.refresh(),
																	}),
																(err) => toast.error(err.response.data.message)
															);
														},
													},
												],
											});
										}}
									>
										Delete
									</Box>
								),
								disabled: currentUser.id != el.user.id,
							},
						];

						return (
							<Box key={index}>
								<CustomCard
									href={`/designs/${el.id}`}
									title={el.name}
									description={el.description || '...'}
									imageUrl={
										el.thumbnail
											? `${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${el.thumbnail}?origin=${Date.now()}`
											: `${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${el.product.thumbnail}`
									}
									actions={[
										<Dropdown placement='bottom' menu={{ items }}>
											<SettingOutlined key='setting' />
										</Dropdown>,
									]}
									avatar={
										<Avatar src={getImageUrl(el.user)} />
									}
								/>
							</Box>
						);
					})}
				</Grid>

				<Box padding='20px 0'>
					<Pagination
						current={page}
						total={total}
						pageSize={9}
						onChange={(page, size) => {
							setPage(page);
							fetchData(page);
						}}
					/>
				</Box>

				<Modal
					title='Edit product'
					open={showEditModal}
					onCancel={() => {
						setShowEditModal(false);
						setSelectedDesign(null);
					}}
					footer={null}
				>
					<CModalBody>{selectedDesign && <EditDesignForm design={selectedDesign} />}</CModalBody>
				</Modal>
			</Flex>
		);
	}

	return <>{loading ? <div>Loading data</div> : Designs}</>;
};

async function getData(filters: any, options: { page: number }) {
	try {
		const token = getAuthTokenFromCookie();
		const baseURL = `${publicRuntimeConfig.API_URL}/api/v1`;
		let apiPath = '/designs/mines';
		let params: any = { page: options.page, limit: 9 };

		if (filters.type === 'mines') {
			apiPath = '/designs/mines';
		}
		if (filters.type === 'shared') {
			apiPath = '/designs/shared';
		}

		if (filters.product !== 'all' && filters.product) {
			params.product = filters.product;
		}

		if (filters.sort === 'last_created') {
			params.sort = '-createdAt';
		}

		if (filters.sort === 'last_updated') {
			params.sort = '-updatedAt';
		}

		if (filters.sort === 'first_created') {
			params.sort = 'createdAt';
		}

		const url = baseURL + apiPath;

		const res = await axios.get(url, {
			params,
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (res.data.status === 'success') {
			return res.data;
		}
	} catch (err) {
		toast.error(err.response?.data?.message || 'Error fetching Designs');
	}
}

export default DesignsTab;
