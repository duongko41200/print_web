const uuidv4 = require('uuid/v4');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const AppError = require('../utils/app.error');
const catchAsync = require('../utils/catch.async');

const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
		cb(null, true);
	} else {
		cb(null, false);
		return cb(new AppError('Only .png, .jpg and .jpeg format allowed!', 400));
	}
};

exports.uploadImage = (fieldName) => {
	const multerStorage = multer.memoryStorage();

	const upload = multer({
		storage: multerStorage,
		fileFilter,
		limits: {
			fileSize: 25 * 1024 * 1024
		}
	});

	return upload.single(fieldName);
};

exports.resizeImage = (width, height) =>
	catchAsync(async (req, res, next) => {
		if (!req.file) return next();

		// for updateMe to use

		req.file.filename = `user-${req.user.id}-${Date.now()}.png`;

		await sharp(req.file.buffer)
			.resize(width, height)
			.toFormat('png')
			.png({ quality: 90, palette: true })
			.toBuffer()
			.then((buffer) => {
				req.file.buffer = buffer;
			});

		next();
	});

exports.uploadImages = (...fieldNames) => {
	const multerStorage = multer.memoryStorage();

	const upload = multer({
		storage: multerStorage,
		fileFilter,
		limits: {
			fileSize: 25 * 1024 * 1024
		}
	});

	const fields = fieldNames.map((el) => {
		return {
			name: el,
		};
	});

	return upload.fields(fields);
};

exports.resizeImages = (width, height) =>
catchAsync(async (req, res, next) => {
	if (!req.files) return next();

	await Promise.all(Object.keys(req.files).map(async (fieldName) => {
		req.files[fieldName][0].filename = `user-${req.user.id}-${Date.now()}-${fieldName}.png`;

		await sharp(req.files[fieldName][0].buffer)
			.resize(width, height)
			.toFormat('png')
			.png({ quality: 90, palette: true })
			.toBuffer()
			.then((buffer) => {
				req.files[fieldName][0].buffer = buffer;
			});
	}))
	
	next();
});