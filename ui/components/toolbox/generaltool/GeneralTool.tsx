import React from 'react';

import { Flex, Box } from 'theme-ui';
import PositionTool from './PositionTool';
import LayerTool from './LayerTool';
import TransparencyTool from './TransparencyTool';

import { ActiveObjects } from '../../canvas/CanvasSlice';

interface GeneralToolProps {
	activeObjects: ActiveObjects
}

const GeneralTool: React.FC<GeneralToolProps> = ({activeObjects}) => {
	return (
		<Flex
			padding='0 11px'
			sx={{
				flex: 1,
				alignItems: 'center',
				justifyContent: 'space-evenly',
				columnGap: '10px'
			}}
		>
			<Box>
				<PositionTool activeObjects={activeObjects} />
			</Box>

			<Box>
				<LayerTool />
			</Box>

			<Box>
				<TransparencyTool />
			</Box>
		</Flex>
	);
};

export default GeneralTool;
