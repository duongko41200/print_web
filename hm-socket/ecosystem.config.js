module.exports = {
	apps: [
		{
			name: `socket.server`,
			script: `./server.js`,
			instances: 1,
		},
		{
			name: `worker.db.design`,
			script: `./workers/save.design.js`,
			instances: 3,
		},
		{
			name: `worker.db.template`,
			script: `./workers/save.template.js`,
			instances: 1,
		},
	],
};