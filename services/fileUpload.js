const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    signatureVersion: 'v4'
});
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const bucket = process.env.AWS_S3_BUCKET;
const mime = require('mime');
const path = require('path');
const md5 = require('md5');
const fs = require('fs');
const _ = require('lodash');

const FileUploader = {};

FileUploader.single = (field) => upload.single(field);

FileUploader.upload = (file) => {
  const extension = mime.extension(file.mimetype);
  const filename = path.parse(file.name).name;

  return new Promise((resolve, reject) => {
    const options = {
      Bucket: bucket,
      Key: `${ filename }-${ md5(Date.now()) }.${ extension }`,
      Body: file.data
    };

    s3.upload(options, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = FileUploader;
