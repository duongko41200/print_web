const router = require('express').Router();

const templateController = require('../controllers/template.controller');
const authController = require('../controllers/auth.controller');
const permissionRouter = require('./template.permission.routes');
const designRouter = require('./design.routes');

router.use('/:templateId/permissions', permissionRouter);
router.use('/:templateId/designs', designRouter);

router.use(authController.protect);

router.get('/mines/search', templateController.searchMines);
router.get('/mines', templateController.getMines);
router.get('/shared', templateController.getShared);
router.post('/:id/clone', templateController.cloneTemplate);
router.patch('/:id/numUsed', templateController.updateNumUsed);

router.route('/').get(templateController.getAllTemplates).post(templateController.createTemplate);

router
	.route('/:id')
	.get(templateController.getTemplate)
	.patch(templateController.updateTemplate)
	.delete(templateController.deleteTemplate);

module.exports = router;
