import React from 'react';

import {Flex, Box} from 'theme-ui';
import ColorPicker from '../colorpicker/ColorPicker';

import { ActiveObjects } from '../canvas/CanvasSlice';
import StrokeWeight from '../borderstyle/StrokeWeight';

interface PathToolProps {
	activeObjects: ActiveObjects
}


const PathTool:React.FC<PathToolProps> = ({activeObjects}) => {
	return (
		<Flex sx={{alignItems: 'center', justifyContent: 'center', columnGap: '10px'}}>
			<Box title='Fill color'>
				<ColorPicker activeObjects={activeObjects} objectKey='fill' forTypes={['shape', 'path']} />
			</Box>

			<Box title='Border style'>
				<StrokeWeight />
			</Box>
		</Flex>
	)
}


export default PathTool;