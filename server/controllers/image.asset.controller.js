const fs = require('fs');
const util = require('util');

const handlerFactory = require('./handler.factory');
const ImageAsset = require('../models/image.asset.model');

const catchAsync = require('../utils/catch.async');
const APIFeatures = require('../utils/api.features');
const AppError = require('../utils/app.error');
const AppUtils = require('../utils/app.utils');
const { uploadBufferImageToS3, deleteFileFromS3 } = require('../services/s3');

const writeFileAsync = util.promisify(fs.writeFile);
const deleteFileAsync = util.promisify(fs.unlink);

exports.createImageAsset = catchAsync(async (req, res, next) => {
	if (!req.body.user) {
		req.body.user = req.user.id || req.user._id;
	}

	if (process.env.NODE_ENV === 'development') {
		const localPath = `image.assets/${req.file.filename}`;
		await writeFileAsync(`public/images/${localPath}`, req.file.buffer);
		req.body.image = localPath;
	}

	if (process.env.NODE_ENV === 'production') {
		const result = await uploadBufferImageToS3(req.file.buffer, req.file.filename, 'image.assets');
		req.body.image = result.Key;
	}

	const newImageAsset = await ImageAsset.create(req.body);

	res.status(201).json({
		status: 'success',
		data: newImageAsset,
	});
});

exports.getImagesByUser = catchAsync(async (req, res, next) => {
	const features = new APIFeatures(ImageAsset.find({ user: req.user.id }), req.query).sort().limitFields().paginate();

	const imageAssets = await features.query.populate('user');
	const total = await ImageAsset.countDocuments({ user: req.user.id });

	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		result: imageAssets.length,
		total,
		data: imageAssets,
	});
});

exports.updateImageAsset = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const imageAsset = await ImageAsset.findById(id);
	if (!imageAsset) {
		return next(new AppError('No image asset found', 404));
	}

	if (req.user.id != imageAsset.user) {
		return next(new AppError('You are not creator of this image asset', 401));
	}

	if (req.body.name) {
		imageAsset.name = req.body.name;
		await imageAsset.save();
	}

	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		data: imageAsset,
	});
});

exports.deleteImageAsset = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const imageAsset = await ImageAsset.findById(id);
	if (!imageAsset) {
		return next(new AppError('No image asset found', 404));
	}

	if (req.user.id != imageAsset.user) {
		return next(new AppError('You are not creator of this image asset', 401));
	}

	const fileName = imageAsset.image;

	await imageAsset.delete();

	if (process.env.NODE_ENV === 'development') {
		await deleteFileAsync(`public/images/${fileName}`);
	}

	if (process.env.NODE_ENV === 'production') {
		await deleteFileFromS3(fileName);
	}

	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		data: imageAsset,
	});
});
