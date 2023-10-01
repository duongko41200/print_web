const crypto = require('crypto');

const handlerFactory = require('./handler.factory');
const User = require('../models/user.model');
const Design = require('../models/design.model');
const AppError = require('../utils/app.error');
const catchAsync = require('../utils/catch.async');
const Permission = require('../models/design.permission.model');
const Email = require('../services/email');

exports.getAllPermissions = catchAsync(async (req, res, next) => {
	const { designId } = req.params;

	const filter = {};
	if (designId){
		filter.design = designId;
	}

	const permissions = await Permission.find(filter).populate('user');

	res.status(200).json({
		status: 'success',
		result: permissions.length,
		data: permissions,
	});
});

exports.getDesignPermission = catchAsync(async (req, res, next) => {
	const { designId, userId } = req.params;

	const permission = await Permission.findOne({
		design: designId,
		user: userId,
	});

	const design = await Design.findById(designId);

	if (!permission && req.user.id != design.user) {
		return next(new AppError('No permission with that design and user', 404));
	}

	res.status(200).json({
		status: 'success',
		data: permission,
	});
});

exports.getPermissionByToken = catchAsync(async (req, res, next) => {
	const { token } = req.params;

	const hashToken = crypto.createHash('sha256').update(token).digest('hex');
	const permission = await Permission.findOne({ token: hashToken });
	if (!permission) {
		return next(new AppError('Invalid token', 400));
	}

	res.status(200).json({
		status: 'success',
		data: permission,
	});
});

exports.createPermission = catchAsync(async (req, res, next) => {
	const { email, designId } = req.body;

	if (!email || !designId) {
		return next(new AppError('Require email and designId', 400));
	}

	const user = await User.findOne({ email });
	if (!user) {
		return next(new AppError('No user with that email', 404));
	}

	if (user.id == req.user.id) {
		return next(new AppError('Can not invite yourself', 400));
	}

	const permission = await Permission.findOne({user: user.id, design: designId});
	if (permission){
		return next(new AppError('You invited this people', 400));
	}

	req.body.user = user.id;

	const design = await Design.findById(designId);
	if (!design) {
		return new AppError('No design found', 404);
	}
	req.body.design = design.id;

	if (req.user.id != design.user) {
		return next(new AppError('You are not creator of this design', 401));
	}
	// generate confirm token
	const token = crypto.randomBytes(32).toString('hex');
	req.body.token = crypto.createHash('sha256').update(token).digest('hex');

	const newPermission = await Permission.create(req.body);

	// send email
	const confirmURL = `${process.env.CLIENT_PROTOCOL}://${process.env.CLIENT_URL}/invitation/design/${token}`;
	await new Email(user, confirmURL).sendDesignInvitation(req.user);

	newPermission.token = null;

	res.status(200).json({
		status: 'success',
		message: 'Send email successfully',
		data: newPermission,
	});
});

exports.updatePermission = catchAsync(async (req, res, next) => {
	const { token, id } = req.params;
	let permission;
	if (token) {
		const hashToken = crypto.createHash('sha256').update(token).digest('hex');
		permission = await Permission.findOne({ token: hashToken });
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
		permission = await Permission.findById(id);
		if (!permission) {
			return next(new AppError('No permission found', 404));
		}

		const design = await Design.findById(permission.design);
		if (!design) {
			return next(new AppError('No design found', 404));
		}

		if (req.user.id != design.user) {
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
