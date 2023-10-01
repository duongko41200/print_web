import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@mui/material';
import { Typography } from 'antd';
import { Flex, Box } from 'theme-ui';
import Link from 'next/link';
import { useAppSelector } from '@store/hooks';
import ProtectedPage from '@components/auth/ProtectedPage';
import ProtectedRoute from '@components/auth/ProtectedRoute';
import { getAuthTokenFromCookie } from 'utils/cookie';
import { getDesignPermissionByToken, logout, updateDesignPermissionByToken } from 'services/dbhandler';

const { Paragraph } = Typography;

interface InvitationProps {}

const Invitation: React.FC<InvitationProps> = ({}) => {
	const [permission, setPermission] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	const currentUser = useAppSelector((state) => state.app.currentUser);

	const handleClickAcceptButton = async () => {
		if (!router.isReady) {
			toast.error('Something went wrong! Try again in a few seconds');
			return;
		}

		const newPermission = await updateDesignPermissionByToken(router.query.invitationToken as string, {
			status: 'accepted',
		});
		setPermission(newPermission);
	};

	const fetchData = async () => {
		setIsLoading(true);
		const permission = await getDesignPermissionByToken(router.query.invitationToken as string);
		setPermission(permission);
		setIsLoading(false);
	};

	useEffect(() => {
		if (!router.isReady) {
			return;
		}

		fetchData();
	}, [router.isReady]);

	let InvitationContent: React.ReactNode;
	if (!permission) {
		InvitationContent = (
			<Flex
				sx={{
					alignItems: 'center',
					justifyItems: 'flex-start',
					flexDirection: 'column',
				}}
			>
				<Box>
					<Paragraph>Invalid token</Paragraph>
				</Box>
				<Box>
					<Link href='/'>
						<Button>Go to home page</Button>
					</Link>
				</Box>
			</Flex>
		);
	}
	if (permission) {
		if (permission.status === 'pending' && currentUser.id == permission.user) {
			InvitationContent = (
				<Flex
					sx={{
						alignItems: 'center',
						justifyItems: 'flex-start',
						flexDirection: 'column',
					}}
				>
					<Box>
						<Paragraph>Accept invitation to starting collaborating edit</Paragraph>
					</Box>
					<Box>
						<Button onClick={handleClickAcceptButton}>Accept</Button>
					</Box>
				</Flex>
			);
		}

		if (permission.status === 'accepted' && currentUser.id == permission.user) {
			InvitationContent = (
				<Flex
					sx={{
						alignItems: 'center',
						justifyItems: 'flex-start',
						flexDirection: 'column',
					}}
				>
					<Box>
						<Paragraph>You have accepted invitation</Paragraph>
					</Box>
					<Box>
						<Button
							onClick={async () => {
								await router.replace(`/designs/${permission.design}`);
							}}
						>
							Visit Design
						</Button>
					</Box>
				</Flex>
			);
		}

		if (currentUser.id != permission.user) {
			InvitationContent = (
				<Flex
					sx={{
						alignItems: 'center',
						justifyItems: 'flex-start',
						flexDirection: 'column',
					}}
				>
					<Box>
						<Paragraph>Wrong account. You are logging in with email {currentUser?.email}</Paragraph>
					</Box>
					<Box>
						<Paragraph>
							If you want to accept this invitation. Please{' '}
							<Box
								sx={{ color: 'blue', cursor: 'pointer' }}
								onClick={() => {
									logout(
										() => router.push('/auth/login'),
										(err) => toast.error(err.response.data.message)
									);
								}}
							>
								log out
							</Box>
						</Paragraph>
					</Box>
				</Flex>
			);
		}
	}

	return (
		<ProtectedPage>
			<Flex sx={{ alignItems: 'center', justifyContent: 'center' }}>
				{isLoading ? (
					<div>Loading ...</div>
				) : (
					<Flex
						sx={{
							alignItems: 'center',
							justifyContent: 'flex-start',
							flexDirection: 'column',
						}}
					>
						<Box>
							<img
								loading='lazy'
								width={200}
								height={200}
								src='/static/images/icons/svg/invitation.svg'
								alt='invitation'
							/>
						</Box>
						<Box>{InvitationContent}</Box>
					</Flex>
				)}
			</Flex>
		</ProtectedPage>
	);
};

export default ProtectedRoute(Invitation);
