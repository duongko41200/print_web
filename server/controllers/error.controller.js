const AppError = require('../utils/app.error');
const AppUtils = require('../utils/app.utils');

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}.`;
	return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
	const values = Object.keys(err.keyValue).map(key => `${key}: ${err.keyValue[key]}`).join(', ');
	const message = `${values} existed. Please try another value!`;

	return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);

	const message = `Invalid input. ${errors.join('. ')}`;
	return new AppError(message, 400);
};

// JWT TOKEN
const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
	// A) CHECK URL
	if (req.originalUrl.startsWith('/api')) {

		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			errorName: err.name,
			message: err.message,
			stack: err.stack,
		});
	}
};

const sendErrorProd = (err, req, res) => {
	// A) CHECK URL
	if (req.originalUrl.startsWith('/api')) {
		// a) Operational, trusted error: send handled message to client
		if (err.isOperational) {

			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		}

		// b) Programming or other unknown error: don't leak error details
		// 1) Log error

		// 2) Send generic message
		return res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!',
		});
	}
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	AppUtils.writeErrorLog(err.stack || err);

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		error.message = err.message;
		error.name = err.name;
		error.code = err.code;

		if (error.name === 'CastError') error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
		if (error.name === 'JsonWebTokenError') error = handleJWTError();
		if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

		sendErrorProd(error, req, res);
	}
};
