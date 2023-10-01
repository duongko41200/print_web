import React, { RefObject, useContext, useEffect, useState } from 'react';
import { fabric } from 'fabric';

import { Button } from '@mui/material';
import { Box, Flex, Grid } from 'theme-ui';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import Pencils from '../pencil/Pencil';


interface DrawPanelContentProps {
	setIsSidebarOpen: (value: boolean) => void;
}

const DrawPanelContent: React.FC<DrawPanelContentProps> = ({ setIsSidebarOpen }) => {

	return (
		<Box
			sx={{
				padding: '0 10px',
				color: '#000',
				fontFamily: 'Arial',
			}}
		>
			<Flex
				sx={{
					fontWeight: 600,
					fontSize: '0.84rem',
					padding: '0.8rem 0',
					color: '#666',
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<div>Draw</div>
				<Button sx={{ color: '#666' }} onClick={() => setIsSidebarOpen(false)}>
					<KeyboardDoubleArrowLeftIcon />
				</Button>
			</Flex>

			<Box>
				<Pencils />
			</Box>
		</Box>
	);
};

export default DrawPanelContent;
