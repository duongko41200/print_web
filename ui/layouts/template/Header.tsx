import React, { RefObject, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Socket } from 'socket.io-client';
import Link from 'next/link';

import Logout from '@mui/icons-material/Logout';
import ListItemIcon from '@mui/material/ListItemIcon';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Divider, MenuItem as MenuItemMui } from '@mui/material';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { UndoOutlined, RedoOutlined } from '@ant-design/icons';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import { IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Layout, Typography, Avatar as AntAvatar, Select } from 'antd';
import Tooltip from '@mui/material/Tooltip';
import { Box, Flex } from 'theme-ui';
import { Avatar, Button, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';
import { Switch, Button as AntdButton } from 'antd';
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react';

import { useAppSelector } from '@store/hooks';
import FabricCanvasContext from '@components/canvas/CanvasContext';
import {
	createTemplatePermission,
	getPermissionsInTemplate,
	updateTemplatePermission,
	updateTemplate,
	logout,
} from 'services/dbhandler';
import CustomDropdown from '@components/dropdown/Dropdown';

import { getImageUrl } from '@utils/user';
import { SocketContext } from '@pages/templates/[templateId]';
import { confirmAlert } from 'react-confirm-alert';
import { useRouter } from 'next/navigation';

const { Header } = Layout;
const { Text, Title } = Typography;

interface HeaderProps {}

const TemplateHeader: React.FC<HeaderProps> = ({}) => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);
	const template = useAppSelector((state) => state.app.template);
	const router = useRouter();

	const [templateName, setTemplateName] = useState<string>(template?.name || '');

	// init template name
	useEffect(() => {
		if (!template) {
			return;
		}

		if (template.name === templateName) {
			return;
		}

		setTemplateName(template.name);
	}, [template]);

	const currentUser = useAppSelector((state) => state.app.currentUser);

	function onChangeTemplateName(e: React.ChangeEvent<HTMLInputElement>) {
		setTemplateName(e.target.value);
	}

	async function onSaveTemplateName(e: React.FocusEvent<HTMLInputElement>) {
		if (e.target.value === template.name) {
			return;
		}

		// only update when having real change
		await updateTemplate(template.id, { name: e.target.value }, null, (err) =>
			toast.error(err.response.data.message || 'Something went wrong')
		);
	}

	const handleClickDownloadButton = (target: string, type: string) => {
		if (!canvas.current) {
			return toast.error('Something went wrong! Try reloading page');
		}

		if (target === 'canvas') {
			canvas.current.download(templateName, type);
		}

		if (target === 'all-objects') {
			if (canvas.current.getObjects().length === 0) {
				return toast.warning('No elements on current template');
			}

			canvas.current.downloadObjects(templateName, type, true);
		}

		if (target === 'objects') {
			if (canvas.current.getActiveObjects().length === 0) {
				return toast.warning('Please choose at least 1 element');
			}
			canvas.current.downloadObjects(templateName, type, false);
		}
	};

	return (
		<Header
			style={{
				position: 'sticky',
				width: '100%',
				zIndex: 10,
				background: '#000',
			}}
		>
			{/* Left side of header */}
			<Flex
				sx={{
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Box>
					<Link href='/'>
						<Button
							variant='text'
							startIcon={<ArrowBackIcon />}
							sx={{
								color: '#fff',
								textTransform: 'capitalize',
								fontWeight: 'bold',
							}}
						>
							Home
						</Button>
					</Link>
				</Box>

				<Box className='header-undo-redo'>
					<HeaderAction />
				</Box>

				{/* Middle of header */}
				<Flex
					sx={{
						alignItems: 'center',
						justifyContent: 'center',
						flexGrow: 1,
					}}
				>
					<TextField
						fullWidth
						variant='standard'
						type='text'
						size='small'
						name='template-name'
						InputProps={{
							disableUnderline: true,
						}}
						sx={{
							maxWidth: '300px',
							fontSize: '15px',
							textAlign: 'left',
							color: '#fff',
							'& input': {
								padding: '8px',
								textAlign: 'center',
								color: '#fff',
								border: 'none',
								borderRadius: '5px',
							},
							'& input:hover': {
								border: '1px solid #ccc',
							},
							'& input:focus': {
								border: '1px solid #f5f5f5',
							},
							'& .MuiInputBase-input': {
								overflow: 'hidden',
								textOverflow: 'ellipsis',
							},
						}}
						value={templateName}
						onBlur={onSaveTemplateName}
						onChange={onChangeTemplateName}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								event.target.blur();
							}
						}}
					/>
				</Flex>

				{/* Right side of header */}
				<Flex
					sx={{
						alignItems: 'center',
						columnGap: 25,
						justifyContent: 'flex-end',
					}}
				>
					{/* Show permission template hier */}
					<Box>
						<TemplatePermission />
					</Box>

					<Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
						<CDropdown autoClose='outside'>
							<CDropdownToggle
								style={{
									color: '#fff',
									background: 'hsla(0,0%,100%,.07)',
								}}
							>
								<DownloadIcon />
							</CDropdownToggle>

							<CDropdownMenu>
								<CDropdownItem style={{ height: 40, display: 'flex', alignItems: 'center' }}>
									<CDropdown direction='dropstart'>
										<CDropdownToggle
											color='light'
											style={{ background: 'transparent', border: 'none', paddingLeft: 0 }}
										>
											Download template
										</CDropdownToggle>
										<CDropdownMenu>
											<CDropdownItem onClick={() => handleClickDownloadButton('canvas', 'png')}>
												Download PNG image
											</CDropdownItem>
											<CDropdownItem onClick={() => handleClickDownloadButton('canvas', 'svg')}>
												Download SVG image
											</CDropdownItem>
											<CDropdownItem onClick={() => handleClickDownloadButton('canvas', 'json')}>
												Download JSON
											</CDropdownItem>
										</CDropdownMenu>
									</CDropdown>
								</CDropdownItem>
								<CDropdownItem style={{ height: 40, display: 'flex', alignItems: 'center' }}>
									<CDropdown direction='dropstart'>
										<CDropdownToggle
											color='light'
											style={{ background: 'transparent', border: 'none', paddingLeft: 0 }}
										>
											Download elements PNG image
										</CDropdownToggle>
										<CDropdownMenu>
											<CDropdownItem
												onClick={() => handleClickDownloadButton('all-objects', 'png')}
											>
												Download all elements
											</CDropdownItem>
											<CDropdownItem onClick={() => handleClickDownloadButton('objects', 'png')}>
												Download selected elements
											</CDropdownItem>
										</CDropdownMenu>
									</CDropdown>
								</CDropdownItem>
							</CDropdownMenu>
						</CDropdown>
					</Flex>

					<Box>
						<CustomDropdown
							closeOnClick
							toggle={
								<AntAvatar
									size={50}
									src={getImageUrl(currentUser)}
									style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
								/>
							}
							menu={
								<div>
									<Flex
										padding='8px 10px 15px'
										sx={{
											width: 200,
											alignItems: 'center',
											justifyContent: 'flex-start',
										}}
									>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<AntAvatar size={40} src={getImageUrl(currentUser)} />
										</Box>

										<Box sx={{ paddingLeft: 9 }}>
											<Flex sx={{ flexDirection: 'column' }}>
												<Box>
													<Title
														ellipsis={{ tooltip: currentUser?.name }}
														style={{ fontSize: '18px' }}
													>
														{currentUser?.name}
													</Title>
												</Box>
												<Box>
													<Text style={{ fontSize: 13, textTransform: 'capitalize' }}>
														{currentUser?.role}
													</Text>
												</Box>
											</Flex>
										</Box>
									</Flex>
									<Divider />
									<MenuItemMui onClick={() => router.push('/profile')}>
										<ListItemIcon>
											<AccountCircleIcon fontSize='small' />
										</ListItemIcon>
										Profile
									</MenuItemMui>
									<Divider />
									<MenuItemMui
										className='logout-button'
										onClick={() => {
											confirmAlert({
												message: 'Are you sure to logout.',
												buttons: [
													{
														label: 'Confirm',
														onClick: () => {
															logout(
																() => router.replace('/auth/login'),
																(err) => toast.error(err.response.data.message)
															);
														},
													},
													{
														label: 'Cancel',
														onClick: () => {},
													},
												],
											});
										}}
									>
										<ListItemIcon>
											<Logout fontSize='small' />
										</ListItemIcon>
										Logout
									</MenuItemMui>
								</div>
							}
						/>
					</Box>
				</Flex>
			</Flex>
		</Header>
	);
};

