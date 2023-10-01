const express = require('express');

const imageAssetController = require('../controllers/image.asset.controller');
const authController = require('../controllers/auth.controller');
const handlerImage = require('../middlewares/handler.image');

const router = express.Router();

router.use(authController.protect);

router
	.route('/')
	.get(imageAssetController.getImagesByUser)
	.post(
		handlerImage.uploadImage('image'),
		handlerImage.resizeImage(2000),
		imageAssetController.createImageAsset
	);

router.route('/:id').delete(imageAssetController.deleteImageAsset).patch(imageAssetController.updateImageAsset);

module.exports = router;
