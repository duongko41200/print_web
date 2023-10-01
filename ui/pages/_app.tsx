/**
 * @brief Just for global styling
 */

import { CookiesProvider } from 'react-cookie';
import { ToastContainer } from 'react-toastify';
import store from '../store/store';
import { Provider } from 'react-redux';

import 'react-toastify/dist/ReactToastify.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'react-confirm-alert/src/react-confirm-alert.css'; 

import './common.css';
import '../global.css';
import 'bootstrap/dist/css/bootstrap.css';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
	return (
		<Provider store={store}>
			<CookiesProvider>
				<Head>
					<link rel='shortcut icon' href='/static/favicon.ico' />
				</Head>

				<Component {...pageProps} />
				<ToastContainer
					position='top-center'
					autoClose={2000}
					closeOnClick
					pauseOnHover
					theme='colored'
				/>
			</CookiesProvider>
		</Provider>
	);
}

export default MyApp;
