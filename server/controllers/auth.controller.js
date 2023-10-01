const { promisify } = require('util');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const catchAsync = require('../utils/catch.async');
const AppError = require('../utils/app.error');
const handlerFactory = require('./handler.factory');

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user, statusCode, req, res) => {
	const token = signToken(user._id);

	// res.cookie('jwt', token, {
	// 	expires: new Date(
	// 		Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
	// 	),
	// 	httpOnly: true,
	// 	secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
	// });

	// Remove password from output
	user.password = undefined;

	res.status(statusCode).json({
		status: 'success',
		token,
		data: user,
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const filteredBody = handlerFactory.filterObj(req.body, 'name', 'email', 'password', 'passwordConfirm');

	const newUser = await User.create(filteredBody);

	createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// 1) Check if email and password exist
	if (!email || !password) {
		return next(new AppError('Please provide email and password!', 400));
	}
	// 2) Check if user exists && password is correct
	const user = await User.findOne({ email, oauthProvider: null }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect email or password', 401));
	}

	// 3) If everything ok, send token to client
	createSendToken(user, 200, req, res);
});

// LOG OUT USER
exports.logout = (req, res) => {
	res.cookie('jwt', 'loggedout', {
		expires: new Date(Date.now() + 1 * 1000),
	});
	res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
	// 1) Getting token and check of it's there
	let token;
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	if (!token) {
		return next(new AppError('You are not logged in! Please log in to get access.', 401));
	}

	// 2) Verification token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// 3) Check if user still exists
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(new AppError('The user belonging to this token does no longer exist.', 401));
	}

	// 4) Check if user changed password after the token was issued
	// if (currentUser.changedPasswordAfter(decoded.iat)) {
	// 	return next(
	// 		new AppError(
	// 			'User recently changed password! Please log in again.',
	// 			401
	// 		)
	// 	);
	// }

	// GRANT ACCESS TO PROTECTED ROUTE
	req.user = currentUser;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		// roles ['admin', 'lead-guide']. role='user'
		if (!roles.includes(req.user.role)) {
			return next(new AppError('You do not have permission to perform this action', 403));
		}

		next();
	};
};

// FOR OAUTH WITH GOOGLE
exports.googleAuth = (req, res, next) => {
	passport.authenticate('google', { failureMessage: true }, async (err, user, info) => {
		if (err) {
			return next(err);
		}

		try {
			const name = user.displayName;
			const email = user.emails[0].value;
			const image = user.photos[0] ? user.photos[0].value : null;
			const oauthProviderId = user.id;
			const oauthProvider = 'google';

			const existedUser = await User.findOne({ email, oauthProvider: 'google' });

			let currentUser = existedUser;
			if (!existedUser) {
				currentUser = await User.create({ name, email, image, oauthProvider, oauthProviderId });
			}

			const token = signToken(currentUser._id);

			res.cookie('jwt', token, {
				expires: new Date(
					Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
				),
			});

			// Remove password from output
			user.password = undefined;

			res.redirect(`${process.env.CLIENT_PROTOCOL}://${process.env.CLIENT_URL}`)

			// res.status(200).json({
			// 	status: 'success',
			// 	token,
			// 	data: user,
			// });
		} catch (error) {
			return next(error);
		}
	})(req, res, next);
};
