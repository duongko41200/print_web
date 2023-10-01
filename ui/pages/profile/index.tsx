import React, { ChangeEventHandler, MouseEventHandler, useRef, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { toast } from 'react-toastify';

import { Button, Form, Input, Typography } from 'antd';
import { Flex, Box } from 'theme-ui';

import ProtectedPage from '@components/auth/ProtectedPage';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import GeneralLayout from '@layouts/general/GeneralLayout';
import { useAppSelector } from '@store/hooks';

import { updateMe, updateMyPassword } from 'services/dbhandler';
import { useRouter } from 'next/navigation';
import { setAuthTokenCookie } from '@utils/cookie';

import getConfig from 'next/config';
import { getImageUrl } from '@utils/user';
const { publicRuntimeConfig } = getConfig();

const { Title, Text, Paragraph } = Typography;
const { Item } = Form;
dayjs.locale('vi');

interface ProfileProps {}

const Profile: React.FC<ProfileProps> = ({}) => {
	const fileInputRef = useRef(null);
	const router = useRouter();

	const currentUser = useAppSelector((state) => state.app.currentUser);

	if (!currentUser) {
		return <>...</>;
	}

	const handleClickUpload = () => {
		fileInputRef.current.click();
	};

	const handleChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const formData = new FormData();
		formData.append('image', e.target.files[0]);

		await updateMe(
			formData,
			(data) => {
				toast.success('Upload image successfully');
				setTimeout(() => {
					router.refresh();
				}, 2000);
			},
			(err) => toast.error(err.response.data.message)
		);
	};

	return (
		<ProtectedPage>
			<GeneralLayout>
				<Box className='header-content'>
					<Title>Your account</Title>
				</Box>

				<Flex sx={{ flex: '1 1' }}>
					<Flex
						className='profile-card'
						sx={{
							alignItems: 'center',
							flexDirection: 'column',
							border: '1px solid #ccc',
							borderRadius: 15,
							width: 300,
							height: 'min-content',
						}}
					>
						<Box
							className='image'
							sx={{
								margin: 20,
								overflow: 'hidden',
								position: 'relative',
								borderRadius: '100%',
								':hover': {
									'& .upload-button': {
										display: 'flex',
									},
								},
							}}
						>
							<img
								loading='lazy'
								height={250}
								style={{ width: '100%', objectFit: 'contain' }}
								src={getImageUrl(currentUser)}
								alt=''
							/>
							<input
								type='file'
								ref={fileInputRef}
								onChange={handleChangeImage}
								style={{ display: 'none' }}
							/>
							<Flex
								className='upload-button'
								sx={{
									alignItems: 'center',
									justifyContent: 'center',
									background: '#ddd',
									opacity: 0.5,
									position: 'absolute',
									left: 0,
									top: 0,
									zIndex: 999,
									width: '100%',
									height: '100%',
									display: 'none',
								}}
							>
								<Button onClick={handleClickUpload}>Upload</Button>
							</Flex>
						</Box>

						<Box className='name' sx={{ textAlign: 'center', padding: '8px 20px' }}>
							<Text strong style={{ fontSize: '18px' }}>
								{currentUser.name}
							</Text>
						</Box>

						<Box className='role'>
							<Paragraph>{currentUser.role}</Paragraph>
						</Box>

						<Box className='date-join' sx={{ padding: '8px 20px 20px' }}>
							<Text style={{ fontWeight: 300 }}>Joined on </Text>
							<Text>{dayjs(currentUser.createdAt).format('DD/MM/YYYY')}</Text>
						</Box>
					</Flex>

					<Flex
						className='user-forms'
						paddingLeft={30}
						sx={{ flexDirection: 'column', width: 450, rowGap: 30 }}
					>
						<Box className='basic-info-form'>
							<BasicInfoForm user={currentUser} />
						</Box>

						<Box sx={{ borderBottom: '1px solid #f5f5f5' }}></Box>

						{!currentUser.oauthProvider && (
							<Box className='password-form'>
								<PasswordForm />
							</Box>
						)}
					</Flex>
				</Flex>
			</GeneralLayout>
		</ProtectedPage>
	);
};

function BasicInfoForm({ user }) {
	const [hasChange, setHasChange] = useState(false);

	const [form] = Form.useForm();

	const handleOnSubmit = async (values: any) => {
		await updateMe(
			values,
			(data) => {
				toast.success('Update successfully');
				setHasChange(false);
			},
			(err) => toast.error(err.response.data.message)
		);
	};

	return (
		<Form
			form={form}
			layout='vertical'
			initialValues={{ name: user.name, email: user.email }}
			onChange={() => setHasChange(true)}
			onFinish={handleOnSubmit}
		>
			<Item label='Name' name='name' rules={[{ required: true }]}>
				<Input />
			</Item>

			<Item label='Email' name='email' rules={[{ required: true }]}>
				<Input disabled={user.oauthProvider} type='email' />
			</Item>

			<Item>
				<Button disabled={!hasChange} htmlType='submit' type='primary'>
					Save
				</Button>
			</Item>
		</Form>
	);
}

function PasswordForm() {
	const [hasChange, setHasChange] = useState(false);

	const [form] = Form.useForm();

	const handleOnSubmit = async (values: any) => {
		await updateMyPassword(
			values,
			(data) => {
				setAuthTokenCookie(data.token);
				toast.success('Update password successfully');
				form.resetFields();
			},
			(err) => toast.error(err.response.data.message)
		);
	};

	return (
		<Form
			form={form}
			layout='vertical'
			initialValues={{ currentPassword: '', password: '', passwordConfirm: '' }}
			onChange={() => setHasChange(true)}
			onFinish={handleOnSubmit}
		>
			<Item label='Current password' name='currentPassword' rules={[{ required: true }]}>
				<Input type='password' />
			</Item>
			<Item label='Password' name='password' rules={[{ required: true }]}>
				<Input type='password' />
			</Item>

			<Item label='Confirm password' name='passwordConfirm' rules={[{ required: true }]}>
				<Input type='password' />
			</Item>

			<Item>
				<Button disabled={!hasChange} htmlType='submit' type='primary'>
					Save
				</Button>
			</Item>
		</Form>
	);
}

export default ProtectedRoute(Profile);
