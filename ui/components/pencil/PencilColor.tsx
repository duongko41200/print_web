import React, {useState, useEffect} from 'react';
import reactCSS from 'reactcss';

import { Color, ColorChangeHandler, SketchPicker } from 'react-color';
import { Popover, Button } from '@mui/material';

interface PencilColorProps {
	color: string,
	setColor: React.Dispatch<React.SetStateAction<string>>
}

const PencilColor: React.FC<PencilColorProps> = ({color, setColor}) => {
	if (!color){
		color = 'yellow';
	}

	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(
		null
	);

	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleChange: ColorChangeHandler = (newColor) => {
		if (color === newColor.hex){
			return;
		}

		setColor(newColor.hex);
	}

	useEffect(() => {
		
	}, [color]);

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;

	const styles = reactCSS({
		default: {
			color: {
				width: '28px',
				height: '28px',
				borderRadius: '3px',
				background: color,
			},
			swatch: {
				padding: '4px',
				background: '#ffffff',
				borderRadius: '2px',
				cursor: 'pointer',
				display: 'inline-block',
				boxShadow: '0 0 0 1px rgba(0,0,0,.2)',
			},
		},
	});

	return (
		<>
			<div
				aria-describedby={id}
				onClick={handleClick}
				style={styles.swatch}
			>
				<div style={{...styles.color, color: color}}></div>
			</div>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'center',
					horizontal: 'left',
				}}
			>
				<SketchPicker color={color} onChange={handleChange} />
			</Popover>
		</>
	);
};

export default PencilColor;
