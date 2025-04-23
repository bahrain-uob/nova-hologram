const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Define valid file categories
const VALID_CATEGORIES = ['bookings', 'journal', 'general'];

// Define user roles and permissions
const USER_ROLES = {
  'reader': {
    canDeleteOwn: true,
    canDeleteOthers: false
  },
  'librarian': {
    canDeleteOwn: true,
    canDeleteOthers: true
  }
};

// Helper function to verify user permissions
const verifyPermissions = async (fileKey, userId, userRole) => {
  try {
    // Get the file metadata
    const headParams = {
      Bucket: 'ReadingMaterialsBucket',
      Key: fileKey
    };
    
    const headData = await s3.headObject(headParams).promise();
    
    // Extract the owner from the file path
    const keyParts = fileKey.split('/');
    const fileCategory = keyParts[0];
    const fileOwner = keyParts.length >= 2 ? keyParts[1] : null;
    
    // Check if the file category is valid
    if (!VALID_CATEGORIES.includes(fileCategory)) {
      return {
        permitted: false,
        reason: `Invalid file category: ${fileCategory}`
      };
    }
    
    // Check if the user has permission to delete this file
    const rolePermissions = USER_ROLES[userRole] || USER_ROLES['reader']; // Default to reader permissions
    
    // If the user is the owner, check if they can delete their own files
    if (fileOwner === userId) {
      return {
        permitted: rolePermissions.canDeleteOwn,
        reason: rolePermissions.canDeleteOwn ? null : 'You do not have permission to delete your own files'
      };
    } else {
      // If the user is not the owner, check if they can delete others' files
      return {
        permitted: rolePermissions.canDeleteOthers,
        reason: rolePermissions.canDeleteOthers ? null : 'You do not have permission to delete files owned by others'
      };
    }
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      return {
        permitted: false,
        reason: 'File not found'
      };
    }
    
    console.error('Error verifying permissions:', error);
    return {
      permitted: false,
      reason: 'Error verifying permissions'
    };
  }
};

exports.handler = async function (event) {
  console.log('request:', JSON.stringify(event, undefined, 2));
  
  try {
    // Parse the request body or query parameters
    let fileKey;
    let userId;
    let userRole;
    let bulkDelete = false;
    let category;
    
    // Check if the request has a body (POST/DELETE with body)
    if (event.body) {
      const requestBody = JSON.parse(event.body);
      fileKey = requestBody.key;
      userId = requestBody.userId;
      userRole = requestBody.userRole || 'reader';
      bulkDelete = requestBody.bulkDelete === true;
      category = requestBody.category;
    } else if (event.queryStringParameters) {
      // Or if it's using query parameters (DELETE with query params)
      fileKey = event.queryStringParameters.key;
      userId = event.queryStringParameters.userId;
      userRole = event.queryStringParameters.userRole || 'reader';
      bulkDelete = event.queryStringParameters.bulkDelete === 'true';
      category = event.queryStringParameters.category;
    }
    
    // Handle bulk deletion by category
    if (bulkDelete && category && userId) {
      // Validate category
      if (!VALID_CATEGORIES.includes(category)) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Invalid file category. Allowed categories: ${VALID_CATEGORIES.join(', ')}`,
            allowedCategories: VALID_CATEGORIES
          })
        };
      }
      
      // Check if user has permission for bulk deletion
      const canBulkDelete = userRole === 'librarian' || (userRole === 'reader' && USER_ROLES['reader'].canDeleteOwn);
      
      if (!canBulkDelete) {
        return {
          statusCode: 403,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'You do not have permission to perform bulk deletion'
          })
        };
      }
      
      // List files to delete
      const prefix = userRole === 'librarian' ? `${category}/` : `${category}/${userId}/`;
      
      const listParams = {
        Bucket: 'ReadingMaterialsBucket',
        Prefix: prefix
      };
      
      const listedObjects = await s3.listObjectsV2(listParams).promise();
      
      if (listedObjects.Contents.length === 0) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `No files found in category '${category}'${userRole !== 'librarian' ? ' for this user' : ''}`
          })
        };
      }
      
      // Delete all matching files
      const deletePromises = listedObjects.Contents.map(async (file) => {
        const deleteParams = {
          Bucket: 'ReadingMaterialsBucket',
          Key: file.Key
        };
        
        return s3.deleteObject(deleteParams).promise();
      });
      
      await Promise.all(deletePromises);
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Successfully deleted ${listedObjects.Contents.length} files from category '${category}'`,
          count: listedObjects.Contents.length,
          category: category
        })
      };
    }
    
    // For single file deletion
    // Validate required parameters
    if (!fileKey) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'File key is required for deletion'
        })
      };
    }
    
    // Verify permissions
    if (userId) {
      const permissionCheck = await verifyPermissions(fileKey, userId, userRole);
      
      if (!permissionCheck.permitted) {
        return {
          statusCode: 403,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: permissionCheck.reason || 'You do not have permission to delete this file'
          })
        };
      }
    }
    
    // Get file metadata before deletion for the response
    let fileMetadata = null;
    try {
      const headParams = {
        Bucket: 'ReadingMaterialsBucket',
        Key: fileKey
      };
      
      const headData = await s3.headObject(headParams).promise();
      
      // Extract basic file information
      const keyParts = fileKey.split('/');
      const fileCategory = keyParts[0];
      const fileOwner = keyParts.length >= 2 ? keyParts[1] : null;
      const fileName = keyParts[keyParts.length - 1];
      
      fileMetadata = {
        key: fileKey,
        category: fileCategory,
        owner: fileOwner,
        fileName: fileName,
        contentType: headData.ContentType,
        metadata: headData.Metadata
      };
    } catch (error) {
      if (error.code === 'NoSuchKey') {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'File not found',
            error: error.message
          })
        };
      }
    }
    
    // Delete the file from S3
    const deleteParams = {
      Bucket: 'ReadingMaterialsBucket',
      Key: fileKey
    };
    
    await s3.deleteObject(deleteParams).promise();
    
    // Return success response
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'File deleted successfully',
        deletedKey: fileKey,
        fileInfo: fileMetadata
      })
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Error deleting file',
        error: error.message
      })
    };
  }
}