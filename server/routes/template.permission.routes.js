const express = require('express');
const permissionController = require('../controllers/template.permission.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/one/:templateId/:userId', permissionController.getTemplatePermission);

router
	.route('/token/:token')
	.get(permissionController.getPermissionByToken)
	.patch(permissionController.updatePermission);

router.route('/').get(permissionController.getAllPermissions).post(permissionController.createPermission);

router.route('/:id').patch(permissionController.updatePermission);

module.exports = router;
