const express = require('express');

const permissionRouter = require('./design.permission.routes');
const designController = require('../controllers/design.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router({ mergeParams: true });

router.use('/:designId/permissions', permissionRouter);

router.use(authController.protect);

router.get('/mines/search', designController.searchMines);
router.get('/mines', designController.getMyDesigns);
router.get('/shared', designController.getSharedDesigns);

router.route('/').get(designController.getAllDesigns).post(designController.createDesign);
router
	.route('/:id')
	.get(designController.getDesign)
	.patch(designController.updateDesign)
	.delete(designController.deleteDesign);

module.exports = router;
