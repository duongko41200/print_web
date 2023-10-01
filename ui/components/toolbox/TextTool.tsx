import React, { useState, useEffect, RefObject, useContext } from 'react';

import { Flex, Box } from 'theme-ui';
import ColorPicker from '../colorpicker/ColorPicker';
import TextStyle from '../textstyle/TextStyle';
import TextAlign from '../textstyle/TextAlign';
import TextSpacing from '../textstyle/TextSpacing';
import TextFont from '../textstyle/TextFont';
import TextSize from '../textstyle/TextSize';

import { ActiveObjects } from '../canvas/CanvasSlice';

interface TextToolProps {
	activeObjects: ActiveObjects
}

const TextTool: React.FC<TextToolProps> = ({ activeObjects }) => {

	return (
		<Flex
			sx={{
				flex: 1,
				alignItems: 'center',
				justifyContent: 'flex-start',
				columnGap: '10px'
			}}
		>

			<Box>
				<TextFont activeObjects={activeObjects} />
			</Box>

			<Box>
				<TextSize activeObjects={activeObjects} />
			</Box>

			<Box title='Text color'>
				<ColorPicker activeObjects={activeObjects} objectKey='fill' forTypes={['textbox']} />
			</Box>

			<Box>
				<TextStyle activeObjects={activeObjects} />
			</Box>

			<Box>
				<TextAlign activeObjects={activeObjects} />
			</Box>

			<Box>
				<TextSpacing activeObjects={activeObjects} />
			</Box>
		</Flex>
	);
};

export default TextTool;
