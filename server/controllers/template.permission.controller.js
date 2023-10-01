const crypto = require('crypto');

const AppError = require('../utils/app.error');
const catchAsync = require('../utils/catch.async');
const TemplatePermission = require('../models/template.permission.model');
const Template = require('../models/template.model');
const User = require('../models/user.model');
const Email = require('../services/email');

exports.createPermission = catchAsync(async (req, res, next) => {
	const { email, templateId } = req.body;

	if (!email || !templateId) {
		return next(new AppError('Require email and templateId', 400));
	}

	const user = await User.findOne({ email });
	if (!user) {
		return next(new AppError('No user with that email', 404));
	}

	if (user.id == req.user.id) {
		return next(new AppError('Can not invite yourself', 400));
	}

	req.body.user = user.id;

	const template = await Template.findById(templateId);
	if (!template) {
		return new AppError('No template found', 404);
	}
	req.body.template = template.id;

	if (req.user.id != template.user) {
		return next(new AppError('You are not creator of this design', 401));
	}
	// generate confirm token
	const token = crypto.randomBytes(32).toString('hex');
	req.body.token = crypto.createHash('sha256').update(token).digest('hex');

	const newPermission = await TemplatePermission.create(req.body);
	newPermission.user = user;

	// send email
	const confirmURL = `${process.env.CLIENT_PROTOCOL}://${process.env.CLIENT_URL}/invitation/template/${token}`;
	new Email(user, confirmURL).sendTemplateInvitation(req.user);

	newPermission.token = null;

	res.status(200).json({
		status: 'success',
		message: 'Send email successfully',
		data: newPermission,
	});
});

exports.getAllPermissions = catchAsync(async (req, res, next) => {
	const { templateId } = req.params;

	const permissions = await TemplatePermission.find({ template: templateId }).populate('user');

	res.status(200).json({
		status: 'success',
		result: permissions.length,
		data: permissions,
	});
});

exports.getTemplatePermission = catchAsync(async (req, res, next) => {
	const { templateId, userId } = req.params;

	const permission = await TemplatePermission.findOne({
		template: templateId,
		user: userId,
	});

	if (!permission && req.user.id != userId) {
		return next(new AppError('No permission with that template and user', 404));
	}

	res.status(200).json({
		status: 'success',
		data: permission,
	});
});

exports.getPermissionByToken = catchAsync(async (req, res, next) => {
	const { token } = req.params;

	const hashToken = crypto.createHash('sha256').update(token).digest('hex');

	const permission = await TemplatePermission.findOne({ token: hashToken });
	if (!permission) {
		return next(new AppError('Invalid token', 400));
	}

	res.status(200).json({
		status: 'success',
		data: permission,
	});
});

exports.updatePermission = catchAsync(async (req, res, next) => {
	const { token, id } = req.params;
	let permission;
	if (token) {
		const hashToken = crypto.createHash('sha256').update(token).digest('hex');
		permission = await TemplatePermission.findOne({ token: hashToken });
		if (!permission) {
			return next(new AppError('No permission found', 404));
		}

		if (req.user.id != permission.user) {
			return next(new AppError('No authorization', 401));
		}

		permission.status = 'accepted';
		permission.token = null;

		await permission.save();
	}

	if (id) {
		permission = await TemplatePermission.findById(id);
		if (!permission) {
			return next(new AppError('No template permission found', 404));
		}

		const template = await Template.findById(permission.template);
		if (!template) {
			return next(new AppError('No template found', 404));
		}

		if (req.user.id != template.user) {
			return next(new AppError('Only creator can update permission', 401));
		}

		if (permission.type !== req.body.type) {
			permission.type = req.body.type;
			await permission.save();
		}
	}

	res.status(200).json({
		status: 'success',
		data: permission,
	});
});
