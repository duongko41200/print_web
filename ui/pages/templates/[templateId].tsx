import { fabric } from 'fabric';
import React, { useRef } from 'react';
import { Socket, io } from 'socket.io-client';

import { Layout, theme } from 'antd';
import { Flex } from 'theme-ui';

import Panel from '@components/panel/Panel';
import Header from '@layouts/template/Header';
import FabricCanvasContext from '@components/canvas/CanvasContext';
import Canvas from '@components/canvas/template/Canvas';
import Toolbox from '@components/toolbox/Toolbox';

import ProtectedRoute from '@components/auth/ProtectedRoute';
import ProtectedPage from '@components/auth/ProtectedPage';
import ProtectedTemplateRoute from '@components/auth/ProtectedTemplateRoute';
import ProtectedTemplatePage from '@components/auth/ProtectedTemplatePage';
import MenuContext from '@components/menu/MenuContext';


import getConfig from 'next/config';
import { canEditTemplate } from '@utils/user';
import { useAppSelector } from '@store/hooks';
const { publicRuntimeConfig } = getConfig();

const { Content, Sider, Footer } = Layout;

const SocketContext = React.createContext(null);
export { SocketContext };

const SOCKET_HOST = publicRuntimeConfig.SOCKET_HOST || 'localhost';
const SOCKET_PORT = publicRuntimeConfig.SOCKET_PORT || 3001;
const SOCKET_PROTOCOL = publicRuntimeConfig.SOCKET_PROTOCOL || 'ws';

const TemplateDesign: React.FC = () => {
	const {
		token: { colorBgContainer },
	} = theme.useToken();

	// Socket
	const socket = useRef<Socket>(null);
	const currentUser = useAppSelector((state) => state.app.currentUser);
	const template = useAppSelector((state) => state.app.template);

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

		socket.current = newSocket;

		return () => {
			newSocket.disconnect();
		};
	}, []);


	return (
		<ProtectedPage>
			<ProtectedTemplatePage>
				<FabricCanvasContext.Provider value={React.createRef<fabric.Canvas>()}>
					<SocketContext.Provider value={socket?.current}>
						<Layout
							style={{
								height: '100vh',
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
									{canEditTemplate(currentUser, template) && <Panel />}
									
								</Sider>

								<Layout
									style={{
										overflow: 'auto',
										background: colorBgContainer,
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
								</Layout>
							</Layout>
						</Layout>
					</SocketContext.Provider>
				</FabricCanvasContext.Provider>
			</ProtectedTemplatePage>
		</ProtectedPage>
	);
};

export default ProtectedRoute(ProtectedTemplateRoute(TemplateDesign));
