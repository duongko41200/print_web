const mongoose = require('mongoose');
const TemplatePermission = require('./template.permission.model');

const TemplateSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Template should belong to one user'],
		},

		name: {
			type: String,
			default: 'Untitled',
		},
		type: {
			type: String,
			enum: ['landscape', 'portrait', 'square'],
			required: [true, 'Template must have a type'],
		},

		description: String,
		thumbnail: {
			type: String,
		},
		objects: {
			type: Array,
			default: [],
			validate: {
				validator: function (arr) {
					return arr.length > 0;
				},
				message: 'Template must contain at least one element',
			},
		},

		isPublic: {
			type: Boolean,
			default: false,
		},
		numUsed: {
			type: Number,
			default: 0,
		},
		cloneUsers: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

TemplateSchema.index({ name: 'text' });
TemplateSchema.index({ numUsed: -1 });

TemplateSchema.methods.canAccessByUser = async function (user) {
	if (!this.isPublic && user.id != this.user.id) {
		const permission = await TemplatePermission.findOne({ template: this.id, user: user.id });

		if ((permission && permission.status === 'pending') || permission.type === 'none' || !permission) {
			return false;
		}
	}

	return true;
};

const Template = mongoose.model('Template', TemplateSchema);
module.exports = Template;
