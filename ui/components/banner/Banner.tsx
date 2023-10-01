import React from 'react';


import { UploadOutlined } from '@ant-design/icons';
import { Flex, Box } from 'theme-ui';
import { Typography } from 'antd';
import { Button } from '@mui/material';
import LiveSearch from '../search/LiveSearch';

const { Title } = Typography;

interface BannerProps {}

const Banner: React.FC<BannerProps> = ({}) => {
	return (
		<Flex
			sx={{
				position: 'relative',
				background: `url('/static/images/background/banner.jpg')`,
				width: '100%',
				height: '250px',
				backgroundRepeat: 'no-repeat',
				backgroundPosition: 'center',
				backgroundSize: 'cover',
				borderRadius: '12px',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column',
			}}
		>
			<Flex
				sx={{
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					rowGap: '30px',
					zIndex: 111,
				}}
			>
				<Box>
					<LiveSearch />
				</Box>

				<Box>
					<Title style={{ fontFamily: 'Pacifico', color: '#f5f5f5' }}>
						Welcome to Hust Maker
					</Title>
				</Box>
			</Flex>

			<Box
				sx={{
					position: 'absolute',
					right: '20px',
					bottom: '20px',
					zIndex: 999,
				}}
			>
				{/* <Button
					variant='outlined'
					startIcon={<UploadOutlined />}
					sx={{ background: 'hsla(0,0%,100%,.07)', color: '#ccc', textTransform: 'capitalize'}}
				>
					Upload
				</Button> */}
			</Box>

			<Box
				sx={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: '100%',
					height: '100%',
					background: '#5C469C',
					opacity: 0.9,
					zIndex: 1,
					borderRadius: 12
				}}
			></Box>
		</Flex>
	);
};

export default Banner;
