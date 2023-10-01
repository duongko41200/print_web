import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export const getImageUrl = (user: any) => {
	if (user.oauthProvider) {
		return user.image;
	}

	if (typeof user === 'string' && user.includes('https://')){
		return user;
	}

	return `${publicRuntimeConfig.IMAGE_CLOUD_PATH}/${user.image || user}`;
};

export const canEditDesign = (user: any, design: any, permission): boolean => {
	if (!user || !design) {
		return false;
	}

	if (user.id == design.user.id) {
		return true;
	}

	if (!permission) {
		return false;
	}

	if (permission && permission.status === 'accepted' && permission.type === 'edit') {
		return true;
	}

	return false;
};

export const canEditTemplate = (user: any, template: any): boolean => {
	if (!user || !template) {
		return false;
	}

	if (user.id == template.user.id) {
		return true;
	}

	return false;
};
