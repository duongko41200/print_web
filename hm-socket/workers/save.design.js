const { default: axios } = require('axios');
require('dotenv').config({ path: './config.env' });
const QueueConnection = require('../utils/queue');

const { queue_names } = require('../constants');
const { filterUniqueByKey } = require('../utils/array');
const AppUtils = require('../utils/app.utils');

function startWorker() {
	const queueConn = new QueueConnection(queue_names.DESIGNS_TABLE_QUEUE);

	queueConn.listen(async (msg) => {
		console.log('[x] Receive msg:');

		const data = JSON.parse(msg.content.toString());

		const updateData = filterUniqueByKey(data);

		updateData.forEach(async (el) => {
			if (typeof el.objects === 'string') {
				el.objects = JSON.parse(el.objects);
			}

			try {
				await axios.patch(
					`${process.env.API_URL}/api/v1/designs/${el.id}`,
					{
						objects: el.objects,
						thumbnail: el.thumbnail,
					},
					{
						headers: {
							Authorization: `Bearer ${el.token}`,
						},
					}
				);
				console.log('[x] Success persist data to DB. Updated: ', el.objects.length);
			} catch (err) {
				AppUtils.writeErrorLog(err.stack || err.response?.data);
				console.log('Error persisting data to DB');
			}
		});
	});
}

startWorker();
