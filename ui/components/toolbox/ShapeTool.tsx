import React, { useContext, useState, useEffect, RefObject } from 'react';

import { Flex, Box } from 'theme-ui';
import FabricCanvasContext from '../canvas/CanvasContext';

import ColorPicker from '../colorpicker/ColorPicker';
import { Gradient, Pattern } from 'fabric/fabric-impl';
import BorderPicker from '../borderstyle/BorderPicker';

import { ActiveObjects } from '../canvas/CanvasSlice';

interface ShapeToolProps {
	activeObjects: ActiveObjects
}

const ShapeTool:React.FC<ShapeToolProps> = ({activeObjects}) => {
	return (
		<Flex sx={{ alignItems: 'center', justifyContent: 'space-evenly', columnGap: '10px' }}>
			<Box title='Fill color'>
				<ColorPicker activeObjects={activeObjects} objectKey='fill' forTypes={['shape', 'path']}/>
			</Box>

			<Box title='Border style'>
				<BorderPicker activeObjects={activeObjects} />
			</Box>
		</Flex>
	)
}


export default ShapeTool;