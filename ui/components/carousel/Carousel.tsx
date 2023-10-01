import React, { useRef } from 'react';
import Slider, {Settings} from 'react-slick';

import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CustomCard from '../../components/card/Card';

interface CarouselProps extends Settings {
	disabled?: boolean
}

const Carousel: React.FC<CarouselProps> = ({children, disabled=false, ...other}) => {
	const sliderRef = useRef(null);

	return (
		<div style={{ position: 'relative'}}>
			<Slider
				ref={sliderRef}
				{...other}
				dots={false}
				arrows={false}
			>
				{children}
			</Slider>
			<IconButton
				hidden={disabled}
				onClick={() => sliderRef.current?.slickPrev()}
				sx={{
					border: '1px solid #666',
					background: '#fff',
					position: 'absolute',
					top: '50%',
					left: '-10px',
					transform: 'translateY(-50%)',
				}}
			>
				<KeyboardArrowLeftIcon />
			</IconButton>
			<IconButton
				hidden={disabled}
				onClick={() => sliderRef.current?.slickNext()}
				sx={{
					border: '1px solid #666',
					background: '#fff',
					position: 'absolute',
					top: '50%',
					right: 0,
					transform: 'translateY(-50%)',
				}}
			>
				<KeyboardArrowRightIcon />
			</IconButton>
		</div>
	);
};

export default Carousel;
