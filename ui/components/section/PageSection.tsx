import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { CModalHeader, CModalTitle } from '@coreui/react';
import { CModal, CModalBody } from '@coreui/react';
import { Flex, Box } from 'theme-ui';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';

import CustomCard from '../card/Card';
import Carousel from '../carousel/Carousel';
import AppEmpty from '../empty/AppEmpty';
import { Avatar, Typography } from 'antd';
import { createDesignFromProduct, getAllDesigns, getProducts, getTemplates } from 'services/dbhandler';
import { ProductsModalContent, TemplateModalContent } from '@pages/templates';

import getConfig from 'next/config';
import { getImageUrl } from '@utils/user';
const { publicRuntimeConfig } = getConfig()

const { Text, Paragraph } = Typography;

interface PageSectionProps {
	title: string;
	action?: React.ReactNode;
	imageField: string;
	type: string;
}

const PageSection: React.FC<PageSectionProps> = ({ title, action, imageField, type }) => {
	const [data, setData] = useState<Array<any> | null>([]);
	const [loading, setIsLoading] = useState<boolean>(false);
	const [showTemplateModal, setShowTemplateModal] = useState(false);
	const [showProductsModal, setShowProductsModal] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			const data = await getData(type);
			setData(data);

			setIsLoading(false);
		};

		fetchData();
	}, []);

	const handleClick = async (el: any) => {
		if (type === 'products') {
			const newDesign = await createDesignFromProduct(el.id, null, (err) =>
				toast.error(err.response?.data?.message || 'Error creating design')
			);
			if (newDesign) {
				window.open(`/designs/${newDesign.id}`, '_blank');
			}
		}

		if (type === 'designs') {
			window.open(`/designs/${el.id}`, '_blank');
		}

		if (type === 'templates') {
			setSelectedTemplate(el);
			setShowTemplateModal(!showTemplateModal);
		}
	};

	let ListData: React.ReactNode;
	if ((!data || data.length === 0) && !loading) {
		ListData = <AppEmpty title='No data to display' />;
	} else {
		ListData = (
			<Carousel
				slidesToScroll={5}
				slidesToShow={Math.min(data.length, 5)}
				speed={500}
				infinite={false}
				disabled={data.length <= 5}
			>
				{data.map((el: any, index: number) => {
					let description: React.ReactNode;
					if (type === 'designs' || type === 'templates') {
						description = (
							<Flex sx={{ alignItems: 'center' }}>
								<Box>
									<Avatar size={32} src={getImageUrl(el.user)} />
								</Box>

								<Box>
									<Paragraph style={{ margin: '0 0 0 7px' }} ellipsis={{ tooltip: el.user?.name }}>
										{el.user?.name}
									</Paragraph>
								</Box>
							</Flex>
						);
					}

					return (
						<Box key={index} padding='5px 10px'>
							<CustomCard
								onClick={async (e) => await handleClick(el)}
								key={index}
								title={el.name}
								imageUrl={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${el[imageField]}`}
								width={200}
								height={150}
								description={description}
							/>
						</Box>
					);
				})}
			</Carousel>
		);
	}

	return (
		<div style={{ padding: '30px 0 0 0' }}>
			<div>
				<Flex
					paddingBottom={10}
					sx={{
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<Box>
						<Text style={{ fontSize: '26px' }} strong>
							{title}
						</Text>
					</Box>

					<Box>{action}</Box>
				</Flex>
			</div>

			{loading ? <div>...</div> : ListData}

			{type === 'templates' && (
				<>
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
				</>
			)}
		</div>
	);
};

async function getData(type: string): Promise<Array<any> | null> {
	if (type === 'products') {
		return await getProducts(1, 30, '-numDesigns,-createdAt');
	}

	if (type === 'designs') {
		return await getAllDesigns({ page: 1, limit: 30, sort: '-updatedAt' });
	}

	if (type === 'templates') {
		return await getTemplates({ page: 1, limit: 30, sort: '-numUsed,-updatedAt' });
	}
}

export default PageSection;
