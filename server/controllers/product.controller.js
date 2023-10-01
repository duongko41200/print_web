const fs = require('fs');
const util = require('util');

const Product = require('../models/product.model');
const factory = require('./handler.factory');
const catchAsync = require('../utils/catch.async');
const APIFeatures = require('../utils/api.features');
const handlerFactory = require('./handler.factory');
const AppError = require('../utils/app.error');
const { uploadBufferImageToS3 } = require('../services/s3');

const writeFileAsync = util.promisify(fs.writeFile);

exports.createProduct = catchAsync(async (req, res, next) => {
	req.body.user = req.user.id;

	if (process.env.NODE_ENV === 'development') {
		await Promise.all(Object.keys(req.files).map(async fieldName => {
			const localPath = `products/${req.files[fieldName][0].filename}`;
	
			await writeFileAsync(`public/images/${localPath}`, req.files[fieldName][0].buffer);
	
			req.body[fieldName] = localPath;
		}))
	}

	if (process.env.NODE_ENV === 'production') {
		await Promise.all(Object.keys(req.files).map(async fieldName => {
			const result = await uploadBufferImageToS3(
				req.files[fieldName][0].buffer,
				req.files[fieldName][0].filename,
				'products'
			);
			req.body[fieldName] = result.Key;
		}));
	}

	const newProduct = await Product.create(req.body);

	res.status(201).json({
		status: 'success',
		data: newProduct,
	});
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
	const products = await Product.find().sort('-numDesigns').select('image name thumbnail');

	res.status(200).json({
		status: 'success',
		result: products.length,
		data: products,
	});
});

exports.getProducts = catchAsync(async (req, res, next) => {
	const searchQuery = req.query.q;
	const filtersQuery = {};

	if (searchQuery) {
		filtersQuery.$text = { $search: searchQuery, $diacriticSensitive: true };
	}

	const apiFeatures = new APIFeatures(Product.find(filtersQuery || {}), req.query)
		.limitFields()
		.sort()
		.paginate()
		.filter();

	const products = await apiFeatures.query.populate('user');
	const total = await Product.countDocuments(filtersQuery);

	res.status(200).json({
		status: 'success',
		result: products.length,
		total,
		data: products,
	});
});

exports.updateProduct = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const product = await Product.findById(id);
	if (!product) {
		return next(new AppError('No product found with that id', 404));
	}

	if (req.user.id != product.user) {
		return next(new AppError('Only creator can update product', 401));
	}

	const filteredBody = handlerFactory.filterObj(req.body, 'name');

	if (req.file) {
		if (process.env.NODE_ENV === 'development') {
			await writeFileAsync(`public/images/products/${req.file.filename}`, req.file.buffer)

			filteredBody.thumbnail = `products/${req.file.filename}`;
		}

		if (process.env.NODE_ENV === 'production') {
			const result = await uploadBufferImageToS3(req.file.buffer, req.file.filename, 'products');
			filteredBody.thumbnail = result.Key;
		}
	}

	const updatedProduct = await Product.findByIdAndUpdate(id, filteredBody, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		status: 'success',
		message: 'Update product success',
		data: updatedProduct,
	});
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const product = await Product.findById(id);
	if (!product) {
		return next(new AppError('No product found with that id', 404));
	}

	if (req.user.id != product.user && req.user.role !== 'owner') {
		return next(new AppError('You are not creator of this product', 400));
	}

	if (product.numDesigns > 0) {
		return next(new AppError('There are some designs using this product', 400));
	}

	await product.delete();

	res.status(200).json({
		status: 'success',
		message: 'Delete product successfully',
		data: null,
	});
});

exports.getProduct = factory.getOne(Product);
