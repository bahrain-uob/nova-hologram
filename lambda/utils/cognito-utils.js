/**
 * Cognito Utilities for Lambda Functions
 */
const AWS = require('aws-sdk');
const config = require('../config');

// Initialize Cognito Identity Service Provider client
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({ region: config.aws.region });

// Get the configured user pool ID and client ID
const USER_POOL_ID = config.cognito.userPoolId;
const CLIENT_ID = config.cognito.clientId;

/**
 * Verify a JWT token from Cognito
 * @param {String} token - The JWT token to verify
 * @returns {Promise<Object>} - The decoded token payload if valid
 */
const verifyToken = async (token) => {
  const params = {
    AccessToken: token
  };

  try {
    // This will throw an error if the token is invalid
    const result = await cognitoIdentityServiceProvider.getUser(params).promise();
    return result;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid token');
  }
};

/**
 * Get user information by username
 * @param {String} username - The username to look up
 * @returns {Promise<Object>} - User information
 */
const getUserByUsername = async (username) => {
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: username
  };

  return cognitoIdentityServiceProvider.adminGetUser(params).promise();
};

/**
 * List users in the user pool
 * @param {String} [filter] - Optional filter string
 * @param {Number} [limit=60] - Maximum number of users to return
 * @returns {Promise<Object>} - List of users
 */
const listUsers = async (filter = null, limit = 60) => {
  const params = {
    UserPoolId: USER_POOL_ID,
    Limit: limit
  };

  if (filter) {
    params.Filter = filter;
  }

  return cognitoIdentityServiceProvider.listUsers(params).promise();
};

/**
 * Create a new user in the user pool
 * @param {String} username - The username for the new user
 * @param {String} password - The temporary password
 * @param {Array} attributes - User attributes
 * @returns {Promise<Object>} - Result of user creation
 */
const createUser = async (username, password, attributes) => {
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: username,
    TemporaryPassword: password,
    UserAttributes: attributes
  };

  return cognitoIdentityServiceProvider.adminCreateUser(params).promise();
};

/**
 * Update user attributes
 * @param {String} username - The username of the user to update
 * @param {Array} attributes - User attributes to update
 * @returns {Promise<Object>} - Result of attribute update
 */
const updateUserAttributes = async (username, attributes) => {
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: username,
    UserAttributes: attributes
  };

  return cognitoIdentityServiceProvider.adminUpdateUserAttributes(params).promise();
};

/**
 * Delete a user from the user pool
 * @param {String} username - The username of the user to delete
 * @returns {Promise<Object>} - Result of user deletion
 */
const deleteUser = async (username) => {
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: username
  };

  return cognitoIdentityServiceProvider.adminDeleteUser(params).promise();
};

/**
 * Add a user to a group
 * @param {String} username - The username of the user
 * @param {String} groupName - The name of the group
 * @returns {Promise<Object>} - Result of adding user to group
 */
const addUserToGroup = async (username, groupName) => {
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: username,
    GroupName: groupName
  };

  return cognitoIdentityServiceProvider.adminAddUserToGroup(params).promise();
};

/**
 * Extract user information from a Cognito event
 * @param {Object} event - The Lambda event object
 * @returns {Object|null} - User information or null if not authenticated
 */
const getUserFromEvent = (event) => {
  try {
    // For API Gateway events with Cognito authorizer
    if (event.requestContext && event.requestContext.authorizer) {
      return event.requestContext.authorizer.claims;
    }
    
    // For Cognito triggers
    if (event.request && event.userPoolId) {
      return event.request.userAttributes;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting user from event:', error);
    return null;
  }
};

module.exports = {
  verifyToken,
  getUserByUsername,
  listUsers,
  createUser,
  updateUserAttributes,
  deleteUser,
  addUserToGroup,
  getUserFromEvent,
  USER_POOL_ID,
  CLIENT_ID
};
