import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import SaveIcon from '@mui/icons-material/Save';
import { Form, Input, Select } from 'antd';
import { Button } from '@mui/material';
import { updateImageAsset } from 'services/dbhandler';
import { useRouter } from 'next/navigation';

const { Item } = Form;

interface EditImageAssetProps {
	imageAsset: any;
}

const EditImageAsset: React.FC<EditImageAssetProps> = ({ imageAsset }) => {
	const [hasChange, setHasChange] = useState(false);

	const router = useRouter();
	const [form] = Form.useForm();

	useEffect(() => {
		setHasChange(false);
		form.resetFields();
	}, [imageAsset]);

	const handleOnFinish = async (values: any) => {
		const updatedImageAsset = await updateImageAsset(
			imageAsset.id,
			values,
			null, 
			(err) => toast.error(err.response.data.message)
		);
		if (updatedImageAsset) {
			toast.success('Update imageAsset successfully');

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
			initialValues={{ name: imageAsset.name }}
			onValuesChange={() => setHasChange(true)}
		>
			<Item label='Name' name='name'>
				<Input />
			</Item>

			<Item>
				<Button disabled={!hasChange} type='submit' size='small' variant='outlined' startIcon={<SaveIcon />}>
					Save
				</Button>
			</Item>
		</Form>
	);
};

export default EditImageAsset;