function HeaderAction() {
	const [isSaving, setIsSaving] = useState(false);

	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);
	const socket: Socket = useContext(SocketContext);

	const history = useAppSelector((state) => state.canvas.history);

	useEffect(() => {
		if (!socket) {
			return;
		}

		function updateSavingStatus(data: { value: string }) {
			if (data.value === 'saving') {
				setIsSaving(true);
			}

			if (data.value === 'saved') {
				setIsSaving(false);
			}
		}

		socket.on('saving-status', updateSavingStatus);

		return () => {
			socket.off('saving-status', updateSavingStatus);
		};
	}, [socket]);

	return (
		<Flex padding='0 40px' sx={{ columnGap: 30 }}>
			<Flex className='undo-redo-container' sx={{ alignItems: 'center' }}>
				<Box>
					<IconButton
						disabled={!(history.past.length > 0)}
						onClick={() => canvas.current.undo()}
						size='small'
						style={{ color: '#fff' }}
					>
						<UndoOutlined />
					</IconButton>
				</Box>

				<Box>
					<IconButton
						disabled={!(history.future.length > 0)}
						onClick={() => canvas.current.redo()}
						size='small'
						style={{ color: '#fff' }}
					>
						<RedoOutlined />
					</IconButton>
				</Box>
			</Flex>

			<Tooltip
				placement='right-end'
				arrow
				title={isSaving ? 'Saving your template' : 'Your template is saved successfully'}
				children={
					<Box className='save-state-icon' sx={{ color: '#fff' }}>
						{isSaving ? <CloudSyncOutlinedIcon /> : <CloudDoneIcon />}
					</Box>
				}
			></Tooltip>
		</Flex>
	);
}

