import React from 'react';

import reactCSS from 'reactcss';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Box } from 'theme-ui';
import ViewListIcon from '@mui/icons-material/ViewList';
import InterestsIcon from '@mui/icons-material/Interests';
import ImageIcon from '@mui/icons-material/Image';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import DrawIcon from '@mui/icons-material/Draw';
import { PixabayIcon } from '@components/icons/SvgIcon';

import styles from './Panel.module.css';
import TemplatePanelContent from './TemplatePanelContent';
import ShapePanelContent from './ShapePanelContent';
import ImagePanelContent from './ImagePanelContent';
import TextPanelContent from './TextPanelContent';
import DrawPanelContent from './DrawPanelContent';
import PixabayPanelContent from './PixabayPanelContent';

interface PanelSidebarProps {
	children: React.ReactNode;
	value: number;
	index: number;
	[key: string]: any;
}

/**
 * @des display elements to choice (depend on which panel item)
 *
 * @param props
 */
function PanelSidebar(props: PanelSidebarProps) {
	const { isOpen, children, value, index, ...other } = props;

	const sidebarStyles = reactCSS({
		default: {
			open: {
				minWidth: '250px',
				transition: 'all 0.3s ease',
			},
			close: {
				maxWidth: 0,
				opacity: 0,
				transition: 'all 0.3s ease',
			},
		},
	});

	return (
		<div
			className={styles['panel-sidebar']}
			role='tabpanel'
			hidden={value !== index}
			id={`vertical-tabpanel-${index}`}
			{...other}
			style={isOpen ? sidebarStyles.open : sidebarStyles.close}
		>
			{value === index && <div>{children}</div>}
		</div>
	);
}

function a11yProps(index: number): { id: string; 'aria-controls': string } {
	return {
		id: `vertical-tab-${index}`,
		'aria-controls': `vertical-tabpanel-${index}`,
	};
}

const Panel: React.FC = () => {
	const [value, setValue] = React.useState(0);
	const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

	const handleChange = (event: React.SyntheticEvent, newValue: any) => {
		setIsSidebarOpen(true);
		setValue(newValue);
	};

	return (
		<Box
			sx={{
				flexGrow: 1,
				bgcolor: 'background.paper',
				display: 'flex',
				height: 'inherit',
			}}
		>
			<Tabs
				orientation='vertical'
				variant='scrollable'
				value={value}
				onClick={() => setIsSidebarOpen(true)}
				onChange={handleChange}
				aria-label='Vertical tabs example'
				sx={{
					borderRight: 1,
					borderColor: 'divider',
					width: '-webkit-fill-available',
					overflow: 'auto',
				}}
			>
				<Tab
					style={{ textTransform: 'capitalize' }}
					label='Templates'
					{...a11yProps(0)}
					icon={<ViewListIcon />}
				/>
				<Tab
					style={{ textTransform: 'capitalize' }}
					label='Shapes'
					{...a11yProps(1)}
					icon={<InterestsIcon />}
				/>
				<Tab style={{ textTransform: 'capitalize' }} label='Upload' {...a11yProps(2)} icon={<ImageIcon />} />
				<Tab
					style={{ textTransform: 'capitalize' }}
					label='Pixabay'
					{...a11yProps(3)}
					icon={<PixabayIcon width={20} height={20} />}
				/>
				<Tab
					style={{ textTransform: 'capitalize' }}
					label='Texts'
					{...a11yProps(4)}
					icon={<FormatColorTextIcon />}
				/>
				<Tab style={{ textTransform: 'capitalize' }} label='Draw' {...a11yProps(5)} icon={<DrawIcon />} />
			</Tabs>

			{/* Panel content */}
			<PanelSidebar value={value} index={0} isOpen={isSidebarOpen}>
				<TemplatePanelContent setIsSidebarOpen={setIsSidebarOpen} />
			</PanelSidebar>

			<PanelSidebar value={value} index={1} isOpen={isSidebarOpen}>
				<ShapePanelContent setIsSidebarOpen={setIsSidebarOpen} />
			</PanelSidebar>

			<PanelSidebar value={value} index={2} isOpen={isSidebarOpen}>
				<ImagePanelContent setIsSidebarOpen={setIsSidebarOpen} />
			</PanelSidebar>

			<PanelSidebar value={value} index={3} isOpen={isSidebarOpen}>
				<PixabayPanelContent setIsSidebarOpen={setIsSidebarOpen} />
			</PanelSidebar>

			<PanelSidebar value={value} index={4} isOpen={isSidebarOpen}>
				<TextPanelContent setIsSidebarOpen={setIsSidebarOpen} />
			</PanelSidebar>

			<PanelSidebar value={value} index={5} isOpen={isSidebarOpen}>
				<DrawPanelContent setIsSidebarOpen={setIsSidebarOpen} />
			</PanelSidebar>
		</Box>
	);
};

export default Panel;
