/**
 * @brief connect to db, config env and listen to port
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const AppUtils = require('./utils/app.utils');

dotenv.config({ path: './config.env' });
const app = require('./app');

// Uncaught exception
process.on('uncaughtException', (err) => {
    AppUtils.writeErrorLog(err.stack || err);
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');

    process.exit(1);
});

// DATABASE (MONGOOSE)
// TODO: modify this depends on your type of DB
const DB = process.env.DATABASE;

mongoose
    .connect(DB, {
        useCreateIndex: true,
        useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('DB connection successfully!'));

// server listening
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App is running on port ${port} - ${process.env.NODE_ENV}`);
});

// Unhandled Rejection & Sigterm
process.on('unhandledRejection', (err) => {
    AppUtils.writeErrorLog(err.stack || err);
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');

    // finish all request pending or being handled before close server
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
	const message = '👋 SIGTERM RECEIVED. Shutting down gracefully...';

	AppUtils.writeErrorLog(message);

    server.close(() => {
        console.log('💥 Process terminated!');
    });
});
