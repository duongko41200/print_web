import React, { RefObject, useContext } from 'react';

import { Typography } from 'antd';
import { CDropdown, CDropdownMenu, CDropdownToggle, CDropdownItem } from '@coreui/react';
import { Box, Flex, Grid } from 'theme-ui';
import { FlipHorizontalIcon, FlipVerticalIcon } from './ToolIcon';

import FabricCanvasContext from '@components/canvas/CanvasContext';
import { useAppSelector } from '@store/hooks';

const { Text } = Typography;

interface FlipImageProps {}

let originals;
function setOriginals(objects: fabric.Object[]) {
	originals = objects.map((el) => {
		return {
			id: el.id,
			flipX: el.flipX,
			flipY: el.flipY,
			angle: el.angle,
		};
	});
}

const FlipImage: React.FC<FlipImageProps> = ({}) => {
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);
	const activeObjects = useAppSelector((state) => state.canvas.activeObjects);

	const flipImage = (type: string) => {
		if (!canvas || !activeObjects.objects) {
			return;
		}

		setOriginals(activeObjects.objects);

		if (type === 'H') {
			activeObjects.objects.forEach((obj) => {
				if (obj.superType === 'image') {
					obj.flipX = !obj.flipX;
					obj.setCoords();
				}
			});
		}

		if (type === 'V') {
			activeObjects.objects.forEach((obj) => {
				if (obj.superType === 'image') {
					obj.flipY = !obj.flipY;
					obj.setCoords();
				}
			});
		}

		// sync to other client
		canvas.current.fire('image:flip', { transform: { originals }, target: activeObjects.objects[0] });

		canvas.current.renderAll();
	};

	return (
		<CDropdown direction='center' autoClose='outside'>
			<CDropdownToggle color='light'>Flip</CDropdownToggle>
			<CDropdownMenu>
				<CDropdownItem onClick={() => flipImage('H')}>
					<Flex sx={{ alignItems: 'center', columnGap: 10 }}>
						<Box>
							<FlipHorizontalIcon />
						</Box>

						<Box>
							<Text>Flip horizontal</Text>
						</Box>
					</Flex>
				</CDropdownItem>

				<CDropdownItem onClick={() => flipImage('V')}>
					<Flex sx={{ alignItems: 'center', columnGap: 10 }}>
						<Box>
							<FlipVerticalIcon />
						</Box>

						<Box>
							<Text>Flip vertical</Text>
						</Box>
					</Flex>
				</CDropdownItem>
			</CDropdownMenu>
		</CDropdown>
	);
};

export default FlipImage;
