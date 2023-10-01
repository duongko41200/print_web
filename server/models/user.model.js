const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please provide your name!'],
			trim: true,
		},

		image: {
			type: String,
			default: 'users/default.jpg',
		},
		email: {
			type: String,
			required: [true, 'Please provide your email!'],
			validate: [validator.isEmail, 'Please provide a valid email!'],
			unique: true,
			lowercase: true,
		},
		role: {
			type: String,
			enum: ['admin', 'user', 'owner'],
			default: 'user',
		},
		status: {
			type: String,
			enum: ['active', 'inactive'],
			default: 'active',
		},
		password: {
			type: String,
			required: [
				function () {
					return !this.oauthProvider;
				},
				'Please provide us password!',
			],
			validate: {
				validator: function (value) {
					// Additional validation logic if needed
					return !this.oauthProvider || value.length >= 8;
				},
				message: 'Password must be at least 8 characters',
			},
			select: false,
		},
		passwordConfirm: {
			type: String,
			required: [
				function () {
					return !this.oauthProvider;
				},
				'Please confirm your password!',
			],
			validate: {
				validator: function (el) {
					return !this.oauthProvider || el === this.password;
				},
				message: 'Password are not the same!',
			},
		},

		oauthProvider: { type: String }, // Store the OAuth provider name (e.g., Google, Facebook, etc.)
		oauthProviderId: { type: String }, // Store the ID associated with the user on the OAuth provider
		accessToken: { type: String },
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

userSchema.index({ name: 'text', email: 'text' });

/**
 * DOCUMENT MIDDLEWARE
 */
// ENCRYPT PASSWORD BEFORE SAVING TO DB
userSchema.pre('save', async function (next) {
	// Only run if password is modified
	if (!this.isModified('password')) return next();

	// Hash the password with cost of 12
	this.password = await bcrypt.hash(this.password, 12);

	// Delete passwordConfirm
	this.passwordConfirm = undefined;

	next();
});

// INSTANCE METHOD: Check password to login
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
