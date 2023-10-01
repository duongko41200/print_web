const fs = require('fs');
const path = require('path');

/**
 * @desc tiny utils for app
 */
class AppUtils {
    //

    /**
     * @desc Write data to log
     */
    static writeErrorLog(err_log) {
        const log_dir = `${path.dirname(__dirname)}/logs`;
        if (!fs.existsSync(log_dir)) {
            fs.mkdirSync(log_dir);
        }
        const logs_dir = `${log_dir}/log.error`;
        const datetime = new Date().toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok',
        });

		if (typeof err_log === 'object'){
			err_log = JSON.stringify(err_log);
		}

        const content = `[${datetime}] ${err_log}\n\n`;

        // Write log to file
        fs.writeFileSync(
            logs_dir,
            content,
            {
                encoding: 'utf8',
                flag: 'a',
            },
            function (err) {
                if (err) {
                    console.log('Cannot log!', err);
                }
            }
        );
    }
}

module.exports = AppUtils;