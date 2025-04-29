/**
 * S3 Utilities for Lambda Functions
 */
const AWS = require('aws-sdk');
const config = require('../config');

// Initialize S3 client
const s3 = new AWS.S3({ region: config.aws.region });

// Get the configured bucket names
const READING_MATERIALS_BUCKET = config.s3.readingMaterialsBucket;
const GENERATED_CONTENT_BUCKET = config.s3.generatedContentBucket;

/**
 * Upload a file to S3
 * @param {Buffer|Blob|String} fileContent - The file content to upload
 * @param {String} key - The S3 object key
 * @param {String} contentType - The content type of the file
 * @param {String} [bucket=READING_MATERIALS_BUCKET] - The S3 bucket name
 * @returns {Promise<Object>} - S3 upload result
 */
const uploadFile = async (fileContent, key, contentType, bucket = READING_MATERIALS_BUCKET) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ContentType: contentType
  };

  return s3.upload(params).promise();
};

/**
 * Get a file from S3
 * @param {String} key - The S3 object key
 * @param {String} [bucket=READING_MATERIALS_BUCKET] - The S3 bucket name
 * @returns {Promise<Object>} - S3 get object result
 */
const getFile = async (key, bucket = READING_MATERIALS_BUCKET) => {
  const params = {
    Bucket: bucket,
    Key: key
  };

  return s3.getObject(params).promise();
};

/**
 * Delete a file from S3
 * @param {String} key - The S3 object key
 * @param {String} [bucket=READING_MATERIALS_BUCKET] - The S3 bucket name
 * @returns {Promise<Object>} - S3 delete object result
 */
const deleteFile = async (key, bucket = READING_MATERIALS_BUCKET) => {
  const params = {
    Bucket: bucket,
    Key: key
  };

  return s3.deleteObject(params).promise();
};

/**
 * List files in an S3 bucket
 * @param {String} prefix - The prefix to filter objects by
 * @param {String} [bucket=READING_MATERIALS_BUCKET] - The S3 bucket name
 * @returns {Promise<Object>} - S3 list objects result
 */
const listFiles = async (prefix = '', bucket = READING_MATERIALS_BUCKET) => {
  const params = {
    Bucket: bucket,
    Prefix: prefix
  };

  return s3.listObjectsV2(params).promise();
};

/**
 * Generate a pre-signed URL for downloading a file
 * @param {String} key - The S3 object key
 * @param {String} [bucket=READING_MATERIALS_BUCKET] - The S3 bucket name
 * @param {Number} [expiresIn=3600] - URL expiration time in seconds
 * @returns {String} - Pre-signed URL
 */
const getSignedDownloadUrl = (key, bucket = READING_MATERIALS_BUCKET, expiresIn = 3600) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Expires: expiresIn
  };

  return s3.getSignedUrl('getObject', params);
};

/**
 * Generate a pre-signed URL for uploading a file
 * @param {String} key - The S3 object key
 * @param {String} contentType - The content type of the file
 * @param {String} [bucket=READING_MATERIALS_BUCKET] - The S3 bucket name
 * @param {Number} [expiresIn=3600] - URL expiration time in seconds
 * @returns {String} - Pre-signed URL
 */
const getSignedUploadUrl = (key, contentType, bucket = READING_MATERIALS_BUCKET, expiresIn = 3600) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Expires: expiresIn,
    ContentType: contentType
  };

  return s3.getSignedUrl('putObject', params);
};

module.exports = {
  uploadFile,
  getFile,
  deleteFile,
  listFiles,
  getSignedDownloadUrl,
  getSignedUploadUrl,
  READING_MATERIALS_BUCKET,
  GENERATED_CONTENT_BUCKET
};
