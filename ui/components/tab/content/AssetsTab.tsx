import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Modal } from 'antd';
import { CModalBody } from '@coreui/react';
import { Flex, Box, Grid } from 'theme-ui';
import CustomCard from '@components/card/Card';
import { SettingOutlined } from '@ant-design/icons';
import { TabContentProps } from './TabContentProps';
import AppEmpty from '@components/empty/AppEmpty';
import { MenuProps, Pagination, Dropdown } from 'antd';
import { deleteImageAsset } from 'services/dbhandler';
import { getAuthTokenFromCookie } from '@utils/cookie';
import { useAppSelector } from '@store/hooks';
import EditImageAsset from '@components/form/EditImageAssetForm';

import getConfig from 'next/config';
import { confirmAlert } from 'react-confirm-alert';
const { publicRuntimeConfig } = getConfig();

dayjs.extend(relativeTime);

const AssetsTab: React.FC<TabContentProps> = ({ filters, tabKey }) => {
	const [assets, setAssets] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState<number>(1);
	const [loading, setLoading] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedImageAsset, setSelectedImageAsset] = useState<any>(null);

	const router = useRouter();
	const currentUser = useAppSelector((state) => state.app.currentUser);

	const fetchData = async (curPage?: number) => {
		setLoading(true);
		const response = await getData(filters, {
			page: curPage || page,
		});
		setAssets(response.data || []);
		setTotal(response.total);
		setLoading(false);
	};

	// fetch right data when tab is changed
	useEffect(() => {
		if (tabKey !== '2') {
			return;
		}

		fetchData(1);
		setPage(1);
	}, [filters]);

	let Assets: React.ReactNode;
	if (!assets || assets.length === 0) {
		Assets = <AppEmpty title='No asset' />;
	} else {
		Assets = (
			<Flex
				sx={{
					alignItems: 'center',
					flexDirection: 'column',
					rowGap: 30,
				}}
			>
				<Grid sx={{ gridTemplateColumns: '1fr 1fr 1fr', width: '100%' }}>
					{assets.map((el, index) => {
						const items: MenuProps['items'] = [
							{
								key: '1',
								label: (
									<Box
										onClick={() => {
											setSelectedImageAsset(el);
											setShowEditModal(true);
										}}
									>
										Edit
									</Box>
								),
								disabled: currentUser.id != el.user.id,
							},
							{
								key: '2',
								danger: true,
								label: (
									<Box
										onClick={async () => {
											confirmAlert({
												title: 'Delete image asset',
												message:
													'Do you want to delete this image asset? This can not be undone!',
												buttons: [
													{
														label: 'Cancel',
														onClick: () => {},
													},
													{
														label: 'Confirm',
														onClick: async () => {
															await deleteImageAsset(
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
									title={el.name || el.image}
									description={`Image - Uploaded ${dayjs().to(dayjs(el.createdAt))}`}
									imageUrl={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${el.image}`}
									actions={[
										<Dropdown placement='bottom' menu={{ items }}>
											<SettingOutlined key='setting' />
										</Dropdown>,
									]}
								/>
							</Box>
						);
					})}
				</Grid>

				<Box>
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
					title='Edit image asset'
					open={showEditModal}
					onCancel={() => {
						setShowEditModal(false);
						setSelectedImageAsset(null);
					}}
					footer={null}
				>
					<CModalBody>{selectedImageAsset && <EditImageAsset imageAsset={selectedImageAsset} />}</CModalBody>
				</Modal>
			</Flex>
		);
	}

	return <>{loading ? <div>Loading data</div> : Assets}</>;
};
async function getData(filters: any, options: any) {
	try {
		const token = getAuthTokenFromCookie();

		const baseURL = `${publicRuntimeConfig.API_URL}/api/v1`;
		let apiPath = '/imageassets';

		if (filters.project_template_type === 'mines') {
			apiPath = '/imageassets/mines';
		}
		if (filters.project_template_type === 'shared') {
			apiPath = '/imageassets/shared';
		}

		if (filters.sort === 'last_created') {
			apiPath += '?sort=-createdAt';
		}

		if (filters.sort === 'last_updated') {
			apiPath += '?sort=-updatedAt';
		}

		if (filters.sort === 'first_created') {
			apiPath += '?sort=createdAt';
		}

		const url = baseURL + apiPath;

		const res = await axios.get(url, {
			params: { page: options.page, limit: 9 },
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (res.data.status === 'success') {
			return res.data;
		}
	} catch (err) {
		console.log(err);
		toast(err.response.data.message);
	}
}

export default AssetsTab;
