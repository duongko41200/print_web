import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import AddIcon from '@mui/icons-material/Add';
import { Button } from 'antd';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { toast } from 'react-toastify';

import Uploader from '../Upload/Uploader';

import { createImageAsset } from 'services/dbhandler';
import { Box } from 'theme-ui';

export default function UploadImageAssetDialog() {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);

	const imageRef = useRef<any>(null);

	const handleClose = () => {
		setOpen(false);
	};
	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleSubmit = async () => {
		const image = imageRef.current.files[0];
		const formData = new FormData();
		formData.append('image', image);

		await createImageAsset(
			formData,
			() =>
				toast.success('Upload successfully!', {
					onClose: () => {
						router.refresh();
					},
				}),
			(err) => toast.error(err.response?.data?.message || 'Error creating image asset!')
		);
	};

	return (
		<div>
			<Box onClick={handleClickOpen}>Upload image asset</Box>
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>Upload image asset</DialogTitle>
				<DialogContent>
					<Uploader inputRef={imageRef} />
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={handleSubmit}>Continue</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
