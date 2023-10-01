import React from 'react';
import { useAppSelector } from '../../store/hooks';
import Error from '@pages/error';


interface AdminPageProps {
	children: React.ReactNode;
}


const AdminPage:React.FC<AdminPageProps> = ({children}) => {
	const currentUser = useAppSelector(state => state.app.currentUser);

	if (!currentUser){
		return <>...</>
	}

	if (currentUser.role === 'user'){
		return <Error message='authorization' />
	}

	return (
		<>{children}</>
	)
}


export default AdminPage;