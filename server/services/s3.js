const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');
require('dotenv').config({path: '../config.env'});


const s3 = new S3({
	region: process.env.AWS_BUCKET_REGION,
	accessKeyId: process.env.AWS_ACCESS_KEY,
	secretAccessKey: process.env.AWS_SECRET_KEY
})

// upload a file from S3
exports.uploadFileToS3 = function(file, folder=''){
	const fileStream = fs.createReadStream(file.path);

	const uploadParams = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Body: fileStream,
		Key: `${folder}/${file.filename}`,
	}

	return s3.upload(uploadParams).promise();
}

exports.uploadBase64ImageToS3 = function(base64Data, fileName, folder='') {
	base64Data = base64Data.replace(/^data:image\/\w+;base64,/, '');
	const buffer = Buffer.from(base64Data, 'base64');

	const uploadParams = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Body: buffer,
		Key: `${folder}/${fileName}`,
		contentEncoding: 'base64',
	}

	return s3.upload(uploadParams).promise();
}

exports.uploadBufferImageToS3 = function(bufferData, fileName, folder='') {

	const uploadParams = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Body: bufferData,
		Key: `${folder}/${fileName}`,
		contentEncoding: 'base64',
	}

	return s3.upload(uploadParams).promise();
}


exports.deleteFileFromS3 = function (filename){
	const deleteParams = {
		Bucket: process.env.AWS_BUCKET_NAME,
		Key: filename,
	}

	return s3.deleteObject(deleteParams).promise();
}