const express = require('express');

const productController = require('../controllers/product.controller');
const authController = require('../controllers/auth.controller');
const handlerImage = require('../middlewares/handler.image');

const router = express.Router();

router.use(authController.protect);

router.get('/list', productController.getAllProducts);

router
	.route('/')
	.get(productController.getProducts)
	.post(
		authController.restrictTo('admin', 'owner'),
		handlerImage.uploadImages('image', 'thumbnail'),
		handlerImage.resizeImages(500),
		productController.createProduct
	);

router.use(authController.restrictTo('admin', 'owner'));
router
	.route('/:id')
	.get(productController.getProduct)
	.patch(handlerImage.uploadImage('thumbnail'), handlerImage.resizeImage(2000), productController.updateProduct)
	.delete(productController.deleteProduct);

module.exports = router;
