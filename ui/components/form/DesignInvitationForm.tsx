import React, { RefObject, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

import { Box, Flex } from 'theme-ui';
import { Avatar, Button, TextField } from '@mui/material';
import { Typography } from 'antd';
import { Select } from 'antd';

import { useAppSelector } from '@store/hooks';
import { getAuthTokenFromCookie } from 'utils/cookie';

import getConfig from 'next/config';
import { getImageUrl } from '@utils/user';
const { publicRuntimeConfig } = getConfig()

const { Text } = Typography;

export default function InvitationForm() {
	const [access, setAccess] = useState('view');
	const [email, setEmail] = useState('');
	const [isValidEmail, setIsValidEmail] = useState(true);
	const [permissions, setPermissions] = useState([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const design = useAppSelector((state) => state.app.design);
	const currentUser = useAppSelector((state) => state.app.currentUser);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			const permissions = await getPermissionsInDesign(design.id);
			setPermissions(permissions);
			setIsLoading(false);
		};

		fetchData();
	}, []);

	const handleChangeAccess = (value: string) => {
		setAccess(value);
	};

	const handleChangePermission: any = async (id: string, value: string) => {
		await updatePermission(id, value);
	};

	const handleChangeTextfield = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setEmail(event.target.value);
	};

	const handleBlurTextfield = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		setIsValidEmail(emailRegex.test(email));
	};

	const sendEmailInvitation = async () => {
		if (!isValidEmail && !email) {
			return;
		}

		const permission = await sendInvitation(email, access, design.id);
		if (permission) {
			toast.success('Send invitation successfully!');
			setPermissions([...permissions, permission]);
		}
	};

	return (
		<Flex
			sx={{
				padding: '10px 16px',
				width: '400px',
				flexDirection: 'column',
				rowGap: '10px',
				alignItems: 'flex-start',
				justifyContent: 'space-between',
				position: 'relative',
			}}
		>
			{currentUser.id == design.user.id && (
				<Box sx={{ width: '100%' }}>
					<Flex
						sx={{
							alignItems: 'flex-start',
							justifyContent: 'space-between',
						}}
					>
						<Box sx={{ flexGrow: 1 }}>
							<TextField
								fullWidth
								size='small'
								type='email'
								onChange={handleChangeTextfield}
								placeholder='Add emails'
								error={!isValidEmail}
								helperText={!isValidEmail && 'Invalid email address'}
								onBlur={handleBlurTextfield}
							/>
						</Box>

						<Box>
							<Select
								size='large'
								defaultValue='view'
								style={{ width: '80px' }}
								onChange={handleChangeAccess}
								options={[
									{ value: 'view', label: 'View' },
									{ value: 'edit', label: 'Edit' },
								]}
							/>
						</Box>
					</Flex>
				</Box>
			)}

			<Box sx={{ width: '100%' }}>
				<Flex
					sx={{
						flexDirection: 'column',
						alignItems: 'flex-start',
						justifyContent: 'flex-start',
					}}
				>
					<Text strong>Accessed people</Text>

					<Box sx={{ width: '100%', overflowY: 'auto', maxHeight: 300 }}>
						<Box
							padding='10px 6px'
							sx={{
								background: '#f5f5f5',
								borderRadius: '8px',
							}}
						>
							<Flex
								sx={{
									alignItems: 'center',
									justifyContent: 'flex-start',
									columnGap: '10px',
								}}
							>
								<Box>
									<Avatar src={getImageUrl(design.user)} />
								</Box>
								<Flex
									sx={{
										alignItems: 'flex-start',
										justifyContent: 'space-between',
										flexDirection: 'column',
										padding: '0 5px',
										width: '-webkit-fill-available',
									}}
								>
									<Box
										sx={{
											width: '-webkit-fill-available',
										}}
									>
										<Text
											ellipsis={{
												tooltip: design.user.name,
											}}
											strong
										>
											{design.user.name}
										</Text>
									</Box>
									<Box
										sx={{
											width: '-webkit-fill-available',
										}}
									>
										<Text>Creator</Text>
									</Box>
								</Flex>
							</Flex>
						</Box>

						{isLoading ? (
							<div>Loading...</div>
						) : (
							permissions.map((el, index) => {
								return (
									<PermissionItem
										disabled={currentUser.id != design.user.id}
										id={el.id}
										key={index}
										name={el.user.name}
										email={el.user.email}
										type={el.type}
										status={el.status}
										image={getImageUrl(el.user)}
										onChange={handleChangePermission}
									/>
								);
							})
						)}
					</Box>
				</Flex>
			</Box>

			{currentUser.id == design.user.id && (
				<Box sx={{ width: '100%' }}>
					<Button variant='contained' fullWidth onClick={sendEmailInvitation}>
						Send
					</Button>
				</Box>
			)}
		</Flex>
	);
}

