import React, { useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import AddIcon from '@mui/icons-material/Add';
import { Button } from 'antd';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { toast } from 'react-toastify';

import Uploader from '../Upload/Uploader';

import { getAuthTokenFromCookie } from '@utils/cookie';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig()

export default function UploadProductDialog() {
	const router = useRouter();
	const [open, setOpen] = React.useState(false);

	const imageRef = useRef<any>(null);
	const thumbnailRef = useRef<any>(null);
	const nameRef = useRef<any>('');
	const desRef = useRef<any>('');

	const handleClose = () => {
		setOpen(false);
	};
	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleSubmit = async () => {
		const name = nameRef.current.value;
		const description = desRef.current.value;
		const image = imageRef.current.files[0];
		const thumbnail = thumbnailRef.current.files[0];
		const formData = new FormData();
		formData.append('name', name);
		formData.append('description', description);
		formData.append('image', image);
		if (thumbnail){
			formData.append('thumbnail', thumbnail);
		}
		
		const token = getAuthTokenFromCookie();

		try {
			const url = `${publicRuntimeConfig.API_URL}/api/v1/products`;
			const res = await axios.post(url, formData, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (res.data.status === 'success') {
				toast.success('Upload product successfully!', {
					onClose: () => {
						router.refresh();
					},
				});
			}
		} catch (err) {
			toast.error(err.response?.data?.message || 'Error creating product!');
		}
	};

	return (
		<div>
			<Button
				onClick={handleClickOpen}
				style={{
					background: '#f5f5f5',
					fontWeight: 500,
				}}
				size='large'
				icon={<AddIcon />}
			>
				Upload new Product
			</Button>
			<Dialog open={open} onClose={handleClose}>
				<DialogTitle>Upload new Product</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						margin='dense'
						id='name'
						label='Product name'
						fullWidth
						variant='outlined'
						required
						inputRef={nameRef}
					/>

					<TextField
						id='description'
						label='Description'
						margin='dense'
						fullWidth
						variant='outlined'
						multiline
						sx={{ marginBottom: '20px' }}
						inputRef={desRef}
					/>

					<Uploader inputRef={imageRef} label='* Image (will be used to design)' />
					
					<Uploader inputRef={thumbnailRef} label='Thumbnail (will be used to display on card, list, ...)' />
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={handleSubmit}>Continue</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}
