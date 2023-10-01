import React, { useState, useEffect, useRef } from 'react';
import ReactCSS from 'reactcss';

import { confirmAlert } from 'react-confirm-alert';

// antd
import { Button } from 'antd';
import {
	HomeOutlined,
	ProjectOutlined,
	AntDesignOutlined,
	SearchOutlined,
	UserOutlined,
	HeartOutlined,
} from '@ant-design/icons';
import { Avatar, Typography, Input } from 'antd';
import { Layout, theme } from 'antd';

// mui
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Flex, Box } from 'theme-ui';
import { Divider, MenuItem as MenuItemMui } from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import ListItemIcon from '@mui/material/ListItemIcon';

// custom
import CustomSider from '@components/sider/CustomSider';
import CustomMenu from '@components/menu/CustomMenu';
import { MenuItem, getMenuItem } from '@components/menu/CustomMenu';
import { useAppSelector } from '@store/hooks';
import CustomDropdown from '@components/dropdown/Dropdown';
import { IconButton } from '@mui/material';
import ProductMenu from '@components/menu/ProductMenu';

import { createDesignFromProduct, logout } from 'services/dbhandler';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import DesignMenu from '@components/menu/DesignMenu';

import { getImageUrl } from '@utils/user';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

interface GeneralLayoutProps {
	children: React.ReactNode;
}

// MENU
const items: MenuItem[] = [
	getMenuItem('Home', '/', <HomeOutlined />),
	getMenuItem('Projects', '/projects', <ProjectOutlined />),
	getMenuItem('Templates', '/templates', <AntDesignOutlined />),
];

// HEADER
export function Logo() {
	return (
		<Flex sx={{ alignItems: 'center', justifyContent: 'flex-start' }}>
			<Box>
				<img loading='lazy' src='/static/images/icons/svg/logo.svg' width={64} height={64} alt='logo' />
			</Box>
			<Box>
				<div style={{ fontFamily: 'Pacifico', fontSize: '18px' }}>Hust Maker</div>
			</Box>
		</Flex>
	);
}

export function HeaderAction() {
	const createNewDesign = async (product: any) => {
		const newDesign = await createDesignFromProduct(product.id, null, (err) =>
			toast.error(err.response.data.message)
		);
		if (newDesign) {
			window.open(`/designs/${newDesign.id}`, '_blank');
		}
	};

	const [query, setQuery] = useState('');

	const [showDropdown, setShowDropdown] = useState<boolean>(false);
	const dropdownRef = useRef<HTMLElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		document.addEventListener('click', handleClick);

		return () => {
			// Remove the click event listener when the component is unmounted
			document.removeEventListener('click', handleClick);
		};
	}, []);

	const handleClick = (event: MouseEvent) => {
		// Check if the clicked element is within the component (input or dropdown)
		if (!inputRef.current.contains(event.target as Node) && !dropdownRef.current?.contains(event.target as Node)) {
			setShowDropdown(false);
		}
	};

	return (
		<Flex
			sx={{
				alignItems: 'center',
				justifyContent: 'center',
				columnGap: '10px',
			}}
		>
			<Box>
				<div style={{ position: 'relative', width: '300px' }} ref={inputRef}>
					<Input
						onChange={(e) => setQuery(e.target.value)}
						size='large'
						placeholder='Search your designs'
						prefix={<SearchOutlined />}
						onFocus={() => setShowDropdown(true)}
						onBlur={(e) => {
							if (!dropdownRef.current.contains(e.relatedTarget)) {
								setShowDropdown(false);
							}
						}}
					/>

					{showDropdown && (
						<Flex
							ref={dropdownRef}
							sx={{
								boxShadow: 'rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px',
								position: 'absolute',
								left: 0,
								background: '#fff',
								flexDirection: 'column',
								maxHeight: '500px',
								overflowY: 'auto',
								zIndex: 19999,
								transform: 'translateY(-10px)',
							}}
						>
							<DesignMenu query={query} />
						</Flex>
					)}
				</div>
			</Box>

			<Box>
				<CustomDropdown
					toggle={
						<Button type='primary' size='large'>
							Create new design
						</Button>
					}
					menu={<ProductMenu onSelect={async (product) => await createNewDesign(product)} />}
				/>
			</Box>
		</Flex>
	);
}

