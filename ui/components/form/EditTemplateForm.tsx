import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import SaveIcon from '@mui/icons-material/Save';
import { Form, Input, Select } from 'antd';
import { Button } from '@mui/material';
import { updateTemplate, updateUser } from 'services/dbhandler';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@store/hooks';

const { Item } = Form;

interface EditTemplateFormProps {
	template: any;
}

const EditTemplateForm: React.FC<EditTemplateFormProps> = ({ template }) => {
	const [hasChange, setHasChange] = useState(false);

	const router = useRouter();
	const [form] = Form.useForm();

	useEffect(() => {
		setHasChange(false);
		form.resetFields();
	}, [template]);

	const handleOnFinish = async (values: any) => {
		const updatedTemplate = await updateTemplate(
			template.id,
			values,
			null, 
			(err) => toast.error(err.response.data.message)
		);
		if (updatedTemplate) {
			toast.success('Update template successfully');

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
			initialValues={{ name: template.name }}
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

export default EditTemplateForm;
