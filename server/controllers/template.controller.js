const fs = require('fs');
const util = require('util');

const Template = require('../models/template.model');
const TemplatePermission = require('../models/template.permission.model');

const catchAsync = require('../utils/catch.async');
const AppError = require('../utils/app.error');
const APIFeatures = require('../utils/api.features');
const { uploadBase64ImageToS3 } = require('../services/s3');

const handlerFactory = require('./handler.factory');

const writeFileAsync = util.promisify(fs.writeFile);

exports.createTemplate = catchAsync(async (req, res, next) => {
	req.body.user = req.user.id;

	const newTemplate = new Template(req.body);
	await newTemplate.save({ validateBeforeSave: false });

	res.status(201).json({
		status: 'success',
		data: newTemplate,
	});
});

exports.updateTemplate = catchAsync(async (req, res, next) => {
	const { thumbnail } = req.body;
	const { id } = req.params;

	const template = await Template.findById(id);
	if (!template) {
		return next(new AppError('No template found with that id', 404));
	}

	if (req.user.id != template.user) {
		return next(new AppError('Only creator can update this template', 401));
	}

	if (thumbnail) {

		const filename = `template-${id}.png`;
		if (process.env.NODE_ENV === 'development'){
			const base64Data = thumbnail.replace(/^data:image\/\w+;base64,/, '');
			const bufferData = Buffer.from(base64Data, 'base64');
	
			const destFolder = `public/images/templates`;
			if (!fs.existsSync(destFolder)){
				fs.mkdirSync(destFolder, {recursive: true});
			}
	
			const filePath = `${destFolder}/${filename}`;
			await writeFileAsync(`${filePath}`, bufferData);
	
			req.body.thumbnail = `templates/${filename}`;
		}

		if (process.env.NODE_ENV === 'production'){
			const result = await uploadBase64ImageToS3(thumbnail, filename, 'templates');
			req.body.thumbnail = result.Key;
		}
	}

	const updatedTemplate = await Template.findByIdAndUpdate(id, req.body, {
		runValidators: true,
		new: true,
	});

	res.status(201).json({
		status: 'success',
		data: updatedTemplate,
	});
});

exports.getTemplate = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const template = await Template.findById(id).populate('user');
	if (!template) {
		return next(new AppError('No template found with that id', 404));
	}

	// check acl
	if (!(await template.canAccessByUser(req.user))) {
		return next(new AppError('No permission to access this template', 401));
	}

	res.status(200).json({
		status: 'success',
		data: template,
	});
});

exports.searchMines = catchAsync(async (req, res, next) => {
	const searchQuery = req.query.q;

	const filtersQuery = { user: req.user.id };
	if (searchQuery) {
		filtersQuery.$text = { $search: searchQuery, $diacriticSensitive: true };
	}

	const features = new APIFeatures(Template.find(filtersQuery).skip(0).limit(20), req.query);

	const myTemplates = await features.query;

	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		result: myTemplates.length,
		data: myTemplates,
	});
});

exports.getMines = catchAsync(async (req, res, next) => {
	const features = new APIFeatures(Template.find({ user: req.user.id }), req.query)
		.filter()
		.sort()
		.limitFields()
		.paginate();

	const myTemplates = await features.query.populate('user');
	const total = await Template.count({ user: req.user.id });

	res.status(200).json({
		status: 'success',
		result: myTemplates.length,
		total,
		data: myTemplates,
	});
});

exports.getShared = catchAsync(async (req, res, next) => {
	const permissions = await TemplatePermission.find({ user: req.user.id, status: 'accepted', type: { $ne: 'none' } });

	const templateIds = permissions.map((el) => el.template);

	const features = new APIFeatures(Template.find({ _id: { $in: templateIds } }), req.query)
		.filter()
		.sort()
		.limitFields()
		.paginate();

	const sharedTemplates = await features.query.populate('user');
	const total = await Template.countDocuments({ _id: { $in: templateIds } });

	res.status(200).json({
		status: 'success',
		result: sharedTemplates.length,
		total,
		data: sharedTemplates,
	});
});

exports.getAllTemplates = catchAsync(async (req, res, next) => {
	const filter = { objects: { $ne: [] }, $or: [{ isPublic: true }, { user: req.user.id }] };

	const searchQuery = req.query.q;

	if (searchQuery) {
		filter.$text = { $search: searchQuery, $diacriticSensitive: true };
	}

	const apiFeatures = new APIFeatures(Template.find(filter), req.query).filter().limitFields().paginate().sort();

	const templates = await apiFeatures.query.populate('user').populate('cloneUsers');

	const total = await Template.countDocuments(filter);

	res.status(200).json({
		status: 'success',
		result: templates.length,
		total,
		data: templates,
	});
});

exports.cloneTemplate = catchAsync(async (req, res, next) => {
	const { id } = req.params;

	const template = await Template.findById(id).populate('user');
	if (!template) {
		return next(new AppError('No template found with that id', 404));
	}

	// acl
	if (!template.canAccessByUser(req.user)) {
		return next(new AppError('You have no permission to access this template', 401));
	}

	// clone
	const newTemplate = await Template.create({
		name: `${template.name} - Copy`,
		description: template.description,
		user: req.user.id || req.user._id,
		thumbnail: template.thumbnail,
		objects: template.objects,
		type: template.type,
	});

	// update numUsed of cloned template
	if (req.user.id != template.user.id && !template.cloneUsers.includes(req.user.id)) {
		template.numUsed += 1;
		template.cloneUsers.push(req.user.id);
		await template.save({ validateBeforeSave: true });
	}

	res.status(201).json({
		status: 'success',
		message: 'Clone template success',
		data: newTemplate,
	});
});

exports.updateNumUsed = catchAsync(async (req, res, next) => {
	const {id} = req.params;

	const template = await Template.findById(id);
	if (!template){
		return next (new AppError('No template found', 404));
	}

	if (req.user.id != template.user && !template.cloneUsers.includes(req.user.id)) {
		template.numUsed += 1;
		template.cloneUsers.push(req.user.id);
		await template.save();
	}

	res.status(200).json({
		status: 'success',
		message: 'Update num used of template successfully',
		data: template
	})
});

exports.deleteTemplate = catchAsync(async (req, res, next) => {
	const {id} = req.params;

	const template = await Template.findById(id);
	if (!template){
		return next (new AppError('No template found', 404));
	}

	if (req.user.id != template.user) {
		return next(new AppError('Only creator can delete this template', 401));
	}

	await template.delete();

	res.status(200).json({
		status: 'success',
		message: 'Delete template successfully',
		data: null
	})
});