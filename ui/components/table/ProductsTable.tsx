import React, { useEffect, useState } from 'react';
import { Table, Input } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

import CloseIcon from '@mui/icons-material/Close';
import { Typography, Avatar } from 'antd';
import { IconButton } from '@mui/material';
import { SearchOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { CModal, CModalBody } from '@coreui/react';
import type { ColumnsType, TablePaginationConfig, TableProps } from 'antd/es/table';
import { SorterResult } from 'antd/es/table/interface';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Flex, Box } from 'theme-ui';
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react';
import EditProductForm from '@components/form/EditProductForm';

import { deleteProduct, getProducts } from 'services/dbhandler';
import { useAppSelector } from '@store/hooks';

import getConfig from 'next/config';
import { confirmAlert } from 'react-confirm-alert';
import { getImageUrl } from '@utils/user';
const { publicRuntimeConfig } = getConfig();

const { Text, Title } = Typography;
dayjs.locale('vi');

interface DataType {
	key: React.Key;
	thumbnail: string;
	name: string;
	user: string;
	role: string;
	numDesigns: Number;
	createdAt: Date;
}

interface ProductsTableProps {}

const ProductsTable: React.FC<ProductsTableProps> = ({}) => {
	const [products, setProducts] = useState([]);
	const [total, setTotal] = useState(0);
	const [query, setQuery] = useState('');
	const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 20 });
	const [sorter, setSorter] = useState(null);
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);

	const currentUser = useAppSelector((state) => state.app.currentUser);
	const router = useRouter();

	const handleClickPreviewButton = (product: any) => {
		setSelectedProduct(product);
		setShowPreviewModal(!showPreviewModal);
	};
	const handleClickEditButton = (product: any) => {
		setSelectedProduct(product);
		setShowEditModal(!showEditModal);
	};

	const handleDeleteProduct = async (product: any) => {
		confirmAlert({
			title: 'Delete product',
			message: 'Confirm to delete this product? This can not be undone!',
			buttons: [
				{
					label: 'Cancel',
					onClick: () => {},
				},
				{
					label: 'Confirm',
					onClick: async () => {
						await deleteProduct(
							product.id,
							() => {
								toast.success('Delete successfully', { onClose: () => router.refresh() });
							},
							(err) => toast.error(err.response.data.message)
						);
					},
				},
			],
		});
	};

	const columns: ColumnsType<DataType> = [
		{
			key: '1',
			title: 'Image',
			dataIndex: 'thumbnail',
			width: 80,
			render: (value) => (
				<img
					loading='lazy'
					style={{ objectFit: 'contain', width: '100%' }}
					src={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${value}`}
					alt=''
				/>
			),
		},
		{
			key: '2',
			title: 'Name',
			dataIndex: 'name',
			sorter: true,
			width: 400,
			ellipsis: { showTitle: false },
			sortDirections: ['ascend', 'descend'],
			render: (name: string) => {
				return <Text ellipsis={{ tooltip: name }}>{name}</Text>;
			},
		},
		{
			key: '3',
			title: 'Creator',
			dataIndex: 'user',
			render: (value) => (
				<Flex sx={{ alignItem: 'center', columnGap: 10 }}>
					<Box>
						<Avatar src={getImageUrl(value)} />
					</Box>
					<Box>
						<Text ellipsis={{ tooltip: value.name }} style={{ verticalAlign: 'middle' }}>
							{value.name}
						</Text>
					</Box>
				</Flex>
			),
		},
		{
			key: '4',
			title: 'Designs',
			dataIndex: 'numDesigns',
			sorter: true,
			sortDirections: ['ascend', 'descend'],
		},
		{
			key: '6',
			title: 'Date uploaded',
			dataIndex: 'createdAt',
			sorter: true,
			defaultSortOrder: 'descend',
			sortDirections: ['ascend', 'descend'],
			render: (value) => dayjs(value).format('DD-MM-YYYY'),
		},
		{
			key: '100',
			title: 'Actions',
			width: 100,
			dataIndex: 'actions',
			render: (_, record: any) => {
				return (
					<CDropdown>
						<CDropdownToggle size='sm' color='light'>
							<MoreHorizIcon />
						</CDropdownToggle>

						<CDropdownMenu>
							<CDropdownItem
								disabled={currentUser.id != record.user.id}
								onClick={() => handleClickEditButton(record)}
							>
								Edit
							</CDropdownItem>
							<CDropdownItem onClick={() => handleClickPreviewButton(record)}>Preview</CDropdownItem>
							<CDropdownItem
								onClick={() => handleDeleteProduct(record)}
								disabled={record.role === 'owner'}
								style={{ color: 'red' }}
							>
								Delete
							</CDropdownItem>
						</CDropdownMenu>
					</CDropdown>
				);
			},
		},
	];

	const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
		fetchData(pagination, sorter, query);

		setPagination(pagination);
		setSorter(sorter);
	};

	const fetchData = async (pagination?, sorter?, query?) => {
		const data: any = await getData(pagination, sorter, query);

		setProducts(data.data);
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
					placeholder='Search product name'
					prefix={<SearchOutlined />}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							fetchData({ current: 1, pageSize: 20 }, sorter, query);

							setPagination({ current: 1, pageSize: 20 });
						}
					}}
				/>
			</Box>

			<Box>
				<Table
					rowKey={(record: any) => record.id}
					pagination={{
						current: pagination.current,
						position: ['bottomLeft'],
						pageSize: 20,
						total: total,
						showSizeChanger: false,
					}}
					columns={columns}
					dataSource={products}
					onChange={onChange}
				/>
			</Box>

			<CModal
				className='template-modal'
				alignment='center'
				size='lg'
				visible={showPreviewModal}
				onClose={() => setShowPreviewModal(false)}
			>
				<CModalBody>{selectedProduct && <PreviewModalContent product={selectedProduct} />}</CModalBody>

				<IconButton
					onClick={() => setShowPreviewModal(false)}
					size='small'
					sx={{
						position: 'absolute',
						right: '-40px',
						top: '-10px',
						color: '#f5f5f5',
						border: '1px solid #666',
					}}
				>
					<CloseIcon />
				</IconButton>
			</CModal>

			<Modal
				title='Edit product'
				open={showEditModal}
				onCancel={() => {
					setShowEditModal(false);
					setSelectedProduct(null);
				}}
				footer={null}
			>
				<CModalBody>{selectedProduct && <EditProductForm product={selectedProduct} />}</CModalBody>
			</Modal>
		</Flex>
	);
};

function PreviewModalContent({ product }) {
	return (
		<Flex className='product-modal-content' padding='20px'>
			<Box
				className='left-product-modal'
				sx={{ width: '50%', border: '1px solid #ddd', borderRadius: 12, overflow: 'hidden' }}
			>
				<img
					style={{ width: '100%' }}
					src={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${product.thumbnail}`}
					loading='lazy'
					alt={product.name}
				/>
			</Box>

			<Flex paddingLeft={20} className='right-product-modal' sx={{ flexDirection: 'column', flexGrow: 1 }}>
				<Box>
					<Title>{product.name}</Title>
				</Box>

				<Flex className='product-creator' sx={{ alignItems: 'center', columnGap: 15 }}>
					<Box className='avatar' sx={{ display: 'flex', alignItems: 'center' }}>
						<Avatar size={30} src={getImageUrl(product.user)} />
					</Box>
					<Box className='name'>
						<Text style={{ fontWeight: 300 }}>by </Text>
						<Text>{product.user.name}</Text>
					</Box>
				</Flex>
			</Flex>
		</Flex>
	);
}

async function getData(pagination: TablePaginationConfig, sorter: SorterResult<DataType>, query: string) {
	let sort = '';
	if (sorter && sorter.column) {
		sort = sorter.order === 'ascend' ? (sorter.field as string) : `-${sorter.field}`;
	}

	let fetchedData: any;
	await getProducts(pagination?.current, pagination?.pageSize, sort, query, (data) => (fetchedData = data));

	return fetchedData;
}

export default ProductsTable;
