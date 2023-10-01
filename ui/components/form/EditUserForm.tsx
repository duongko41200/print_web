import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import SaveIcon from '@mui/icons-material/Save';
import { Form, Input, Select } from 'antd';
import { Button } from '@mui/material';
import { updateUser } from 'services/dbhandler';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@store/hooks';

const { Item } = Form;
const { Option } = Select;

interface EditUserFormProps {
	user: any;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ user }) => {
	const [hasChange, setHasChange] = useState(false);

	const currentUser = useAppSelector(state => state.app.currentUser);

	const router = useRouter();
	const [form] = Form.useForm();

	useEffect(() => {
		setHasChange(false);
		form.resetFields();
	}, [user]);

	const handleOnFinish = async (values: any) => {
		const updatedUser = await updateUser(user.id, values, null, (err) => toast.error(err.response.data.message));
		if (updatedUser) {
			toast.success('Update user successfully');

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
			initialValues={{ name: user.name, role: user.role }}
			onValuesChange={() => setHasChange(true)}
		>
			<Item label='Name' name='name'>
				<Input />
			</Item>
			<Item label='Role' name='role'>
				<Select disabled={currentUser.role !== 'owner'}>
					<Option value='user'>User</Option>
					<Option value='admin'>Admin</Option>
				</Select>
			</Item>

			<Item>
				<Button disabled={!hasChange} type='submit' size='small' variant='outlined' startIcon={<SaveIcon />}>
					Save
				</Button>
			</Item>
		</Form>
	);
};

export default EditUserForm;
