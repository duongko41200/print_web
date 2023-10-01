import React, { RefObject, useContext } from 'react';

import {
	CopyOutlined,
	DeleteOutlined,
	GroupOutlined,
	UngroupOutlined,
	UndoOutlined,
	RedoOutlined,
} from '@ant-design/icons';
import { Dropdown, MenuProps } from 'antd';
import { RootState } from '@store/store';
import { connect } from 'react-redux';
import FabricCanvasContext from '@components/canvas/CanvasContext';

interface MenuContextProps {
	children: React.ReactNode;
	canUndo: boolean;
	canRedo: boolean;
	hasActive: boolean;
}

const MenuContext: React.FC<MenuContextProps> = ({ children, canUndo, canRedo, hasActive }) => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const items: MenuProps['items'] = [
		{
			key: '1',
			label: 'Duplicate',
			icon: <CopyOutlined />,
			onClick: () => canvas.current.cloneObjects(),
			disabled: !hasActive,
		},
		{
			key: '2',
			label: 'Delete',
			icon: <DeleteOutlined />,
			onClick: () => canvas.current.removeSelectedObjects(),
			disabled: !hasActive,
		},
		{
			type: 'divider',
		},
		{
			key: '3',
			label: 'Group',
			icon: <GroupOutlined />,
			onClick: () => canvas.current.group(),
			disabled: !hasActive,
		},
		{
			key: '4',
			label: 'Unroup',
			icon: <UngroupOutlined />,
			onClick: () => canvas.current.ungroup(),
			disabled: !hasActive,
		},
		{
			type: 'divider',
		},
		{
			key: '5',
			label: 'Undo',
			icon: <UndoOutlined />,
			disabled: !canUndo,
			onClick: () => canvas.current.undo(),
		},
		{
			key: '6',
			label: 'Redo',
			icon: <RedoOutlined />,
			disabled: !canRedo,
			onClick: () => canvas.current.redo(),
		},
	];

	return (
		<Dropdown menu={{ items }} trigger={['contextMenu']}>
			{children}
		</Dropdown>
	);
};

const mapStateToProps = (state: RootState) => {
	return {
		canUndo: state.canvas.history.past.length > 0,
		canRedo: state.canvas.history.future.length > 0,
		hasActive: state.canvas.activeObjects && state.canvas.activeObjects.objects.length > 0,
	};
};

export default connect(mapStateToProps)(MenuContext);
