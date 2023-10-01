import React from 'react';
import { useAppSelector } from '../../store/hooks';


interface OwnerPageProps {
	children: React.ReactNode;
}


const OwnerPage:React.FC<OwnerPageProps> = ({children}) => {
	const currentUser = useAppSelector(state => state.app.currentUser);

	if (!currentUser){
		return <>...</>
	}

	if (currentUser.role !== 'owner'){
		return <>This is owner page</>
	}

	return (
		<>{children}</>
	)
}


export default OwnerPage;