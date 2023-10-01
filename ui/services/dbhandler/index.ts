export { fetchAuthData } from './fetchData';

export {
	updateTemplate,
	getTemplate,
	getTemplates,
	cloneTemplate,
	searchMyTemplates,
	deleteTemplate,
	createTemplate,
	updateTemplateNumUsed,
} from './template';

export {
	createTemplatePermission,
	updateTemplatePermission,
	getPermissionsInTemplate,
	getTemplatePermissionByToken,
	updateTemplatePermissionByToken,
	getTemplatePermission,
} from './template.permission';

export {
	createDesignPermission,
	updateDesignPermission,
	getPermissionsInDesign,
	getDesignPermissionByToken,
	updateDesignPermissionByToken,
	getDesignPermission,
} from './design.permission';

export { getProducts, updateProduct, deleteProduct, getAllProducts } from './product';

export {
	createDesignFromTemplate,
	createDesignFromProduct,
	searchMyDesigns,
	getAllDesigns,
	updateDesign,
	deleteDesign,
	getDesign,
} from './design';

export { getUsers, updateUser, updateMe, updateMyPassword, logout, login, signup, loginWithGoogle } from './user';

export { deleteImageAsset, createImageAsset, updateImageAsset, getMyImageAssets } from './image.asset';
