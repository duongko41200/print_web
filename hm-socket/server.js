const express = require('express');
const dotenv = require('dotenv');
const http = require('http');
const app = express();
const AutoSaver = require('true-autosaver');
const server = http.createServer(app);

const AppUtils = require('./utils/app.utils');
const ArrayUtils = require('./utils/array');
const QueueConnection = require('./utils/queue');

app.enable('trust proxy');

const { queue_names } = require('./constants');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (error) => {
	AppUtils.writeErrorLog(error.stack || error);
	console.error('Uncaught Exception:');

	process.exit(1);
});

const socketIo = require('socket.io')(server, {
	cors: {
		origin: [`${process.env.PROTOCOL}://${process.env.SERVER_HOST}`, 'http://127.0.0.1:3000', 'http://localhost'],
		method: ['GET', 'POST'],
		transports: ['websocket', 'polling'],
	},
	path: '/hm-socket',
	allowEIO3: true,
	maxHttpBufferSize: 1e8
});

let designRooms = [];
let users = {};

const designQueue = new QueueConnection(queue_names.DESIGNS_TABLE_QUEUE);
const templateQueue = new QueueConnection(queue_names.TEMPLATES_TABLE_QUEUE);

socketIo.on('connection', async (socket) => {
	console.log('New client connected ');
	const designAutoSaver = new AutoSaver(
		`Design:${socket.id}`,
		5,
		3,
		async function (save_data) {
			if (!save_data) {
				return;
			}
			// save to db
			if (typeof save_data.objects == 'string') {
				save_data.objects = JSON.parse(save_data.objects);
			}

			const data = JSON.stringify(save_data);

			await designQueue.produce(data);

			ArrayUtils.filterUniqueByKey(save_data).forEach((el) => {
				socketIo.to(el.id).emit('saving-status', { value: 'saved' });
			});
		},
		{
			url: process.env.REDIS_URL || 'localhost:6379',
			auth: {
				username: process.env.REDIS_USERNAME,
				password: process.env.REDIS_PASSWORD,
			},
		}
	);

	const templateAutoSaver = new AutoSaver(
		`Template:${socket.id}`,
		5,
		3,
		async function (save_data) {
			if (!save_data) {
				return;
			}
			// save to db
			if (typeof save_data.objects == 'string') {
				save_data.objects = JSON.parse(save_data.objects);
			}

			const data = JSON.stringify(save_data);

			await templateQueue.produce(data);

			ArrayUtils.filterUniqueByKey(save_data).forEach((el) => {
				socket.emit('saving-status', { value: 'saved' });
			});
		},
		{
			url: process.env.REDIS_URL || 'localhost:6379',
			auth: {
				username: process.env.REDIS_USERNAME,
				password: process.env.REDIS_PASSWORD,
			},
		}
	);

	// event when someone is editing canvas
	socket.on('edit-design', async function (data) {
		if (!data) {
			return;
		}

		await socket.to(data?.id).emit('sendDataServer', data);
		
		if (data.objects) {
			await socketIo.to(data?.id).emit('saving-status', { value: 'saving' });
			await designAutoSaver.addData({ ...data });
		}
	});

	socket.on('update-design-layer', async function (data) {
		if (!data) {
			return;
		}

		await socket.to(data.id).emit('updated-layer', data);

		if (data.objects) {
			await socketIo.to(data?.id).emit('saving-status', { value: 'saving' });
			await designAutoSaver.addData({ ...data });
		}

	});

	socket.on('cursor-position', (cursorData) => {
		socket.to(cursorData.id).emit('update-cursor-position', cursorData);
	});

	// for displaying current online joiner
	socket.on('join-design', async ({ designId, user }) => {
		// join room for each design
		let design = designRooms.find((el) => el.id === designId);
		if (!design) {
			design = {
				id: designId,
				socketIds: [],
			};
			designRooms.push(design);
		}
		design.socketIds.push(socket.id);
		design.socketIds = [...new Set(design.socketIds)]; // remove duplicates
		socket.join(designId);

		users[socket.id] = user;

		// update online joiners
		let onlineJoiners = design.socketIds.map((socketId) => users[socketId]);
		onlineJoiners = ArrayUtils.filterUniqueByKey(onlineJoiners);
		console.log(designId);
		await socketIo.to(designId).emit('update-online-joiners', onlineJoiners);

		console.log(`New client joined design`);
	});

	// for TEMPLATE
	// event when someone is editing canvas
	socket.on('edit-template', async function (data) {
		if (!data) {
			return;
		}

		if (data.objects) {
			await socket.emit('saving-status', { value: 'saving' });
			await templateAutoSaver.addData({ ...data });
		}

	});

	socket.on('update-template-layer', async function (data) {
		if (!data) {
			return;
		}

		if (data.objects) {
			await socket.emit('saving-status', { value: 'saving' });
			await templateAutoSaver.addData({ ...data });
		}

	});

	socket.on('disconnect', async (reason) => {
		// user leave room

		const leavedDesignRoom = designRooms.find((design) => design.socketIds.includes(socket.id));

		if (leavedDesignRoom) {
			socket.to(leavedDesignRoom.id).emit('user-disconnected', users[socket.id]);

			socket.leave(leavedDesignRoom.id);
			const index = leavedDesignRoom.socketIds.indexOf(socket.id);
			if (index !== -1) {
				leavedDesignRoom.socketIds.splice(index, 1);
			}

			let onlineJoiners = leavedDesignRoom.socketIds.map((socketId) => users[socketId]);
			onlineJoiners = ArrayUtils.filterUniqueByKey(onlineJoiners);
			socketIo.to(leavedDesignRoom.id).emit('update-online-joiners', onlineJoiners);
		}

		delete users[socket.id];
		console.log('Client disconnected: ', reason);
	});

	socket.on('error', (error) => {
		console.error('Socket error: ', error);
	});
});

const startServer = () => {
	const PORT = process.env.PORT || 3001;
	server.listen(PORT, () => {
		console.log(`Server socket is running on port ${PORT}`);
	});
};
// Start server initially
startServer();

// Handler other process errors
process.on('unhandledRejection', (error) => {
	console.error('Unhandled Rejection;');
	AppUtils.writeErrorLog(error.stack || error);

	// finish all pending request
	server.close(() => {
		process.exit(1);
	});
});
