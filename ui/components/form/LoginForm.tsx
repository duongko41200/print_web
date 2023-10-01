import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

import { LockOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';

import { setCurrentUser } from '../slice/AppSlice';
import { useAppDispatch } from '@store/hooks';
import Link from 'next/link';
import { login } from 'services/dbhandler';

const { Item } = Form;
interface Values {
	email: string;
	password: string;
}

export default function LoginForm() {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);

	const dispatch = useAppDispatch();
	const router = useRouter();

	const handleOnSubmit = async (values: Values) => {
		setLoading(true);
		await login(
			values,
			(data) => {
				setSuccess(true);
				dispatch(setCurrentUser(data.data));

				setTimeout(() => {
					router.replace('/');
				}, 1000);
			},
			(err) => {
				toast.error(err.response?.data?.message);
				setSuccess(false);
			}
		);
		setLoading(false);
	};

	return (
		<Form
			initialValues={{ email: '', password: '' }}
			style={{ minWidth: 300 }}
			layout='vertical'
			onFinish={handleOnSubmit}
		>
			<Item
				style={{ marginBottom: 30 }}
				name='email'
				rules={[
					{ required: true, message: 'Please input your email!' },
					{
						type: 'email',
						message: 'Please provide a valid email!',
					},
				]}
			>
				<Input size='large' prefix={<UserOutlined />} placeholder='Your email' />
			</Item>

			<Item
				style={{ marginBottom: 40 }}
				name='password'
				rules={[
					{ required: true, message: 'Please input your Password!' },
					{
						validator: async (_, value) => {
							if (value && value.length < 8) {
								throw new Error('Password must be at least 8 characters');
							}
						},
					},
				]}
			>
				<Input size='large' prefix={<LockOutlined />} type='password' placeholder='Password' />
			</Item>

			<Item>
				<Button
					loading={loading}
					icon={success ? <CheckCircleOutlined /> : null}
					style={{ width: '100%', fontWeight: 500, background: '#7C73C0' }}
					htmlType='submit'
					type='primary'
				>
					{success ? '' : 'Log in using account'}
				</Button>
			</Item>

			<Item style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
				Don't have an account? <Link href='/auth/signup'>Sign up</Link>
			</Item>

			{/* <Item style={{ textAlign: 'center' }}>
				<Link style={{ fontSize: 14 }} href='/auth/forgot-password'>
					Forgot password
				</Link>
			</Item> */}
		</Form>
	);
}
