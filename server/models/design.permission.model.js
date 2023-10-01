const mongoose = require('mongoose');

const DesignPermissionSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.ObjectId,
			required: [true, 'Permission require user'],
			ref: 'User',
		},
		design: {
			type: mongoose.Schema.ObjectId,
			ref: 'Design',
			required: [true, 'Permission require design'],
		},
		type: {
			type: String,
			default: 'view',
			enum: {
				values: ['view', 'edit', 'none'],
				message: 'Permission is view or edit',
			},
		},
		status: {
			type: String,
			default: 'pending',
			enum: {
				values: ['pending', 'accepted'],
				message: 'Permission status is either pending or accepted',
			},
		},
		token: String,
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// prevent duplicate permission
DesignPermissionSchema.index({design: 1, user: 1}, {unique: true});



DesignPermissionSchema.pre('save', function (next) {
	if (!this.isNew) {
		return next();
	}
	// because user need to confirm permission => status is always pending when create
	this.status = 'pending';

	next();
});


const Permission = mongoose.model('DesignPermission', DesignPermissionSchema);
module.exports = Permission;
