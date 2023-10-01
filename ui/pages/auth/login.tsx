import type { NextPage } from 'next';
import Head from 'next/head';
import LoginForm from '@components/form/LoginForm';

import GoogleIcon from '@mui/icons-material/Google';
import { Button, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { Box, Flex } from 'theme-ui';
import { HandShakeIcon, LogoIcon } from '@components/icons/SvgIcon';

import { getAuthTokenFromCookie } from '@utils/cookie';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

const { Text, Paragraph } = Typography;

const Login: NextPage = () => {
	const router = useRouter();

	const token = getAuthTokenFromCookie();
	if (token) {
		router.replace('/');
	}

	return (
		<div>
			<Head>
				<title>Login Page</title>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/static/images/favicon.ico' />
			</Head>

			<main className='vh-100 d-flex justify-content-center align-items-center'>
				<Flex className='page-content' sx={{ background: '#fff', width: '80%', height: '80%' }}>
					<Box
						className='background'
						sx={{ width: '45%', borderTopRightRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' }}
					>
						<img
							loading='lazy'
							style={{ width: '100%', height: '100%', objectFit: 'cover' }}
							src='/static/images/background/login.png'
							alt='login bg'
						/>
					</Box>

					<Flex
						padding='30px 0'
						className='form-container'
						sx={{ alignItems: 'center', justifyContent: 'center', flexGrow: 1, overflow: 'auto' }}
					>
						<Flex sx={{ flexDirection: 'column', rowGap: 20, height: '100%' }}>
							<Box className='logo'>
								<LogoIcon width={50} height={50} />
							</Box>

							<Box className='welcome-header'>
								<Flex sx={{ alignItems: 'center', columnGap: 10 }}>
									<Box>
										<Text strong style={{ fontSize: 26 }}>
											Hello there
										</Text>
									</Box>
									<Box>
										<HandShakeIcon />
									</Box>
								</Flex>

								<Paragraph style={{ color: '#ccc' }}>Welcome to hust maker</Paragraph>
							</Box>

							<Box>
								<Button
									icon={<GoogleIcon style={{ marginRight: 4 }} fontSize='small' />}
									style={{ width: '100%', background: '#fff', fontWeight: 500 }}
									href={`${publicRuntimeConfig.API_URL}/api/v1/auth/google`}
								>
									Sign in with Google
								</Button>
							</Box>

							<Box
								sx={{
									textAlign: 'center',
									width: '100%',
									borderBottom: '1px solid #ccc',
									lineHeight: '0.1em',
									color: '#ccc',
									marginBottom: 20,
								}}
							>
								<span style={{ background: '#fff', padding: '0 10px' }}>Or</span>
							</Box>

							<Box>
								<LoginForm />
							</Box>
						</Flex>
					</Flex>
				</Flex>
			</main>
		</div>
	);
};

export default Login;
