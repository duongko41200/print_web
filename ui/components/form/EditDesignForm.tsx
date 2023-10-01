import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import SaveIcon from '@mui/icons-material/Save';
import { Form, Input, Select } from 'antd';
import { Button } from '@mui/material';
import { updateDesign, updateUser } from 'services/dbhandler';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@store/hooks';

const { Item } = Form;

interface EditDesignFormProps {
	design: any;
}

const EditDesignForm: React.FC<EditDesignFormProps> = ({ design }) => {
	const [hasChange, setHasChange] = useState(false);

	const router = useRouter();
	const [form] = Form.useForm();

	useEffect(() => {
		setHasChange(false);
		form.resetFields();
	}, [design]);

	const handleOnFinish = async (values: any) => {
		const updatedDesign = await updateDesign(
			design.id,
			values,
			null, 
			(err) => toast.error(err.response.data.message)
		);
		if (updatedDesign) {
			toast.success('Update design successfully');

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
			initialValues={{ name: design.name }}
			onValuesChange={() => setHasChange(true)}
		>
			<Item label='Name' name='name'>
				<Input />
			</Item>
			<Item label='Description' name='description'>
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

export default EditDesignForm;
