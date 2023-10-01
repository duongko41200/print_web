import React from 'react';
import { connect } from 'react-redux';


import {
	CDropdown,
	CDropdownToggle,
	CDropdownMenu,
} from '@coreui/react';
import { Flex, Box } from 'theme-ui';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import { RootState } from '../../store/store';
import { ActiveObjects } from '../canvas/CanvasSlice';

import ShapeTool from './ShapeTool';
import ImageTool from './imagetool/ImageTool';
import TextTool from './TextTool';
import PathTool from './PathTool';
import GeneralTool from './generaltool/GeneralTool';

interface ToolboxProps {
	selectedObjectType: string;
	activeObjects: ActiveObjects;
}

const Toolbox: React.FC<ToolboxProps> = ({
	selectedObjectType,
	activeObjects,
}) => {
	let displayTools: JSX.Element[];
	switch (selectedObjectType) {
		case 'shape':
			displayTools = [<ShapeTool activeObjects={activeObjects} />];
			break;
		case 'image':
			displayTools = [<ImageTool />];
			break;
		case 'textbox':
			displayTools = [<TextTool activeObjects={activeObjects} />];
			break;
		case 'path':
			displayTools = [<PathTool activeObjects={activeObjects} />];
			break;

		case 'path:shape':
			displayTools = [<ShapeTool activeObjects={activeObjects} />];
			break;
		case 'path:textbox':
			displayTools = [
				<PathTool activeObjects={activeObjects} />,
				<TextTool activeObjects={activeObjects} />,
			];
			break;
		case 'path:shape:textbox':
		case 'shape:textbox':
			displayTools = [
				<ShapeTool activeObjects={activeObjects} />,
				<TextTool activeObjects={activeObjects} />,
			];

			break;
		default:
			break;
	}

	return (
		<Flex
			padding={10}
			bg='#fff'
			sx={{
				zIndex: 5,
				alignItems: 'center',
				justifyContent: 'flex-start',
				height: '50px',
				'&>div:not(:last-child)': {
					borderRight: '1px solid rgba(57,76,96,.15)',
				},
				'&>div': {
					padding: '0 10px',
				},
			}}
		>
			{selectedObjectType && (
				<Box>
					<CDropdown autoClose='outside'>
						<CDropdownToggle color='light'>
							<MoreHorizIcon />
						</CDropdownToggle>

						<CDropdownMenu>
							<GeneralTool activeObjects={activeObjects} />
						</CDropdownMenu>
					</CDropdown>
				</Box>
			)}

			{displayTools &&
				displayTools.map((tool, index) => {
					return <Box key={index}>{tool}</Box>;
				})}
		</Flex>
	);
};

const mapStateToProps = (state: RootState) => {
	return {
		selectedObjectType: state.canvas.objectType,
		activeObjects: state.canvas.activeObjects,
	};
};

export default connect(mapStateToProps)(Toolbox);
