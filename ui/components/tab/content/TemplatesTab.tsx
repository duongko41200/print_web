import React, { useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTome from 'dayjs/plugin/relativeTime';
import Link from 'next/link';

import { CModalBody } from '@coreui/react';
import { Flex, Box, Grid, Avatar } from 'theme-ui';
import CustomCard from '@components/card/Card';
import { SettingOutlined } from '@ant-design/icons';
import { TabContentProps } from './TabContentProps';
import AppEmpty from '@components/empty/AppEmpty';
import CustomPagination from '@components/pagination/CustomPagination';
import { useAppSelector } from '@store/hooks';
import { getAuthTokenFromCookie } from '@utils/cookie';
import { Dropdown, MenuProps, Modal } from 'antd';
import EditTemplateForm from '@components/form/EditTemplateForm';

import { deleteTemplate } from 'services/dbhandler';

import getConfig from 'next/config';
import { confirmAlert } from 'react-confirm-alert';
import { getImageUrl } from '@utils/user';
const { publicRuntimeConfig } = getConfig();

dayjs.extend(relativeTome);

const TemplatesTab: React.FC<TabContentProps> = ({ filters, tabKey }) => {
	const [templates, setTemplates] = useState([]);
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState<number>(1);
	const [loading, setLoading] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

	const currentUser = useAppSelector((state) => state.app.currentUser);
	const router = useRouter();

	const fetchData = async (curPage?: number) => {
		setLoading(true);
		const response = await getData(filters, {
			page: curPage || page,
		});
		setTemplates(response.data || []);
		setTotal(response.total);
		setLoading(false);
	};

	// fetch right data when tab is changed
	useEffect(() => {
		if (tabKey !== '3') {
			return;
		}

		fetchData(1);
		setPage(1);
	}, [filters]);

	let Templates: React.ReactNode;
	if (!templates || templates.length === 0) {
		Templates = <AppEmpty title='No templates' />;
	} else {
		Templates = (
			<Flex
				sx={{
					alignItems: 'center',
					flexDirection: 'column',
					rowGap: 30,
				}}
			>
				<Grid sx={{ gridTemplateColumns: '1fr 1fr 1fr', width: '100%' }}>
					{templates.map((el, index) => {
						const items: MenuProps['items'] = [
							{
								key: '1',
								label: (
									<Link
										style={{ textDecoration: 'none', color: 'inherit' }}
										href={`/templates/${el.id}`}
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
											setSelectedTemplate(el);
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
										onClick={async () => {
											confirmAlert({
												title: 'Delete template',
												message: 'Confirm to delete this template? This can not be undone!',
												buttons: [
													{
														label: 'Cancel',
														onClick: () => {},
													},
													{
														label: 'Confirm',
														onClick: async () => {
															await deleteTemplate(
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
									href={`templates/${el.id}`}
									title={el.name}
									description={el.description || <>...</>}
									imageUrl={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${el.thumbnail}?origin=${Date.now()}`}
									actions={[
										<Dropdown placement='bottom' menu={{ items }}>
											<SettingOutlined key='setting' />
										</Dropdown>,
									]}
									avatar={
										<Avatar src={getImageUrl(currentUser)} />
									}
								/>
							</Box>
						);
					})}
				</Grid>

				<Box>
					<CustomPagination
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
						setSelectedTemplate(null);
					}}
					footer={null}
				>
					<CModalBody>{selectedTemplate && <EditTemplateForm template={selectedTemplate} />}</CModalBody>
				</Modal>
			</Flex>
		);
	}

	return <>{loading ? <div>Loading data</div> : Templates}</>;
};

async function getData(filters: any, options: any) {
	try {
		const token = getAuthTokenFromCookie();

		const baseURL = `${publicRuntimeConfig.API_URL}/api/v1`;
		let apiPath = '/templates/mines';

		if (filters.project_template_type === 'mines') {
			apiPath = '/templates/mines';
		}
		if (filters.project_template_type === 'shared') {
			apiPath = '/templates/shared';
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

export default TemplatesTab;
