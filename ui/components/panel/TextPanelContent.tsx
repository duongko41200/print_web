import React, { RefObject, useContext, useEffect, useState } from 'react';
import { fabric } from 'fabric';

import { Button } from '@mui/material';
import { Box, Flex, Grid } from 'theme-ui';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

import FabricCanvasContext from '@components/canvas/CanvasContext';

interface TextPanelContentProps {
	setIsSidebarOpen: (value: boolean) => void;
}

const TextPanelContent: React.FC<TextPanelContentProps> = ({ setIsSidebarOpen }) => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const addHeading = () => {
		const headingText = new fabric.Textbox('Add a heading text', {
			left: canvas.current.width / 2,
			top: canvas.current.height / 2,
			originX: 'center',
			originY: 'center',
			fontSize: 24,
			fontFamily: 'Arial',
			fill: 'black',
			fontWeight: 700,
			textAlign: 'center',
			width: 300,
			lineHeight: 1.16,
			superType: 'textbox',
		});

		canvas.current.add(headingText);
	};
	const addSubHeading = () => {
		const subHeadingText = new fabric.Textbox('Add a sub heading text', {
			left: canvas.current.width / 2,
			top: canvas.current.height / 2,
			originX: 'center',
			originY: 'center',
			fontSize: 18,
			fontFamily: 'Arial',
			fill: 'black',
			fontWeight: 500,
			textAlign: 'center',
			width: 300,
			lineHeight: 1.16,
			superType: 'textbox',
		});

		canvas.current.add(subHeadingText);
	};
	const addBodyText = () => {
		const bodyText = new fabric.Textbox('Add a little bit of body text', {
			left: canvas.current.width / 2,
			top: canvas.current.height / 2,
			originX: 'center',
			originY: 'center',
			fontSize: 14,
			fontFamily: 'Arial',
			fill: 'black',
			fontWeight: 300,
			textAlign: 'center',
			width: 300,
			lineHeight: 1.16,
			superType: 'textbox',
		});

		canvas.current.add(bodyText);
	};

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
				<div>Texts</div>
				<Button sx={{ color: '#666' }} onClick={() => setIsSidebarOpen(false)}>
					<KeyboardDoubleArrowLeftIcon />
				</Button>
			</Flex>

			<Grid sx={{ gridTemplateRows: 'repeat(3, 50px)' }}>
				<Flex
					sx={{
						paddingLeft: '1rem',
						fontSize: '1.66rem',
						alignItems: 'center',
						fontWeight: 700,
						background: '#f5f5f5',
						borderRadius: '10px',
						cursor: 'pointer',
					}}
					onClick={addHeading}
				>
					Add a heading
				</Flex>
				<Flex
					sx={{
						paddingLeft: '1rem',
						fontSize: '1.12rem',
						alignItems: 'center',
						fontWeight: 500,
						background: '#f5f5f5',
						borderRadius: '10px',
						cursor: 'pointer',
					}}
					onClick={addSubHeading}
				>
					Add a subheading
				</Flex>
				<Flex
					sx={{
						paddingLeft: '1rem',
						fontSize: '0.76rem',
						alignItems: 'center',
						fontWeight: 300,
						background: '#f5f5f5',
						borderRadius: '10px',
						cursor: 'pointer',
					}}
					onClick={addBodyText}
				>
					Add a little bit of body text
				</Flex>
			</Grid>
		</Box>
	);
};

export default TextPanelContent;
