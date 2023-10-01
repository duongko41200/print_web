/**
 * @brief Projects page (opened from projects tab in sider)
 */

import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react';

// antd
import { Typography, Tabs } from 'antd';

// mui
import AddIcon from '@mui/icons-material/Add';
import { Flex, Box } from 'theme-ui';
import CropLandscapeIcon from '@mui/icons-material/CropLandscape';
import CropPortraitIcon from '@mui/icons-material/CropPortrait';
import CropSquareIcon from '@mui/icons-material/CropSquare';

import GeneralLayout from '@layouts/general/GeneralLayout';
import DesignsTab from '@components/tab/content/DesignsTab';
import AssetsTab from '@components/tab/content/AssetsTab';
import TemplatesTab from '@components/tab/content/TemplatesTab';
import { TabItem } from '@components/tab/Tab';
import Filters from '@components/filter/ProjectFilters';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import CustomDropdown from '@components/dropdown/Dropdown';
import ProductMenu from '@components/menu/ProductMenu';
import UploadImageAssetDialog from '@components/dialog/UploadImageAssetDialog';

import { createDesignFromProduct, createTemplate } from 'services/dbhandler';

const { Title } = Typography;

const Projects: React.FC = () => {
	const [filters, setFilters] = useState<any>({});
	const [tabKey, setTabKey] = useState<string>('1');

	const handleFiltersChange = (filters: any) => {
		setFilters(filters);
	};

	const handleCreateNewTemplate = async (
		e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>,
		type: string
	) => {
		e.preventDefault();

		if (!type){
			return;
		}
		
		const newTemplate = await createTemplate({ type });
		if (newTemplate) {
			window.open(`/templates/${newTemplate.id || newTemplate._id}`, '_blank');
		}
	};

	// tabs
	const tabItemProps = { filters, tabKey };
	const tabItems: TabItem[] = [
		{
			label: 'Designs',
			key: '1',
			children: <DesignsTab {...tabItemProps} />,
		},
		{
			label: 'Assets',
			key: '2',
			children: <AssetsTab {...tabItemProps} />,
		},
		{
			label: 'Templates',
			key: '3',
			children: <TemplatesTab {...tabItemProps} />,
		},
	];

	const createNewDesign = async (product: any) => {
		const newDesign = await createDesignFromProduct(product.id, null, (err) =>
			toast.error(err.response.data.message)
		);
		if (newDesign) {
			window.open(`/designs/${newDesign.id}`, '_blank');
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
					<Title>Projects</Title>
				</Box>

				<Box>
					<CDropdown autoClose='outside'>
						<CDropdownToggle
							color='light'
							style={{
								background: '#f5f5f5',
								fontWeight: 500,
							}}
						>
							<AddIcon />
							Add new
						</CDropdownToggle>
						<CDropdownMenu>
							<CDropdownItem>
								<CustomDropdown
									closeOnClick={false}
									toggle={<>Create new design</>}
									menu={<ProductMenu onSelect={async (product) => await createNewDesign(product)} />}
								/>
							</CDropdownItem>
							<CDropdownItem>
								<CDropdown direction='dropstart'>
									<CDropdownToggle
										color='light'
										style={{ background: 'transparent', border: 'none', paddingLeft: 0 }}
									>
										Create new template
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
							</CDropdownItem>
							<CDropdownItem>
								<UploadImageAssetDialog />
							</CDropdownItem>
						</CDropdownMenu>
					</CDropdown>
				</Box>
			</Flex>

			<Box padding='20px 0'>
				<Filters onChange={handleFiltersChange} tabKey={tabKey} />
			</Box>

			<Tabs
				onChange={(activeKey) => {
					setTabKey(activeKey);
					setFilters({});
				}}
				defaultActiveKey='1'
				centered
				items={tabItems}
			/>
		</GeneralLayout>
	);
};

export default ProtectedRoute(Projects);
