const redis = require('redis');
const AppUtils = require('./app.utils');

class Redis {

	static USERS_KEY = 'hust-maker-users';
	static DESIGN_ROOMS_KEY = 'hust-maker-design-rooms';

	constructor() {
		this.client = redis.createClient();
		this.client.on('error', (err) => {
			console.log(`[!] Redis error`);
			AppUtils.writeErrorLog(err.stack || err);
		});
		this.client
			.connect()
			.then(() => console.log('[*] Redis connect successfully!'));
	}

	static getInstance() {
		if (!this.instance) {
			this.instance = new Redis();
		}

		return this.instance;
	}
}

module.exports = Redis;