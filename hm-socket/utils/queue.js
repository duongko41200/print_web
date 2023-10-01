const amqp = require('amqplib');
const AppUtils = require('./app.utils');
require('dotenv').config({ path: './config.env' });

class QueueConnection {
	constructor(queueName) {
		this.connection = null;
		this.queueName = queueName;
	}

	async connect() {
		if (!this.connection) {
			try {
				if (process.env.NODE_ENV === 'production'){
					this.connection = await amqp.connect({
						hostname: process.env.AMQP_HOST || 'localhost',
						protocol: process.env.AMQP_PROTOCOL || 'amqp',
						username: process.env.AMQP_USERNAME,
						password: process.env.AMQP_PASSWORD,
						vhost: process.env.AMQP_VHOST,
					});
				}

				if (process.env.NODE_ENV === 'development'){
					this.connection = await amqp.connect('amqp://localhost');
				}
				
				console.log('[x] Connected to RabbitMQ');
			} catch (error) {
				AppUtils.writeErrorLog(error.stack || error);
				console.error('[!] Error connecting to RabbitMQ:');
			}
		}
		return this.connection;
	}

	async close() {
		if (this.connection) {
			try {
				await this.connection.close();
				console.log('Connection to RabbitMQ closed');
			} catch (error) {
				AppUtils.writeErrorLog(error.stack || error);
				console.error('Error closing RabbitMQ connection:');
			}
		}
	}

	async produce(msg) {
		if (typeof msg === 'object'){
			msg = JSON.stringify(msg);
		}

		try {
			const conn = await this.connect();
			const channel = await conn.createChannel();
			await channel.assertQueue(this.queueName, { durable: true });

			channel.sendToQueue(this.queueName, Buffer.from(msg));

			console.log('[x] Send data to queue: ', this.queueName);
		} catch (err) {
			AppUtils.writeErrorLog(err.stack || err);
			console.log(` [!] Error publishing message`);
		}
	}

	async listen(cb) {
		const conn = await this.connect();
		const channel = await conn.createChannel();
		await channel.assertQueue(this.queueName, { durable: true });
		await channel.prefetch(1);

		console.log('[x] Worker is waiting for messages in queue: ', this.queueName);

		channel.consume(this.queueName, async (msg) => {
			if (msg) {
				try {
					cb(msg);
					channel.ack(msg);
				} catch (err) {
					console.error('Error processing message:', err);
					channel.nack(msg, false, false);
				}
			}
		});
	}
}

module.exports = QueueConnection;
