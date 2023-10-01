const mongoose = require('mongoose');

const TemplatePermissionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			required: [true, 'Permission require user'],
			ref: 'User',
		},
		template: {
			type: mongoose.Schema.ObjectId,
			ref: 'Template',
			required: [true, 'Permission require template'],
		},
		status: {
			type: String,
			default: 'pending',
			enum: {
				values: ['pending', 'accepted'],
				message: 'Status of template permission is either pending or accepted'
			}
		},
		type: {
			type: String,
			default: 'view',
			enum: {
				values: ['view', 'none'],
				message: 'Permission is view or none',
			},
		},
		token: String
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// prevent duplicate permission
TemplatePermissionSchema.index({template: 1, user: 1}, {unique: true});


const Permission = mongoose.model('TemplatePermission', TemplatePermissionSchema);
module.exports = Permission;
