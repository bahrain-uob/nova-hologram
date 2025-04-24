/**
 * DynamoDB Utilities for Lambda Functions
 */
const AWS = require('aws-sdk');
const config = require('../config');

// Initialize DynamoDB client
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: config.aws.region });

// Get the configured table name
const TABLE_NAME = config.dynamoDb.table;

/**
 * Put an item in DynamoDB
 * @param {Object} item - The item to put
 * @param {String} [tableName=TABLE_NAME] - The DynamoDB table name
 * @returns {Promise<Object>} - DynamoDB put item result
 */
const putItem = async (item, tableName = TABLE_NAME) => {
  const params = {
    TableName: tableName,
    Item: item
  };

  return dynamoDB.put(params).promise();
};

/**
 * Get an item from DynamoDB
 * @param {Object} key - The key of the item to get
 * @param {String} [tableName=TABLE_NAME] - The DynamoDB table name
 * @returns {Promise<Object>} - DynamoDB get item result
 */
const getItem = async (key, tableName = TABLE_NAME) => {
  const params = {
    TableName: tableName,
    Key: key
  };

  return dynamoDB.get(params).promise();
};

/**
 * Delete an item from DynamoDB
 * @param {Object} key - The key of the item to delete
 * @param {String} [tableName=TABLE_NAME] - The DynamoDB table name
 * @returns {Promise<Object>} - DynamoDB delete item result
 */
const deleteItem = async (key, tableName = TABLE_NAME) => {
  const params = {
    TableName: tableName,
    Key: key
  };

  return dynamoDB.delete(params).promise();
};

/**
 * Query items from DynamoDB
 * @param {String} keyConditionExpression - The key condition expression
 * @param {Object} expressionAttributeValues - The expression attribute values
 * @param {String} [indexName] - The index name (optional)
 * @param {String} [tableName=TABLE_NAME] - The DynamoDB table name
 * @returns {Promise<Object>} - DynamoDB query result
 */
const queryItems = async (keyConditionExpression, expressionAttributeValues, indexName = null, tableName = TABLE_NAME) => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues
  };

  if (indexName) {
    params.IndexName = indexName;
  }

  return dynamoDB.query(params).promise();
};

/**
 * Scan items from DynamoDB
 * @param {String} [filterExpression] - The filter expression (optional)
 * @param {Object} [expressionAttributeValues] - The expression attribute values (optional)
 * @param {String} [tableName=TABLE_NAME] - The DynamoDB table name
 * @returns {Promise<Object>} - DynamoDB scan result
 */
const scanItems = async (filterExpression = null, expressionAttributeValues = null, tableName = TABLE_NAME) => {
  const params = {
    TableName: tableName
  };

  if (filterExpression) {
    params.FilterExpression = filterExpression;
    params.ExpressionAttributeValues = expressionAttributeValues;
  }

  return dynamoDB.scan(params).promise();
};

/**
 * Update an item in DynamoDB
 * @param {Object} key - The key of the item to update
 * @param {String} updateExpression - The update expression
 * @param {Object} expressionAttributeValues - The expression attribute values
 * @param {String} [tableName=TABLE_NAME] - The DynamoDB table name
 * @returns {Promise<Object>} - DynamoDB update item result
 */
const updateItem = async (key, updateExpression, expressionAttributeValues, tableName = TABLE_NAME) => {
  const params = {
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'UPDATED_NEW'
  };

  return dynamoDB.update(params).promise();
};

module.exports = {
  putItem,
  getItem,
  deleteItem,
  queryItems,
  scanItems,
  updateItem,
  TABLE_NAME
};
