import React, { RefObject, useContext } from 'react';
import { useAppSelector } from '../../store/hooks';
import { CursorIcon } from '@components/icons/SvgIcon';
import { Flex } from 'theme-ui';
import { Avatar } from 'antd';

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig()

interface CursorOverlayProps {}

const CursorOverlay: React.FC<CursorOverlayProps> = ({}) => {
	const cursors = useAppSelector((state) => state.cursor.cursors);

	return (
		<>
			{cursors.map((c, index) => {
				return (
					<Flex key={index} sx={{ position: 'absolute', left: c.x, top: c.y, transition: '0.1s' }}>
						<CursorIcon width={16} height={16} />
						<Avatar size={20} src={`${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${c.avatar}`} />
					</Flex>
				);
			})}
		</>
	);
};

export default CursorOverlay;
