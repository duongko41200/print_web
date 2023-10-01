const mongoose = require('mongoose');
const Product = require('./product.model');
const DesignPermission = require('./design.permission.model');
const AppError = require('../utils/app.error');

const designSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			default: 'Untitled',
			required: [true, 'Please provide your name!'],
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
		product: {
			type: mongoose.Schema.ObjectId,
			ref: 'Product',
			required: [true, 'A design should belong to a product'],
		},
		product_export: Object,

		objects: {
			type: [Object],
			default: [],
		},

		thumbnail: String,
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

designSchema.index({ name: 'text' });

// middleware on CREATING new design
designSchema.pre('save', async function (next) {
	if (!this.isNew) {
		return next();
	}

	const product = await Product.findById(this.product);
	if (!product) {
		return next(new AppError('No product found with that id', 404));
	}

	product.numDesigns += 1;
	await product.save();

	if (!this.thumbnail) {
		this.thumbnail = product.image;
	}

	next();
});

// acl
designSchema.methods.canAccessByUser = async function (user) {
	const designPermission = await DesignPermission.findOne({
		design: this.id,
		user: user.id,
	});

	if (designPermission && (designPermission.status === 'pending' || designPermission.type === 'none')) {
		return false;
	}
	if (!designPermission && user.id != this.user.id) {
		return false;
	}

	return true;
};

const Design = mongoose.model('Design', designSchema);
module.exports = Design;