export function HeaderIcon() {
	return (
		<Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
			<Box>
				<IconButton>
					<NotificationsIcon />
				</IconButton>
			</Box>
		</Flex>
	);
}

const GeneralLayout: React.FC<GeneralLayoutProps> = ({ children }) => {
	const {
		token: { colorBgContainer },
	} = theme.useToken();

	const [collapsed, setCollapsed] = useState(false);
	const currentUser = useAppSelector((state) => state.app.currentUser);
	const router = useRouter();

	if (!currentUser) {
		return <>...</>;
	}

	if (currentUser && ['owner', 'admin'].includes(currentUser.role)) {
		if (!items.find((el) => el.key === '/accounts')) {
			items.push(getMenuItem('Accounts', '/accounts', <UserOutlined />));
		}
		if (!items.find((el) => el.key === '/products')) {
			items.push(getMenuItem('Products', '/products', <HeartOutlined />));
		}
	}

	// PROFILE CSS TRANSITION STYLES
	const profileStyle = ReactCSS({
		default: {
			default: {
				flex: 1,
				paddingLeft: 10,
				transition: 'opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),margin 0.3s,color 0.3s, width: 3s',
			},
			collapsed: {
				width: 0,
				opacity: 0,
				overflow: 'hidden',
				transition: 'opacity 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),margin 0.3s,color 0.3s, width: 0.3s',
			},
		},
	});

	return (
		<Layout style={{ height: '100vh', overflow: 'hidden' }}>
			<Header
				style={{
					position: 'sticky',
					width: '100%',
					zIndex: 1000,
					boxShadow: '0 2px 4px -1px rgba(57,76,96,.15)',
					background: colorBgContainer,
				}}
			>
				<Flex
					sx={{
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<Box>
						<Logo />
					</Box>

					<Flex
						sx={{
							alignItems: 'center',
							justifyContent: 'flex-end',
							columnGap: '20px',
						}}
					>
						<Box>
							<HeaderAction />
						</Box>

						<Box>
							<HeaderIcon />
						</Box>

						<Box>
							<CustomDropdown
								closeOnClick
								toggle={
									<Avatar
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
												<Avatar size={40} src={getImageUrl(currentUser)} />
											</Box>

											<Box hidden={collapsed} sx={profileStyle.default}>
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
																	() => router.push('/auth/login'),
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

			<Layout>
				<CustomSider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
					<Flex
						padding='8px 10px 15px'
						sx={{
							alignItems: 'center',
							justifyContent: `${collapsed ? 'center' : 'flex-start'}`,
						}}
					>
						<Box
							sx={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Avatar
								size={collapsed ? 40 : 50}
								src={getImageUrl(currentUser)}
								style={{ transition: 'all 0.3s ease' }}
							/>
						</Box>

						<Box hidden={collapsed} sx={profileStyle.default}>
							<Flex sx={{ flexDirection: 'column' }}>
								<Box>
									<Title style={{ fontSize: '24px' }}>{currentUser?.name}</Title>
								</Box>
								<Box>
									<Text style={{ textTransform: 'capitalize' }}>{currentUser?.role}</Text>
								</Box>
							</Flex>
						</Box>
					</Flex>

					<CustomMenu mode='inline' theme='light' items={items} style={{ borderRight: 0 }} />
				</CustomSider>
				<Layout
					style={{
						overflow: 'auto',
						background: colorBgContainer,
						scrollbarGutter: 'stable',
					}}
				>
					<Content
						style={{
							margin: 0,
							minHeight: 280,
							background: colorBgContainer,
						}}
					>
						<div style={{ padding: '24px 32px 120px 16px' }}>{children}</div>
					</Content>
				</Layout>
			</Layout>
		</Layout>
	);
};

export default GeneralLayout;
