const express = require('express');

const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/app.error');
const globalErrorHandler = require('./controllers/error.controller');
const authController = require('./controllers/auth.controller');

const userRouter = require('./routes/user.routes');
const designRouter = require('./routes/design.routes');
const productRouter = require('./routes/product.routes');
const imageAssetRouter = require('./routes/image.asset.routes');
const templateRouter = require('./routes/template.routes');
const designPermissionRouter = require('./routes/design.permission.routes');
const templatePermissionRouter = require('./routes/template.permission.routes');

const app = express();

/**
 * GLOBAL MIDDLEWARE
 *
 * @desc all request will go through these middleware before reaching server
 *
 */

// Trust proxy -> req.headers['x-forwarded-proto'] set -> can read its value
app.set('trust proxy', process.env.VM_INSTANCE_IP);

// DEFINE VIEW ENGINE - PUG
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Allow other websites to access our API
app.use(cors()); // for get, post
app.options('*', cors()); // for patch, delete, cookie,...

// for oauth

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: `/api/v1/auth/google/callback`,
		},
		(accessToken, refreshToken, profile, done) => {
			if (profile.id) {
				return done(null, profile);
			}
		}
	)
);

// Serve static file
app.use(express.static(path.join(__dirname, 'public')));

// Prevent too many requests from 1 IP in 1 hour
const limiter = rateLimit({
	max: 100000,
	windowMs: 60 * 60 * 24,
	message: 'Too many requests from this IP, please try again in 1 hour!',
});

app.use('/api', limiter);

// See log request detail
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// body parser
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

// Compress all text (image is auto compressed)
app.use(compression());

/**
 * ROUTES
 *
 * @desc all routes for api or view
 *
 */
// TODO: Define all routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/designs', designRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/imageassets', imageAssetRouter);
app.use('/api/v1/templates', templateRouter);
app.use('/api/v1/designpermissions', designPermissionRouter);
app.use('/api/v1/templatepermissions', templatePermissionRouter);

app.use(passport.initialize());

// Oauth
app.get(
	'/api/v1/auth/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
	})
);
app.get('/api/v1/auth/google/callback', authController.googleAuth);

/**
 * HANDLE ERRORS
 */
// For undefined routes
app.all('*', (req, res, next) => {
	next(new AppError(`Can not find ${req.originalUrl} on this server!`, 404));
});

// error handler middleware
app.use(globalErrorHandler);

module.exports = app;
