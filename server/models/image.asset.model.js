const mongoose = require('mongoose');

const ImageAssetSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true
		},
		name: String,
		image: {
			type: String,
			required: true
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		timestamps: true
	}
);

ImageAssetSchema.pre('save', function(next) {
	if (!this.isNew) return next();

	if (!this.name) {
		this.name = this.image.split('/', 2)[1] || this.image;
	}

	next();
})

const ImageAsset = mongoose.model('ImageAsset', ImageAssetSchema);
module.exports = ImageAsset;