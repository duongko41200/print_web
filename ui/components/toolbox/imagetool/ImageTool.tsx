import React from 'react';

import { Flex, Box } from 'theme-ui';
import FlipImage from './FlipImage';
import CropImage from './CropImage';

interface ImageToolProps {}

const ImageTool: React.FC<ImageToolProps> = ({}) => {
	return (
		<Flex sx={{ flex: 1, alignItems: 'center', justifyContent: 'space-evenly', columnGap: 10 }}>
			<Box>
				<FlipImage />
			</Box>

			{/* <Box>
				<CropImage />
			</Box> */}

			{/* <Box bg='green'>Image tool 3</Box> */}
		</Flex>
	);
};

export default ImageTool;
