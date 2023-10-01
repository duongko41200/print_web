import axios from 'axios';
import { fabric } from 'fabric';
import { io, Socket } from 'socket.io-client';
import { v4 as uuid } from 'uuid';
import React, { useState, useEffect, useRef, useContext, RefObject } from 'react';
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import { useMeasure } from 'react-use';
import ResizeObserver from 'resize-observer-polyfill';
import jwtDecode from 'jwt-decode';
import { toast } from 'react-toastify';

import { Layout, theme } from 'antd';

import styles from './design.module.css';

import Panel from '@components/panel/Panel';
import Header from '@layouts/design/Header';
import FabricCanvasContext from '@components/canvas/CanvasContext';
import Canvas from '@components/canvas/design/Canvas';
import Toolbox from '@components/toolbox/Toolbox';
import Toolbar from '@components/toolbar/Toolbar';
import { Flex } from 'theme-ui';

import CursorOverlay from '@components/cursor/CursorOverlay';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import { useAppSelector } from '@store/hooks';
import ProtectedPage from '@components/auth/ProtectedPage';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig()

const { Content, Sider, Footer } = Layout;

const SocketContext = React.createContext(null);
export { SocketContext };

interface DesignLayoutProps {
	isCollaborative?: boolean;
}

const Design: React.FC<DesignLayoutProps> = () => {
	const {
		token: { colorBgContainer },
	} = theme.useToken();

	const router = useRouter();
	const [design, setDesign] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const socket = useRef<Socket>(null);

	const currentUser = useAppSelector((state) => state.app.currentUser);

	// Socket
	// connect socket
	React.useEffect(() => {
		const newSocket: Socket = io(`ws://${publicRuntimeConfig.SOCKET_URL}`);
		socket.current = newSocket;
		console.log('[x] Socket connected successfully!');

		return () => {
			newSocket.disconnect();
		};
	}, []);

	// fetch product data
	useEffect(() => {
		if (!router.isReady) {
			return;
		}

		const fetchData = async () => {
			setIsLoading(true);
			const design = await getDesign(router.query.designId as string);
			setDesign(design);
			setIsLoading(false);
		};

		fetchData();
	}, [router.isReady]);

	// join socket room
	useEffect(() => {
		if (!design || !socket.current || !currentUser) {
			return;
		}

		socket.current.emit('join-design', { designId: design.id, user: currentUser });
	}, [design]);


	return (
		<ProtectedPage>
			<FabricCanvasContext.Provider value={React.createRef<fabric.Canvas>()}>
				<SocketContext.Provider value={socket?.current}>
					<Layout style={{ height: '100vh', width: '100vw' }}>
						<Header />

						<Layout>
							<Sider width='fit-content' style={{ background: colorBgContainer }}>
								<Panel />
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

								<Content
									onMouseEnter={(e) => {
										const target = e.target as HTMLElement;
										target.style.outline = '2px solid green';
									}}
									onMouseLeave={(e) => {
										const target = e.target as HTMLElement;
										target.style.outline = 'none';
									}}
									style={{
										padding: 0,
										margin: '0 auto',
										marginTop: 20,
										marginBottom: 20,
										background: '#f5f5f5',
										flex: 1,
										position: 'relative',
									}}
								>
									<Canvas />

									{/* <CursorOverlay /> */}
								</Content>

								<Footer style={{ background: '#fff' }}>
									<Toolbar />
								</Footer>
							</Flex>
						</Layout>
					</Layout>
				</SocketContext.Provider>
			</FabricCanvasContext.Provider>
		</ProtectedPage>
	);
};

// get product design data
async function getDesign(designId: string) {
	try {
		const url = `${publicRuntimeConfig.API_URL}/api/v1/designs/${designId}`;
		const res = await axios.get(url);

		if (res.data.status === 'success') {
			return res.data.data;
		}
	} catch (err) {
		toast.error(err?.response?.data?.message || 'Error fetching Product');
	}
}

export default ProtectedRoute(Design);
