import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import { Flex } from 'theme-ui';

interface CustomDropdownProps {
	toggle: React.ReactNode;
	menu?: React.ReactNode;
	closeOnClick?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ toggle, menu, closeOnClick = false }) => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	return (
		<div>
			<Flex
				sx={{
					alignItems: 'center',
					textAlign: 'center',
				}}
				onClick={handleClick}
				aria-controls={open ? 'dropdown-menu' : undefined}
				aria-haspopup='true'
				aria-expanded={open ? 'true' : undefined}
			>
				{toggle}
			</Flex>
			{menu && (
				<Menu
					sx={{ zIndex: 9999 }}
					anchorEl={anchorEl}
					id='dropdown-menu'
					open={open}
					onClose={handleClose}
					transformOrigin={{ horizontal: 'right', vertical: 'top' }}
					anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
					onClick={() => {
						if (closeOnClick) {
							setAnchorEl(null);
						}
					}}
				>
					{menu}
				</Menu>
			)}
		</div>
	);
};

export default CustomDropdown;
