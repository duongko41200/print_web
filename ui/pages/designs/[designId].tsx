import { fabric } from 'fabric';
import { io, Socket } from 'socket.io-client';
import React, { useEffect, useRef, useState } from 'react';

import { Flex } from 'theme-ui';
import { Layout, theme } from 'antd';

import Panel from '@components/panel/Panel';
import Header from '@layouts/design/Header';
import FabricCanvasContext from '@components/canvas/CanvasContext';
import Canvas from '@components/canvas/design/Canvas';
import Toolbox from '@components/toolbox/Toolbox';

import ProtectedRoute from '@components/auth/ProtectedRoute';
import { useAppSelector } from '@store/hooks';
import ProtectedPage from '@components/auth/ProtectedPage';
import ProtectedDesignPage from '@components/auth/ProtectedDesignPage';
import ProtectedDesignRoute from '@components/auth/ProtectedDesignRoute';
import MenuContext from '@components/menu/MenuContext';

import getConfig from 'next/config';
import { canEditDesign } from '@utils/user';
const { publicRuntimeConfig } = getConfig();

const { Content, Sider, Footer } = Layout;

const SocketContext = React.createContext(null);
export { SocketContext };

const SOCKET_HOST = publicRuntimeConfig.SOCKET_HOST || 'localhost';
const SOCKET_PORT = publicRuntimeConfig.SOCKET_PORT || 3001;
const SOCKET_PROTOCOL = publicRuntimeConfig.SOCKET_PROTOCOL || 'ws';

const Design: React.FC = () => {
	const {
		token: { colorBgContainer },
	} = theme.useToken();

	const socket = useRef<Socket>(null);
	const currentUser = useAppSelector((state) => state.app.currentUser);
	const design = useAppSelector((state) => state.app.design);
	const permission = useAppSelector((state) => state.app.designPermission);

	// Socket
	// connect socket
	React.useEffect(() => {
		let newSocket: Socket;

		if (publicRuntimeConfig.NODE_ENV === 'development') {
			newSocket = io('localhost:3001', {
				path: '/hm-socket',
				transports: ['websocket', 'polling'],
			});
		} else {
			newSocket = io({
				host: SOCKET_HOST,
				port: SOCKET_PORT,
				protocols: SOCKET_PROTOCOL,
				path: '/hm-socket',
				transports: ['websocket', 'polling'],
			});
		}

		newSocket.on('connect', () => console.log('[x] Socket connected successfully!'));
		newSocket.on('connect_error', (err) => {
			console.log(`connect socket error due to ${err.message}`);
		});
		newSocket.on('error', (event) => {
			console.error('Socket error: ', event);
		});

		socket.current = newSocket;

		return () => {
			newSocket.disconnect();
		};
	}, []);

	// join socket room
	useEffect(() => {
		if (!socket.current || !currentUser || !design) {
			return;
		}

		socket.current.emit('join-design', {
			designId: design.id,
			user: currentUser,
		});
	}, [socket, design]);

	return (
		<ProtectedPage>
			<ProtectedDesignPage>
				<FabricCanvasContext.Provider value={React.createRef<fabric.Canvas>()}>
					<SocketContext.Provider value={socket?.current}>
						<Layout
							style={{
								height: '100vh',
								width: '100vw',
								overflow: 'hidden',
							}}
						>
							<Header />

							<Layout>
								<Sider
									width='fit-content'
									style={{
										background: colorBgContainer,
									}}
								>
									{canEditDesign(currentUser, design, permission) && <Panel />}
								</Sider>

								<Flex
									backgroundColor='#f5f5f5'
									sx={{
										flexDirection: 'column',
										flex: 1,
										overflow: 'auto',
									}}
								>
									<Toolbox />
									<MenuContext>
										<Content
											style={{
												margin: 0,
												minHeight: 300,
												background: colorBgContainer,
											}}
										>
											<Flex
												backgroundColor='#f5f5f5'
												sx={{
													alignItems: 'center',
													justifyContent: 'center',
													height: '100%',
													padding: '20px 0',
												}}
											>
												<Canvas />
											</Flex>
										</Content>
									</MenuContext>

									<Footer style={{ background: '#fff', position: 'relative' }}></Footer>
								</Flex>
							</Layout>
						</Layout>
					</SocketContext.Provider>
				</FabricCanvasContext.Provider>
			</ProtectedDesignPage>
		</ProtectedPage>
	);
};

export default ProtectedRoute(ProtectedDesignRoute(Design));
