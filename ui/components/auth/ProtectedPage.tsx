import React from 'react';
import { useAppSelector } from '../../store/hooks';


interface ProtectedPageProps {
	children: React.ReactNode;
}


const ProtectedPage:React.FC<ProtectedPageProps> = ({children}) => {
	const currentUser = useAppSelector(state => state.app.currentUser);

	if (!currentUser){
		return <>...</>
	}

	return (
		<>{children}</>
	)
}


export default ProtectedPage;