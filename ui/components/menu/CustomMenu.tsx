import { usePathname, useRouter } from 'next/navigation';

import { Menu, MenuProps } from 'antd';
import React from 'react';

interface CustomMenuProps extends MenuProps {}

const CustomMenu: React.FC<CustomMenuProps> = ({ ...other }) => {
	const pathname = usePathname();
	const router = useRouter();

	return (
		<Menu
			defaultSelectedKeys={[pathname]}
			onClick={({ key }) => {
				router.push(key);
			}}
			{...other}
		/>
	);
};

export type MenuItem = Required<MenuProps>['items'][number];
export function getMenuItem(
	label: React.ReactNode,
	key: React.Key,
	icon?: React.ReactNode
): MenuItem {
	return {
		key,
		icon,
		label,
	} as MenuItem;
}

export default CustomMenu;
