/**
 * Common utilities for Lambda functions
 * This file exports all utility functions from the individual service modules
 */

// Import utility modules
const config = require('../config');
const s3Utils = require('./s3-utils');
const dynamoDbUtils = require('./dynamodb-utils');
const cognitoUtils = require('./cognito-utils');
const textractUtils = require('./textract-utils');
const bedrockUtils = require('./bedrock-utils');

/**
 * Helper function to format Lambda responses
 * @param {Number} statusCode - HTTP status code
 * @param {Object|String} body - Response body
 * @param {Object} [headers={}] - Response headers
 * @returns {Object} - Formatted API Gateway response
 */
const formatResponse = (statusCode, body, headers = {}) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      ...headers
    },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  };
};

/**
 * Helper function to parse Lambda event body
 * @param {Object} event - Lambda event
 * @returns {Object} - Parsed body
 */
const parseEventBody = (event) => {
  if (!event.body) {
    return {};
  }
  
  try {
    return JSON.parse(event.body);
  } catch (error) {
    return event.body;
  }
};

/**
 * Helper function to get path parameters from Lambda event
 * @param {Object} event - Lambda event
 * @param {String} paramName - Parameter name
 * @returns {String|null} - Parameter value
 */
const getPathParameter = (event, paramName) => {
  if (event.pathParameters && event.pathParameters[paramName]) {
    return event.pathParameters[paramName];
  }
  return null;
};

/**
 * Helper function to get query parameters from Lambda event
 * @param {Object} event - Lambda event
 * @param {String} paramName - Parameter name
 * @returns {String|null} - Parameter value
 */
const getQueryParameter = (event, paramName) => {
  if (event.queryStringParameters && event.queryStringParameters[paramName]) {
    return event.queryStringParameters[paramName];
  }
  return null;
};

/**
 * Helper function to handle errors in Lambda functions
 * @param {Error} error - The error object
 * @returns {Object} - Formatted error response
 */
const handleError = (error) => {
  console.error('Error:', error);
  
  return formatResponse(
    error.statusCode || 500,
    {
      message: error.message || 'Internal Server Error',
      error: config.isDevelopment ? error.stack : undefined
    }
  );
};

/**
 * Helper function to validate required fields
 * @param {Object} data - The data object to validate
 * @param {Array} requiredFields - List of required field names
 * @throws {Error} - If any required field is missing
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
};

/**
 * Helper function to generate a unique ID
 * @returns {String} - Unique ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
};

// Export all utilities
module.exports = {
  // Configuration
  config,
  
  // AWS service utilities
  s3: s3Utils,
  dynamoDb: dynamoDbUtils,
  cognito: cognitoUtils,
  textract: textractUtils,
  bedrock: bedrockUtils,
  
  // Helper functions
  formatResponse,
  parseEventBody,
  getPathParameter,
  getQueryParameter,
  handleError,
  validateRequiredFields,
  generateId
};
