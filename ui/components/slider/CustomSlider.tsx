import React, { SetStateAction, useEffect, useState } from 'react';

import { Box, Flex } from 'theme-ui';
import { Slider, TextField } from '@mui/material';
import type {SliderProps} from '@mui/material/Slider';

interface CustomSliderProps extends SliderProps{
	title: string;
	handleOnChange: (newValue: number) => void;
	handleOnChangeCommitted?: (originalValue: number, newValue: number) => void;
	inputField?: boolean;
	value: number;
	setValue: React.Dispatch<SetStateAction<number>>;
	step?: number
}

const CustomSlider: React.FC<CustomSliderProps> = ({
	title,
	handleOnChange,
	handleOnChangeCommitted,
	inputField,
	value,
	setValue,
	step,
	...other
}) => {
	const [originalValue, setOriginalValue] = useState<number>(value);

	// useEffect(() => {
	// 	setOriginalValue(value);
	// }, []);

	useEffect(() => {
		if (originalValue === value){
			return;
		}
		
		handleOnChange(value);
	}, [value]);

	return (
		<Box padding={10} title={title}>
			<Flex
				sx={{ alignItems: 'center', justifyContent: 'space-between' }}
			>
				<div>{title}</div>

				{inputField && (
					<TextField
						type='number'
						variant='outlined'
						value={value}
						size='small'
						sx={{ width: '80px' }}
						onChange={(event) =>{
								let newValue = parseFloat(event.target.value);
								if (other.min && newValue < other.min){
									newValue = other.min
								}
								if (other.max && newValue > other.max){
									newValue = other.max
								}

								setValue(newValue);
							}
						}
					/>
				)}
			</Flex>
			<Slider
				size='small'
				defaultValue={value}
				value={value}
				aria-label={title.toLowerCase()}
				valueLabelDisplay='auto'
				onChange={(event, newValue: number) => {
					if (other.min && newValue < other.min){
						newValue = other.min
					}
					if (other.max && newValue > other.max){
						newValue = other.max
					}
					
					setValue(newValue);
				}}
				onChangeCommitted={(event, newValue: number) => {
					if (other.min && newValue < other.min){
						newValue = other.min
					}
					if (other.max && newValue > other.max){
						newValue = other.max
					}

					if (handleOnChangeCommitted){
						handleOnChangeCommitted(originalValue, newValue);
						setOriginalValue(newValue);
					}

				}}
				step={step}
				{...other}
			/>
		</Box>
	);
};

export default CustomSlider;