function TemplatePermission() {
	const template = useAppSelector((state) => state.app.template);
	const currentUser = useAppSelector((state) => state.app.currentUser);

	const [isPublic, setIsPublic] = useState<boolean>(template.isPublic);

	const handleOnChangeSwitch = async (checked: boolean) => {
		setIsPublic(checked);
		await updateTemplate(template.id, { isPublic: checked }, null, (err) =>
			toast.error(err.response.data.message || 'Something went wrong')
		);
	};

	return (
		<CustomDropdown
			toggle={
				<AntdButton
					style={{ background: 'transparent', color: '#f5f5f5' }}
					icon={isPublic ? <PublicIcon fontSize='small' /> : <LockIcon fontSize='small' />}
					size='middle'
				/>
			}
			menu={
				<Flex sx={{ flexDirection: 'column', width: 400 }}>
					<Flex sx={{ alignItems: 'center', columnGap: '10px' }}>
						<Box sx={{ padding: '12px 16px' }}>
							<Text>Public template</Text>
						</Box>
						<Box>
							<Switch
								disabled={currentUser.id != template.user.id}
								checked={isPublic}
								onChange={handleOnChangeSwitch}
							/>
						</Box>
					</Flex>

					{!isPublic && (
						<Box>
							<ShareForm />
						</Box>
					)}
				</Flex>
			}
		/>
	);
}

function ShareForm() {
	const [email, setEmail] = useState<string>('');
	const [isValidEmail, setIsValidEmail] = useState(true);
	const [permissions, setPermissions] = useState([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const template = useAppSelector((state) => state.app.template);
	const currentUser = useAppSelector((state) => state.app.currentUser);

	useEffect(() => {
		if (!template) {
			return;
		}

		const fetchData = async () => {
			setIsLoading(true);
			const permissions = await getPermissionsInTemplate(template.id, null, (err) =>
				toast.error(err.response.data.message || 'Something went wrong')
			);
			setPermissions(permissions || []);
			setIsLoading(false);
		};

		fetchData();
	}, [template]);

	const handleChangePermission: any = async (id: string, value: string) => {
		await updateTemplatePermission(id, { type: value }, null, (err) =>
			toast.error(err.response?.data?.message || 'Something went wrong')
		);
	};

	const handleChangeTextfield = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		setEmail(event.target.value);
	};

	const handleBlurTextfield = () => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		setIsValidEmail(emailRegex.test(email));
	};

	const addSharedPeople = async () => {
		if (!isValidEmail && !email) {
			return;
		}

		const newPermission = await createTemplatePermission({ email, templateId: template.id }, null, (err) =>
			toast.error(err.response.data.message || 'Something went wrong')
		);
		if (newPermission) {
			toast.success('Add shared people successfully');
			setPermissions([...permissions, newPermission]);
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
			{/* Email input field */}
			{currentUser.id == template.user.id && (
				<Box sx={{ width: '100%' }}>
					<Box sx={{ flexGrow: 1 }}>
						<TextField
							fullWidth
							value={email}
							size='small'
							onChange={handleChangeTextfield}
							onBlur={handleBlurTextfield}
							placeholder='Add emails'
						/>
					</Box>
				</Box>
			)}

			{/* List of shared users */}
			<Box sx={{ width: '100%' }}>
				<Flex
					sx={{
						flexDirection: 'column',
						alignItems: 'flex-start',
						justifyContent: 'flex-start',
					}}
				>
					<Text strong>Shared people</Text>

					<Box sx={{ width: '100%', overflowY: 'auto', maxHeight: 300 }}>
						<Box
							padding='10px 6px'
							marginBottom={10}
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
									<Avatar src={getImageUrl(template.user)} />
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
												tooltip: template.user.name,
											}}
											strong
										>
											{template.user.name}
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
										disabled={currentUser.id != template.user.id}
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

			{/* Send button */}
			{currentUser.id == template.user.id && (
				<Box sx={{ width: '100%' }}>
					<Button variant='contained' fullWidth onClick={addSharedPeople}>
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
						style={{ width: '110px' }}
						onChange={handleChangeAccess}
						options={[
							{ value: 'view', label: 'Can view' },
							{ value: 'none', label: 'Not share' },
						]}
					/>
				</Box>
			</Flex>
		</Box>
	);
}

export default TemplateHeader;
