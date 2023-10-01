import React, { useEffect, useState } from 'react';
import { Tag, Table, Input } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

import { SearchOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import {  CModalBody} from '@coreui/react';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { FilterValue, SorterResult } from 'antd/es/table/interface';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Flex, Box } from 'theme-ui';
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react';
import EditUserForm from '@components/form/EditUserForm';

import { getUsers } from 'services/dbhandler';

import getConfig from 'next/config';
import { getImageUrl } from '@utils/user';
const { publicRuntimeConfig } = getConfig();

dayjs.locale('vi');

interface DataType {
	key: React.Key;
	image: string;
	name: string;
	email: string;
	role: string;
	status: string;
	createdAt: Date;
}

interface AccountsTableProps {}

const AccountsTable: React.FC<AccountsTableProps> = ({}) => {
	const [users, setUsers] = useState([]);
	const [total, setTotal] = useState(0);
	const [query, setQuery] = useState('');
	const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 20 });
	const [filters, setFilters] = useState(null);
	const [sorter, setSorter] = useState(null);
	const [selectedUser, setSelectedUser] = useState(null);
	const [showEditModal, setShowEditModal] = useState(false);

	const handleClickEditButton = (user: any) => {
		setSelectedUser(user);
		setShowEditModal(!showEditModal);
	};

	const columns: ColumnsType<DataType> = [
		{
			key: '1',
			title: 'Avatar',
			dataIndex: 'image',
			width: 50,
			render: (value) => (
				<img
					loading='lazy'
					style={{ objectFit: 'contain', width: '100%' }}
					src={getImageUrl(value)}
					alt='avatar'
				/>
			),
		},
		{
			key: '2',
			title: 'Name',
			dataIndex: 'name',
			sorter: true,
			sortDirections: ['ascend', 'descend'],
		},
		{
			key: '3',
			title: 'Email',
			dataIndex: 'email',
			sorter: true,
			sortDirections: ['ascend', 'descend'],
		},
		{
			key: '4',
			title: 'Role',
			dataIndex: 'role',
			filters: [
				{ text: 'User', value: 'user' },
				{ text: 'Admin', value: 'admin' },
				{ text: 'Owner', value: 'owner' },
			],
			render: (value) => <Tag>{value}</Tag>,
		},
		{
			key: '5',
			title: 'Status',
			dataIndex: 'status',
			filters: [
				{ text: 'Active', value: 'active' },
				{ text: 'Deactivated', value: 'inactive' },
			],
			render: (value) => <Tag color={`${value === 'active' ? 'green' : 'red'}`}>{value}</Tag>,
		},
		{
			key: '6',
			title: 'Date created',
			dataIndex: 'createdAt',
			sorter: true,
			defaultSortOrder: 'descend',
			sortDirections: ['ascend', 'descend'],
			render: (value) => dayjs(value).format('DD-MM-YYYY HH:mm:ss'),
		},
		{
			key: '100',
			title: 'Actions',
			dataIndex: 'actions',
			render: (_, record: any) => {
				return (
					<CDropdown>
						<CDropdownToggle size='sm' color='light'>
							<MoreHorizIcon />
						</CDropdownToggle>

						<CDropdownMenu>
							<CDropdownItem
								disabled={record.role === 'owner'}
								onClick={() => handleClickEditButton(record)}
							>
								Edit
							</CDropdownItem>
							{publicRuntimeConfig.NODE_ENV === 'development' && (
								<CDropdownItem disabled={record.role === 'owner'} style={{ color: 'red' }}>
									Deactivate
								</CDropdownItem>
							)}
						</CDropdownMenu>
					</CDropdown>
				);
			},
		},
	];

	const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
		fetchData(pagination, filters, sorter, query);

		setPagination(pagination);
		setFilters(filters);
		setSorter(sorter);
	};

	const fetchData = async (pagination?, filters?, sorter?, query?) => {
		const data: any = await getData(pagination, filters, sorter, query, columns);

		setUsers(data.data);
		setTotal(data.total);
	};

	useEffect(() => {
		fetchData();
	}, []);

	return (
		<Flex sx={{ flexDirection: 'column', rowGap: 20 }}>
			<Box sx={{ width: 300 }}>
				<Input
					size='large'
					placeholder='Search name or email'
					prefix={<SearchOutlined />}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							fetchData({ current: 1, pageSize: 20 }, filters, sorter, query);

							setPagination({ current: 1, pageSize: 20 });
						}
					}}
				/>
			</Box>

			<Box>
				<Table
					rowKey={(record) => record.id}
					pagination={{
						current: pagination.current,
						position: ['bottomLeft'],
						pageSize: 20,
						total: total,
						showSizeChanger: false,
					}}
					columns={columns}
					dataSource={users}
					onChange={onChange}
				/>
			</Box>

			<Modal
				title='Edit user'
				open={showEditModal}
				onCancel={() => {
					setShowEditModal(false);
					setSelectedUser(null);
				}}
				footer={null}
			>
				<CModalBody>{selectedUser && <EditUserForm user={selectedUser} />}</CModalBody>
			</Modal>
		</Flex>
	);
};

async function getData(
	pagination: TablePaginationConfig,
	filter: Record<string, FilterValue>,
	sorter: SorterResult<DataType>,
	query: string,
	columns: ColumnsType<DataType>
) {
	let sort = '';
	if (sorter && sorter.column) {
		sort = sorter.order === 'ascend' ? (sorter.field as string) : `-${sorter.field}`;
	}
	let filters = {};
	if (filter) {
		Object.keys(filter).forEach((key) => {
			const col: any = columns.find((el) => el.key == key);
			if (filter[key]) {
				filters[col.dataIndex] = filter[key];
			}
		});
	}
	const data = await getUsers(pagination?.current, pagination?.pageSize, sort, filters, query);

	return data;
}

export default AccountsTable;
