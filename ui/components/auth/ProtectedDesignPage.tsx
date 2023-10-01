import React from 'react';
import { useAppSelector } from '../../store/hooks';

interface ProtectedDesignPageProps {
	children: React.ReactNode;
}

const ProtectedDesignPage: React.FC<ProtectedDesignPageProps> = ({ children }) => {
	const currentUser = useAppSelector((state) => state.app.currentUser);
	const design = useAppSelector((state) => state.app.design);
	const permission = useAppSelector((state) => state.app.designPermission);

	if (!currentUser || !design) {
		return <>...</>;
	}

	if ((currentUser.id != design.user.id) && !permission){
		return <>...</>
	}

	return <>{children}</>;
};

export default ProtectedDesignPage;
