const express = require('express');
const passport = require('passport');

const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
const handlerImage = require('../middlewares/handler.image');

const router = express.Router();

router.post('/token', userController.getUserFromToken);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.use(authController.protect);

router.patch('/my-password', userController.updatePassword);
router.patch('/me', handlerImage.uploadImage('image'), handlerImage.resizeImage(500, 500), userController.updateMe);

router.use(authController.restrictTo('admin', 'owner'));
router.route('/:id').patch(userController.updateUser);
router.route('/').post(userController.getUsers);

module.exports = router;
