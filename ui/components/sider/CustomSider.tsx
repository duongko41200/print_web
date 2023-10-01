import React from 'react';
import styled from '@emotion/styled';
import { Layout, SiderProps, theme } from 'antd';

const { Sider } = Layout;

interface CustomSiderProps extends SiderProps {}

const MySider = styled(Sider)`
	.ant-layout-sider-children {
		overflow: auto;
		flex-grow: 1;
	}
	.ant-layout-sider-trigger {
		background-color: #fff;
		color: #000;
		border-top: 1px solid rgba(5, 5, 5, 0.06);
		position: relative;
	}
`;

const CustomSider: React.FC<CustomSiderProps> = ({ children, ...other }) => {
	const {
		token: { colorBgContainer },
	} = theme.useToken();

	return (
		<MySider
			width={250}
			style={{
				background: colorBgContainer,
			}}
			{...other}
		>
			{children}
		</MySider>
	);
};

export default CustomSider;
