/**
 * @brief use command to import/delete all data prepared
 * node dev-data\data\import-dev-data.js --import
 * node dev-data\data\import-dev-data.js --delete
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Template = require('../../models/template.model');
const TemplatePermission = require('../../models/template.permission.model');
const User = require('../../models/user.model');
const Product = require('../../models/product.model');
const Design = require('../../models/design.model');
const DesignPermission = require('../../models/design.permission.model');
const ImageAsset = require('../../models/image.asset.model');

dotenv.config({ path: '../../config.env' });

// CONNECT TO DB
// TODO: modify this depends on your kind of DB
const DB = process.env.DATABASE;

mongoose
    .connect(DB, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    })
    .then(() => console.log('DB connection successfully!'));

// TODO: Read data

// IMPORT DATA
const importData = async () => {
    try {
        // TODO: import data

        console.log('Import data successfully!');
    } catch (err) {
        console.log(err);
    }

    process.exit();
};

// DELETE DATA
const deleteData = async () => {
    try {
        // TODO: delete data
		await Template.deleteMany();
		await TemplatePermission.deleteMany();
		await Design.deleteMany();
		await DesignPermission.deleteMany();
		await User.deleteMany();
		await Product.deleteMany();
		await ImageAsset.deleteMany();

        console.log('Delete data successfully!');
    } catch (err) {
        console.log(err);
    }

    process.exit();
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
