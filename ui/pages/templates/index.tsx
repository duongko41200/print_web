import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

// antd
import { Avatar } from 'antd';
import { Typography } from 'antd';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

// mui
import CropLandscapeIcon from '@mui/icons-material/CropLandscape';
import CropPortraitIcon from '@mui/icons-material/CropPortrait';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { Avatar as MuiAvatar, AvatarGroup } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';

import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CModalHeader, CModalTitle } from '@coreui/react';
import { CModal, CModalBody } from '@coreui/react';

import { Flex, Box, Grid } from 'theme-ui';
import GeneralLayout from '@layouts/general/GeneralLayout';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import InfiniteCard from '@components/card/InfiniteCard';
import Filters from '@components/filter/TemplateFilter';
import AppEmpty from '@components/empty/AppEmpty';
import { cloneTemplate, createDesignFromTemplate, fetchAuthData } from 'services/dbhandler';
import { getAllProducts, createTemplate } from 'services/dbhandler';

import getConfig from 'next/config';
import { getImageUrl } from '@utils/user';
const { publicRuntimeConfig } = getConfig();

const { Title, Text } = Typography;

const Templates: React.FC = () => {
	const [templates, setTemplates] = useState([]);
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({ template_type: null, template_sort: null });
	const [showTemplateModal, setShowTemplateModal] = useState(false);
	const [showProductsModal, setShowProductsModal] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

	const handleChangeFilters = (filters: any) => {
		setFilters(filters);
	};

	const fetchData = async (curPage?: number) => {
		if (!curPage) {
			curPage = page;
		}

		let url = `${publicRuntimeConfig.API_URL}/api/v1/templates`;
		const params = { sort: '-numUsed' };
		if (filters.template_type === 'mines') {
			url += '/mines';
		}
		if (filters.template_type === 'shared') {
			url += '/shared';
		}

		if (filters.template_sort === 'trend') {
			params.sort = '-numUsed';
		}
		if (filters.template_sort === 'last_updated') {
			params.sort = '-updatedAt';
		}
		if (filters.template_sort === 'last_created') {
			params.sort = '-createdAt';
		}
		if (filters.template_sort === 'first_updated') {
			params.sort = 'updatedAt';
		}

		const newTemplates = await fetchAuthData(url, 'get', { limit: 7, page, ...params }, null, (err) =>
			toast.error('Error fetching templates')
		);

		if (page > 1) {
			setTemplates((prev) => [...prev, ...newTemplates]);
		} else {
			setTemplates([...newTemplates]);
		}
	};

	useEffect(() => {
		fetchData();
	}, [page]);

	useEffect(() => {
		fetchData(1);
		setPage(1);
	}, [filters]);

	const handleClickTemplate = (template: any) => {
		setSelectedTemplate(template);
		setShowTemplateModal(!showTemplateModal);
	};

	const handleCreateNewTemplate = async (
		e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>,
		type: string
	) => {
		e.preventDefault();

		if (!type) {
			return;
		}

		const newTemplate = await createTemplate({ type });
		if (newTemplate) {
			window.open(`/templates/${newTemplate.id || newTemplate._id}`, '_blank');
		}
	};

	return (
		<GeneralLayout>
			<Flex
				sx={{
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<Box>
					<Title>Templates</Title>
				</Box>

				<Box>
					<CDropdown>
						<CDropdownToggle color='light' style={{ background: '#f5f5f5', fontWeight: 500 }}>
							<AddIcon /> Add new
						</CDropdownToggle>
						<CDropdownMenu>
							<CDropdownItem onClick={(e) => handleCreateNewTemplate(e, 'landscape')}>
								<CropLandscapeIcon color='disabled' /> Landscape template
							</CDropdownItem>
							<CDropdownItem onClick={(e) => handleCreateNewTemplate(e, 'portrait')}>
								<CropPortraitIcon color='disabled' /> Portrait template
							</CDropdownItem>
							<CDropdownItem onClick={(e) => handleCreateNewTemplate(e, 'square')}>
								<CropSquareIcon color='disabled' /> Square template
							</CDropdownItem>
						</CDropdownMenu>
					</CDropdown>
				</Box>
			</Flex>

			<Box padding='20px 0'>
				<Filters onChange={handleChangeFilters} />
			</Box>

			{!templates || templates.length === 0 ? (
				<AppEmpty title='No template' />
			) : (
				<Grid paddingTop={20} sx={{ gridTemplateColumns: 'repeat(3,1fr)', columnGap: 30, rowGap: 30 }}>
					{templates.map((el, index) => (
						<InfiniteCard
							key={index}
							title={el.name}
							description={<Text style={{ textTransform: 'capitalize' }}>{el.type}</Text>}
							imageUrl={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${el.thumbnail}?origin=${Date.now()}`}
							isLast={index === templates.length - 1}
							newLimit={() => setPage(page + 1)}
							onClick={() => handleClickTemplate(el)}
						/>
					))}
				</Grid>
			)}

			<CModal
				className='template-modal'
				alignment='center'
				size='lg'
				visible={showTemplateModal}
				onClose={() => setShowTemplateModal(false)}
			>
				<CModalBody>
					{selectedTemplate && (
						<TemplateModalContent
							template={selectedTemplate}
							showProductsModal={showProductsModal}
							setShowProductsModal={setShowProductsModal}
						/>
					)}
				</CModalBody>

				<IconButton
					onClick={() => setShowTemplateModal(false)}
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
			<CModal
				className='products-modal'
				alignment='center'
				size='sm'
				visible={showProductsModal}
				onShow={() => setShowTemplateModal(false)}
				onClose={() => {
					setShowProductsModal(false);
					setShowTemplateModal(true);
				}}
			>
				<CModalHeader>
					<CModalTitle>Add to new design</CModalTitle>
				</CModalHeader>
				<CModalBody>
					<ProductsModalContent template={selectedTemplate} />
				</CModalBody>
			</CModal>
		</GeneralLayout>
	);
};

export function TemplateModalContent({ template, showProductsModal, setShowProductsModal }) {
	const handleCustomizeTemplate = async () => {
		const clonedTemplate = await cloneTemplate(template.id, null, (err) => toast.error(err.response.data.message));
		if (clonedTemplate) {
			window.open(`/templates/${clonedTemplate.id}`, '_blank');
		}
	};

	const handleOpenProductsModal = () => {
		setShowProductsModal(!showProductsModal);
	};

	return (
		<Flex className='template-modal-content' padding='20px'>
			<Box
				className='left-template-modal'
				sx={{ width: '50%', border: '1px solid #ddd', borderRadius: 12, overflow: 'hidden' }}
			>
				<img
					loading='lazy'
					style={{ width: '100%' }}
					src={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${template.thumbnail}?origin=${Date.now()}`}
					alt=''
				/>
			</Box>

			<Flex paddingLeft={20} className='right-template-modal' sx={{ flexDirection: 'column', flexGrow: 1 }}>
				<Box>
					<Title>{template.name}</Title>
				</Box>

				<Flex className='template-creator' sx={{ alignItems: 'center', columnGap: 15 }}>
					<Box className='avatar' sx={{ display: 'flex', alignItems: 'center' }}>
						<Avatar size={30} src={getImageUrl(template.user)} />
					</Box>
					<Box className='name'>
						<Text style={{ fontWeight: 300 }}>by </Text>
						<Text>{template.user.name}</Text>
					</Box>
				</Flex>

				<Box paddingTop={20} className='actions'>
					<CDropdown onClick={(e) => e.stopPropagation()}>
						<CDropdownToggle color='primary'>Use this template</CDropdownToggle>
						<CDropdownMenu>
							<CDropdownItem onClick={handleCustomizeTemplate} style={{ cursor: 'pointer' }}>
								Customize this template
							</CDropdownItem>

							<CDropdownItem onClick={handleOpenProductsModal} style={{ cursor: 'pointer' }}>
								Add to new design
							</CDropdownItem>
						</CDropdownMenu>
					</CDropdown>
				</Box>

				<Flex paddingTop={20} className='template-stats' sx={{ alignItems: 'center', columnGap: 10 }}>
					<Box>
						<Text>
							Used <Text strong>{template.numUsed}</Text> times by:{' '}
						</Text>
					</Box>

					<Box>
						<AvatarGroup sx={{ zIndex: 999 }}>
							{template.cloneUsers.slice(0, 6).map((el: any, index: number) => (
								<Tooltip key={index} title={el.name}>
									<MuiAvatar
										sx={{
											width: 16,
											height: 16,
											cursor: 'pointer',
										}}
										key={el.name}
										alt={el.name}
										src={getImageUrl(el)}
									/>
								</Tooltip>
							))}
							{template.cloneUsers.slice(6).length > 0 && (
								<Tooltip
									title={
										<div>
											{template.cloneUsers.slice(6).map((el: any, index: number) => {
												return <div key={index}>{el.name}</div>;
											})}
										</div>
									}
								>
									<MuiAvatar sx={{ width: 16, height: 16 }} sizes='small'>
										+{template.cloneUsers.slice(6).length}
									</MuiAvatar>
								</Tooltip>
							)}
						</AvatarGroup>
					</Box>
				</Flex>
			</Flex>
		</Flex>
	);
}

let allProducts = [];
export function ProductsModalContent({ template }) {
	const [products, setProducts] = useState([]);
	const [query, setQuery] = useState('');

	useEffect(() => {
		const filteredProducts = allProducts.filter((el) => removeAccents(el.name).includes(removeAccents(query)));
		setProducts(filteredProducts);
	}, [query]);

	function removeAccents(str: string) {
		return str
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/đ/g, 'd')
			.replace(/Đ/g, 'D')
			.toLowerCase();
	}

	useEffect(() => {
		const fetchData = async () => {
			const data = await getAllProducts(null, (err) => toast(err.response.data.message));
			if (data) {
				setProducts(data);
				allProducts = [...data];
			}
		};

		fetchData();
	}, []);

	const handleClickProductItem = async (id: string) => {
		const newDesign = await createDesignFromTemplate(template.id, { productId: id }, null, (err) =>
			toast.error(err.response.data.message)
		);

		if (newDesign) {
			window.open(`/designs/${newDesign.id}`);
		}
	};

	return (
		<Flex sx={{ flexDirection: 'column' }}>
			<Box className='input-search'>
				<Input
					size='large'
					placeholder='Search products'
					prefix={<SearchOutlined />}
					onChange={(e) => setQuery(e.target.value)}
				/>
			</Box>

			<Flex className='list-products' sx={{ flexDirection: 'column', overflow: 'auto', maxHeight: 400 }}>
				{products.map((el, index) => {
					return (
						<Flex
							onClick={() => handleClickProductItem(el.id)}
							padding='4px 0'
							sx={{
								alignItems: 'center',
								height: 50,
								cursor: 'pointer',
								':hover': { background: '#f5f5f5' },
							}}
						>
							<Box sx={{ minWidth: 50, maxWidth: 50, height: '100%' }}>
								<img
									loading='lazy'
									width={50}
									height='100%'
									style={{ objectFit: 'contain' }}
									src={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${el.thumbnail}?origin=${Date.now()}`}
									alt={el.name}
								/>
							</Box>

							<Box paddingLeft={12}>
								<Text ellipsis={{ tooltip: el.name }}>{el.name}</Text>
							</Box>
						</Flex>
					);
				})}
			</Flex>
		</Flex>
	);
}

export default ProtectedRoute(Templates);
