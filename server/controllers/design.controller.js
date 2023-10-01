const fs = require('fs');
const util = require('util');

const Design = require('../models/design.model');
const Permission = require('../models/design.permission.model');
const Product = require('../models/product.model');
const AppError = require('../utils/app.error');
const catchAsync = require('../utils/catch.async');
const factory = require('./handler.factory');
const APIFeatures = require('../utils/api.features');
const Template = require('../models/template.model');
const DesignPermission = require('../models/design.permission.model');
const { uploadFile, uploadBase64ImageToS3 } = require('../services/s3');

const writeFileAsync = util.promisify(fs.writeFile);

exports.searchMines = catchAsync(async (req, res, next) => {
	const searchQuery = req.query.q;

	const filtersQuery = { user: req.user.id };
	if (searchQuery) {
		filtersQuery.$text = { $search: searchQuery, $diacriticSensitive: true };
	}

	const features = new APIFeatures(Design.find(filtersQuery).skip(0).limit(20), req.query);

	const myDesigns = await features.query;

	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		result: myDesigns.length,
		data: myDesigns,
	});
});

exports.getMyDesigns = catchAsync(async (req, res, next) => {
	const filters = { user: req.user.id };

	if (req.query.product) {
		filters.product = req.query.product;
	}

	const features = new APIFeatures(Design.find(filters), req.query).sort().limitFields().paginate();

	const myDesigns = await features.query.populate('product').populate('user');
	const total = await Design.countDocuments(filters);

	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		result: myDesigns.length,
		total,
		data: myDesigns,
	});
});

exports.getSharedDesigns = catchAsync(async (req, res, next) => {
	const permissions = await DesignPermission.find({ user: req.user.id, status: 'accepted', type: { $ne: 'none' } });

	const designIds = permissions.map((el) => el.design);

	const filters = { _id: { $in: designIds } };
	if (req.query.product) {
		filters.product = req.query.product;
	}

	const features = new APIFeatures(Design.find(filters), req.query).sort().limitFields().paginate();

	const sharedDesigns = await features.query.populate('user').populate('design');
	const total = await Design.countDocuments(filters);

	res.status(200).json({
		status: 'success',
		result: sharedDesigns.length,
		total,
		data: sharedDesigns,
	});
});

exports.createDesign = catchAsync(async (req, res, next) => {
	const { productId } = req.body;
	const { templateId } = req.params;

	const product = await Product.findById(productId);
	if (!product) {
		return next(new AppError('No product found with that id', 404));
	}

	req.body.product = product.id;

	if (templateId) {
		const template = await Template.findById(templateId).populate('user');
		if (!template) {
			return next(new AppError('No template found with that id', 404));
		}

		if (!template.canAccessByUser(req.user)) {
			return next(new AppError('No permission to access this template', 40``));
		}

		req.body.objects = template.objects;

		// update clone count
		if (template.user.id != req.user.id && !template.cloneUsers.includes(req.user.id)) {
			template.numUsed += 1;
			template.cloneUsers.push(req.user.id);
			await template.save({ validateBeforeSave: true });
		}
	}
	req.body.user = req.user.id;

	const newDesign = await Design.create(req.body);

	res.status(201).json({
		status: 'success',
		data: newDesign,
	});
});

exports.getDesign = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const design = await Design.findById(id).populate('user').populate('product');
	if (!design) {
		return next(new AppError('No design found', 404));
	}

	if (! (await design.canAccessByUser(req.user))){
		return next(new AppError('No permission to access this design', 401));
	}

	res.status(200).json({
		status: 'success',
		data: design,
	});
});

exports.getAllDesigns = catchAsync(async (req, res, next) => {
	// mines + shared

	const permissions = await DesignPermission.find({ user: req.user.id, status: 'accepted', type: { $ne: 'none' } });

	const designIds = permissions.map((el) => el.design);

	const filters = { $or: [{ _id: { $in: designIds } }, { user: req.user.id }] };

	const features = new APIFeatures(Design.find(filters), req.query).sort().limitFields().paginate();

	const designs = await features.query.populate('product').populate('user');
	const total = await Design.countDocuments(filters);

	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		result: designs.length,
		total,
		data: designs,
	});
});

exports.updateDesign = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const { thumbnail } = req.body;
	if (thumbnail) {
		const base64Data = thumbnail.replace(/^data:image\/\w+;base64,/, '');
		const bufferData = Buffer.from(base64Data, 'base64');

		const filename = `design-${id}.png`;
		if (process.env.NODE_ENV === 'development'){
			const destFolder = `public/images/designs`;
			if (!fs.existsSync(destFolder)){
				fs.mkdirSync(destFolder, {recursive: true});
			}
	
			const filePath = `${destFolder}/${filename}`;
			await writeFileAsync(`${filePath}`, bufferData);

			req.body.thumbnail = `designs/${filename}`;
		}

		if (process.env.NODE_ENV === 'production'){
			const result = await uploadBase64ImageToS3(thumbnail, filename, 'designs');
			req.body.thumbnail = result.Key;
		}

	}

	const updatedDesign = await Design.findByIdAndUpdate(id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		status: 'success',
		data: updatedDesign,
	});
});
exports.deleteDesign = factory.deleteOne(Design);
