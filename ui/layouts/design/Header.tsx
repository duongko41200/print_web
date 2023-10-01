import React, { RefObject, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Socket } from 'socket.io-client';
import Link from 'next/link';

import Logout from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Divider, MenuItem as MenuItemMui } from '@mui/material';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import { UndoOutlined, RedoOutlined } from '@ant-design/icons';
import AddIcon from '@mui/icons-material/Add';
import { IconButton } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { Layout, Typography, Avatar as AntAvatar } from 'antd';
import Tooltip from '@mui/material/Tooltip';
import { Box, Flex } from 'theme-ui';
import { Avatar, AvatarGroup, Button, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIosNew';
import DesignInvitationForm from '@components/form/DesignInvitationForm';
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react';
import ListItemIcon from '@mui/material/ListItemIcon';

import { SocketContext } from '@pages/designs/[designId]';
import { useAppSelector } from '@store/hooks';
import FabricCanvasContext from '@components/canvas/CanvasContext';
import CustomDropdown from '@components/dropdown/Dropdown';
import { logout, updateDesign } from 'services/dbhandler';

import { getImageUrl } from '@utils/user';
import { confirmAlert } from 'react-confirm-alert';
import { useRouter } from 'next/navigation';

const { Header } = Layout;
const { Text, Title } = Typography;

const VISIBLE_AVATARS = 3;

interface MyHeaderProps {}

const MyHeader: React.FC<MyHeaderProps> = ({}) => {
	const socket: Socket = useContext(SocketContext);
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);
	const design = useAppSelector((state) => state.app.design);
	const router = useRouter();

	const [designName, setDesignName] = useState<string>(design?.name || '');
	const [joiners, setJoiners] = useState([]);

	// init design name
	useEffect(() => {
		if (!design) {
			return;
		}

		if (design.name === designName) {
			return;
		}

		setDesignName(design.name);
	}, [design]);

	const currentUser = useAppSelector((state) => state.app.currentUser);

	// update Joiners collab in header
	useEffect(() => {
		if (!socket || !currentUser) {
			return;
		}

		function updateJoiners(users: Array<any>) {
			// shift the current user to the first
			const index = users.findIndex((el) => el.id === currentUser.id);
			users.unshift(users.splice(index, 1)[0]);
			setJoiners([...users]);
		}

		socket.on('update-online-joiners', updateJoiners);

		return () => {
			socket.off('update-online-joiners', updateJoiners);
		};
	}, [socket, currentUser]);

	function onChangeDesignName(e: React.ChangeEvent<HTMLInputElement>) {
		setDesignName(e.target.value);
	}

	async function onSaveDesignName(e: React.FocusEvent<HTMLInputElement>) {
		if (e.target.value === design.name) {
			return;
		}

		// only update when having real change
		await updateDesign(design.id, { name: e.target.value }, null, (err) => toast.error(err.response.data.message));
	}

	const handleClickDownloadButton = (target: string, type: string) => {
		if (!canvas.current) {
			return toast.error('Something went wrong! Try reloading page');
		}

		if (target === 'canvas') {
			canvas.current.download(designName, type);
		}

		if (target === 'all-objects') {
			if (canvas.current.getObjects().length === 0) {
				return toast.warning('No elements on current design');
			}

			canvas.current.downloadObjects(designName, type, true);
		}

		if (target === 'objects') {
			if (canvas.current.getActiveObjects().length === 0) {
				return toast.warning('Please choose at least 1 element');
			}
			canvas.current.downloadObjects(designName, type, false);
		}
	};

	const hiddenJoiners = joiners.slice(VISIBLE_AVATARS);

	return (
		<Header
			style={{
				position: 'sticky',
				width: '100%',
				zIndex: 10,
				background: '#000',
			}}
		>
			<Flex
				className='header-inner'
				sx={{
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Box className='home-button'>
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

				<Box>
					<HeaderAction />
				</Box>

				<Flex
					className='design-name-container'
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
						value={designName}
						onBlur={onSaveDesignName}
						onChange={onChangeDesignName}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								event.target.blur();
							}
						}}
					/>
				</Flex>

				<Flex
					className='right-header'
					sx={{
						alignItems: 'center',
						columnGap: 25,
						justifyContent: 'flex-end',
					}}
				>
					<Flex sx={{ alignItems: 'center' }}>
						<AvatarGroup sx={{ zIndex: 999 }}>
							{joiners.slice(0, VISIBLE_AVATARS).map((el, index) => (
								<Tooltip key={index} title={el.name}>
									<Avatar
										sx={{
											width: 32,
											height: 32,
											cursor: 'pointer',
										}}
										key={el.name}
										alt={el.name}
										src={getImageUrl(el)}
									/>
								</Tooltip>
							))}
							{hiddenJoiners.length > 0 && (
								<Tooltip
									title={
										<div>
											{hiddenJoiners.map((el, index) => {
												return <div key={index}>{el.name}</div>;
											})}
										</div>
									}
								>
									<Avatar sx={{ width: 32, height: 32 }} sizes='small'>
										+{hiddenJoiners.length}
									</Avatar>
								</Tooltip>
							)}
						</AvatarGroup>

						<CustomDropdown
							toggle={
								<IconButton
									sx={{
										background: 'hsla(0,0%,100%,.07)',
										color: '#fff',
										transform: 'translateX(-8px)',
									}}
								>
									<AddIcon />
								</IconButton>
							}
							menu={<DesignInvitationForm />}
						/>
					</Flex>

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
											Download design
										</CDropdownToggle>
										<CDropdownMenu>
											<CDropdownItem
												onClick={() => handleClickDownloadButton('canvas', 'png')}
											>
												Download PNG image
											</CDropdownItem>
											<CDropdownItem
												onClick={() => handleClickDownloadButton('canvas', 'svg')}
											>
												Download SVG image
											</CDropdownItem>
											<CDropdownItem
												onClick={() => handleClickDownloadButton('canvas', 'json')}
											>
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

	const socket: Socket = useContext(SocketContext);
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

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
				title={isSaving ? 'Saving your design' : 'Your design is saved successfully'}
				children={
					<Box className='save-state-icon' sx={{ color: '#fff' }}>
						{isSaving ? <CloudSyncOutlinedIcon /> : <CloudDoneIcon />}
					</Box>
				}
			></Tooltip>
		</Flex>
	);
}

export default MyHeader;
