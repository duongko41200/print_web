const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const util = require('util');

const User = require('../models/user.model');
const catchAsync = require('../utils/catch.async');
const factory = require('./handler.factory');
const AppError = require('../utils/app.error');
const APIFeatures = require('../utils/api.features');
const handlerFactory = require('./handler.factory');
const { uploadBufferImageToS3 } = require('../services/s3');

const writeFileAsync = util.promisify(fs.writeFile);


exports.getUserFromToken = catchAsync(async (req, res, next) => {
	const { token } = req.body;

	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	const currentUser = await User.findById(decoded.id);
	res.status(200).json({
		status: 'success',
		data: currentUser,
	});
});

exports.getUsers = catchAsync(async (req, res, next) => {
	const filters = req.body.filters || {};
	const searchQuery = req.query.q;
	const filtersQuery = {};

	if (searchQuery) {
		filtersQuery.$text = { $search: searchQuery, $diacriticSensitive: true };
	}

	Object.keys(filters).forEach((key) => {
		filtersQuery[key] = { $in: filters[key] };
	});

	const apiFeatures = new APIFeatures(User.find(filtersQuery || {}), req.query)
		.limitFields()
		.sort()
		.paginate()
		.filter();

	const users = await apiFeatures.query;
	const total = await User.countDocuments(filtersQuery);

	res.status(200).json({
		status: 'success',
		result: users.length,
		total,
		data: users,
	});
});

exports.updateMe = catchAsync(async (req, res, next) => {
	if (req.body.password || req.body.passwordConfirm)
		return next(
			new AppError(
				'You are not allowed to change password here! Please use route: /updateMyPassword instead.',
				400
			)
		);

	// 2) Allow fields to be updated
	const filteredBody = handlerFactory.filterObj(req.body, 'name', 'email');

	if (req.file) {
		if (process.env.NODE_ENV === 'development') {
			await writeFileAsync(`public/images/users/${req.file.filename}`, req.file.buffer)

			filteredBody.image = `users/${req.file.filename}`;
		}

		if (process.env.NODE_ENV === 'production') {
			const result = await uploadBufferImageToS3(req.file.buffer, req.file.filename, 'users');
			filteredBody.image = result.Key;
		}
	}

	const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser,
		},
	});
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	// 1) Get the User from collection
	const user = await User.findById(req.user.id).select('+password');

	if (user.oauthProvider){
		return next(new AppError('Can not change password', 401));
	}

	// 2) Check if POSTed current password is correct
	if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
		return next(new AppError('Your current password is incorrect! Please try again.'));
	}

	// 3) If so, update Password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();

	// 4) Log user in, send JWT
	const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});

	user.password = undefined;

	res.status(200).json({
		status: 'success',
		data: user,
		token,
	});
});

exports.updateUser = catchAsync(async (req, res, next) => {
	let filteredBody;

	if (req.user.role === 'owner') {
		filteredBody = handlerFactory.filterObj(req.body, 'name', 'role');
	}
	if (req.user.role === 'admin') {
		filteredBody = handlerFactory.filterObj(req.body, 'name');
	}

	const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
		new: true,
		runValidators: true,
	});
	if (!updatedUser) {
		return next(new AppError('No user found with that id', 404));
	}

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser,
		},
	});
});

exports.getUser = factory.getOne(User);

// Do NOT update passwords with this!
exports.deleteUser = factory.deleteOne(User);
