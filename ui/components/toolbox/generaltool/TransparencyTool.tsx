import React, {useState, useContext, RefObject, useEffect} from 'react';

import { Grid } from 'theme-ui';
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react';
import CustomSlider from '@components/slider/CustomSlider';
import AppsIcon from '@mui/icons-material/Apps';

import FabricCanvasContext from '@components/canvas/CanvasContext';
import { useAppSelector } from '@store/hooks';

interface TransparencyToolProps {

}

let originalStates = [];
function setOriginals (objects: fabric.Object[]){
	originalStates = objects.map(el => {
		return {
			id: el.id,
			opacity: el.opacity
		}
	})
}

const TransparencyTool:React.FC<TransparencyToolProps> = ({}) => {
	const activeObjects = useAppSelector(state => state.canvas.activeObjects);
	const canvas: RefObject<fabric.Canvas> = useContext(FabricCanvasContext);

	const [opacity, setOpacity] = useState<number>(0);

	// INIT DISPLAYING OPTION
	useEffect(() => {
		if (!activeObjects){
			return;
		}

		if (opacity === activeObjects.objects[0].opacity){
			return;
		}

		setOpacity(activeObjects.objects[0].opacity);

	}, [activeObjects]);

	
	// handler function
	const handleOpacityChange = (newValue: number) => {
		if (!activeObjects || !canvas.current) {
			return;
		}

		if (newValue === activeObjects.objects[0].opacity) {
			return;
		}

		setOriginals(activeObjects.objects);

		activeObjects.objects.forEach((el: fabric.Object) => {
			el.set({ opacity: newValue });
		})

		canvas.current.fire('object:modified');
		canvas.current.requestRenderAll();
	};

	const handleOpacityCommitted = (
		originalValue: number,
		newValue: number
	) => {
		const originals = originalStates.map((el) => {
			el.opacity = originalValue;

			return el;
		});

		const target = activeObjects.objects.map((el: fabric.Object) => {
			return {
				id: el.id,
				opacity: newValue,
			}
		})

		canvas.current.fire('history:updated', {
			originals,
			target,
		});
	};


	return (
		<CDropdown direction='center' autoClose='outside'>
			<CDropdownToggle color='light'><AppsIcon /></CDropdownToggle>
			<CDropdownMenu style={{width: '250px'}}>
				<CDropdownItem style={{
						backgroundColor: 'transparent',
						color: '#000',
						cursor: 'unset',
					}}>
					<CustomSlider 
					title='Transparency'
					value={opacity}
					inputField
					setValue={setOpacity}
					handleOnChange={handleOpacityChange}
					handleOnChangeCommitted={handleOpacityCommitted}
					step={0.1}
					min={0.1}
					max={1}
					/>
				</CDropdownItem>
			</CDropdownMenu>
		</CDropdown>
	)
}


export default TransparencyTool;