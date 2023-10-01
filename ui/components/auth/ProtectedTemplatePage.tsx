import React from 'react';
import { useAppSelector } from '../../store/hooks';


interface ProtectedTemplatePageProps {
	children: React.ReactNode;
}


const ProtectedTemplatePage:React.FC<ProtectedTemplatePageProps> = ({children}) => {
	const currentUser = useAppSelector(state => state.app.currentUser);
	const template = useAppSelector(state => state.app.template);

	if (!currentUser){
		return <>Loading user data</>
	}

	if (!template){
		return <>Loading template</>
	}

	return (
		<>{children}</>
	)
}

export default ProtectedTemplatePage;