import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import SaveIcon from '@mui/icons-material/Save';
import { Form, Input, Select } from 'antd';
import { Button } from '@mui/material';
import { updateProduct, updateUser } from 'services/dbhandler';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@store/hooks';
import Uploader from '@components/Upload/Uploader';

const { Item } = Form;

interface EditProductFormProps {
	product: any;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product }) => {
	const [hasChange, setHasChange] = useState(false);
	const thumbnailRef = useRef<any>(null);

	const router = useRouter();
	const [form] = Form.useForm();

	useEffect(() => {
		setHasChange(false);
		form.resetFields();
	}, [product]);

	const handleOnFinish = async (values: any) => {
		const thumbnail = thumbnailRef.current.files[0];

		const formData = new FormData();
		formData.append('name', values.name);

		if (thumbnail){
			formData.append('thumbnail', thumbnail);
		}

		const updatedProduct = await updateProduct(product.id, formData, null, (err) =>
			toast.error(err.response.data.message)
		);
		if (updatedProduct) {
			toast.success('Update product successfully');

			setTimeout(() => {
				router.refresh();
			}, 2000);
			setHasChange(false);
		}
	};

	return (
		<Form
			form={form}
			layout='vertical'
			onFinish={handleOnFinish}
			initialValues={{ name: product.name }}
			onValuesChange={() => setHasChange(true)}
		>
			<Item label='Name' name='name'>
				<Input />
			</Item>

			<Uploader
				onChange={() => setHasChange(true)}
				inputRef={thumbnailRef}
				label='Thumbnail (will be used to display on card, list, ...)'
			/>

			<Item>
				<Button disabled={!hasChange} type='submit' size='small' variant='outlined' startIcon={<SaveIcon />}>
					Save
				</Button>
			</Item>
		</Form>
	);
};

export default EditProductForm;