function PermissionItem({ id, name, email, status, type, onChange, image, disabled }) {
	const handleChangeAccess = (value: string) => {
		onChange(id, value);
	};

	return (
		<Box
			padding='10px 6px'
			sx={{
				':hover': { background: '#f5f5f5' },
				borderRadius: '8px',
			}}
		>
			<Flex
				sx={{
					alignItems: 'center',
					justifyContent: 'space-between',
				}}
			>
				<Box sx={{ flexGrow: 1, width: '100px' }}>
					<Flex
						sx={{
							alignItems: 'center',
							justifyContent: 'flex-start',
							columnGap: '10px',
						}}
					>
						<Box>
							<Avatar src={image} />
						</Box>
						<Flex
							sx={{
								alignItems: 'flex-start',
								justifyContent: 'space-between',
								flexDirection: 'column',
								padding: '0 5px',
								width: '-webkit-fill-available',
							}}
						>
							<Box sx={{ width: '-webkit-fill-available' }}>
								<Text ellipsis={{ tooltip: name }} strong>
									{name}
								</Text>
							</Box>
							<Box sx={{ width: '-webkit-fill-available' }}>
								<Text italic={status === 'pending'} ellipsis={{ tooltip: email }}>
									{status === 'pending' ? 'Pending' : email}
								</Text>
							</Box>
						</Flex>
					</Flex>
				</Box>

				<Box>
					<Select
						disabled={disabled}
						size='middle'
						defaultValue={type}
						style={{ width: '110px', zIndex: 10000 }}
						onChange={handleChangeAccess}
						options={[
							{ value: 'view', label: 'Can view' },
							{ value: 'edit', label: 'Can edit' },
							{ value: 'none', label: 'Not share' },
						]}
					/>
				</Box>
			</Flex>
		</Box>
	);
}

async function updatePermission(id: string, type: string) {
	try {
		const token = getAuthTokenFromCookie();

		const url = `${publicRuntimeConfig.API_URL}/api/v1/designpermissions/${id}`;
		const res = await axios.patch(
			url,
			{ type },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (res.data.status === 'success') {
			return res.data.data;
		}

		return null;
	} catch (err) {
		console.log(err);
		toast.error(err.response.data.message);
	}
}

async function getPermissionsInDesign(designId: string) {
	try {
		const token = getAuthTokenFromCookie();

		const url = `${publicRuntimeConfig.API_URL}/api/v1/designs/${designId}/permissions`;
		const res = await axios.get(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (res.data.status === 'success') {
			return res.data.data;
		}

		return null;
	} catch (err) {
		console.log(err);
		toast.error(err.response?.data?.message);
	}
}

async function sendInvitation(email: string, access: string, designId: string) {
	try {
		const token = getAuthTokenFromCookie();

		const url = `${publicRuntimeConfig.API_URL}/api/v1/designpermissions`;
		const res = await axios.post(
			url,
			{ email, access, designId },
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (res.data.status === 'success') {
			return res.data.data;
		}

		return null;
	} catch (err) {
		console.log(err);
		toast.error(err.response?.data?.message || err);
	}
}
