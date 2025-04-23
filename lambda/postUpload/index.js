const AWS = require('aws-sdk');
const s3 = new AWS.S3();

// Configure allowed file types and size limits
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Define valid file categories
const VALID_CATEGORIES = ['bookings', 'journal', 'general'];

// Category-specific validations
const CATEGORY_VALIDATIONS = {
  'bookings': {
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 5 * 1024 * 1024, // 5MB for bookings
    requiredFields: ['bookingDate', 'bookingReference']
  },
  'journal': {
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 10 * 1024 * 1024, // 10MB for journals
    requiredFields: ['journalTitle', 'author']
  }
}

exports.handler = async function (event) {
  console.log('request:', JSON.stringify(event, undefined, 2));
  
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const fileContent = Buffer.from(requestBody.fileContent, 'base64');
    const fileName = requestBody.fileName;
    const fileType = requestBody.fileType;
    const fileSize = fileContent.length;
    const fileCategory = requestBody.fileCategory || 'general'; // 'bookings' or 'journal'
    const userId = requestBody.userId || 'anonymous';
    const metadata = requestBody.metadata || {};
    
    // Validate file category
    if (!VALID_CATEGORIES.includes(fileCategory)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Invalid file category. Allowed categories: ${VALID_CATEGORIES.join(', ')}`,
          allowedCategories: VALID_CATEGORIES
        })
      };
    }
    
    // Apply category-specific validations if applicable
    if (fileCategory !== 'general' && CATEGORY_VALIDATIONS[fileCategory]) {
      const validation = CATEGORY_VALIDATIONS[fileCategory];
      
      // Validate file type for this category
      if (!validation.allowedTypes.includes(fileType)) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Invalid file type for ${fileCategory}. Allowed types: ${validation.allowedTypes.join(', ')}`,
            allowedTypes: validation.allowedTypes
          })
        };
      }
      
      // Validate file size for this category
      if (fileSize > validation.maxSize) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `File size exceeds the maximum limit of ${validation.maxSize / (1024 * 1024)}MB for ${fileCategory}`,
            maxSize: validation.maxSize
          })
        };
      }
      
      // Validate required fields for this category
      const missingFields = [];
      validation.requiredFields.forEach(field => {
        if (!metadata[field]) {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Missing required metadata fields for ${fileCategory}: ${missingFields.join(', ')}`,
            missingFields: missingFields
          })
        };
      }
    } else {
      // For general category, apply default validations
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(fileType)) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Invalid file type. Allowed types: PDF, JPEG, PNG, DOC, DOCX',
            allowedTypes: ALLOWED_FILE_TYPES
          })
        };
      }
      
      // Validate file size
      if (fileSize > MAX_FILE_SIZE) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            maxSize: MAX_FILE_SIZE
          })
        };
      }
    }
    
    // Generate a unique key for the file
    const timestamp = new Date().getTime();
    const key = `${fileCategory}/${userId}/${timestamp}-${fileName}`;
    
    // Prepare metadata for S3
    const s3Metadata = {
      'user-id': userId,
      'category': fileCategory,
      'upload-date': new Date().toISOString()
    };
    
    // Add category-specific metadata
    if (fileCategory === 'bookings' && metadata.bookingDate) {
      s3Metadata['booking-date'] = metadata.bookingDate;
      s3Metadata['booking-reference'] = metadata.bookingReference || 'unknown';
    } else if (fileCategory === 'journal' && metadata.journalTitle) {
      s3Metadata['journal-title'] = metadata.journalTitle;
      s3Metadata['author'] = metadata.author || 'unknown';
    }
    
    // Add any additional metadata provided
    Object.keys(metadata).forEach(key => {
      if (!s3Metadata[`${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`]) {
        s3Metadata[`${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = metadata[key];
      }
    });
    
    // Upload the file to S3
    const uploadParams = {
      Bucket: 'ReadingMaterialsBucket',
      Key: key,
      Body: fileContent,
      ContentType: fileType,
      Metadata: s3Metadata
    };
    
    const uploadResult = await s3.putObject(uploadParams).promise();
    
    // Generate a signed URL for the uploaded file
    const signedUrlExpireSeconds = 60 * 60; // 1 hour
    const url = s3.getSignedUrl('getObject', {
      Bucket: 'ReadingMaterialsBucket',
      Key: key,
      Expires: signedUrlExpireSeconds
    });
    
    // Prepare category-specific response data
    let categorySpecificData = {};
    if (fileCategory === 'bookings') {
      categorySpecificData = {
        bookingDate: metadata.bookingDate,
        bookingReference: metadata.bookingReference,
        bookingType: metadata.bookingType || 'standard'
      };
    } else if (fileCategory === 'journal') {
      categorySpecificData = {
        journalTitle: metadata.journalTitle,
        author: metadata.author,
        publicationDate: metadata.publicationDate,
        abstract: metadata.abstract
      };
    }
    
    // Return success response
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'File uploaded successfully',
        fileKey: key,
        etag: uploadResult.ETag,
        url: url,
        urlExpiration: signedUrlExpireSeconds,
        metadata: {
          userId: userId,
          category: fileCategory,
          uploadDate: new Date().toISOString(),
          fileName: fileName,
          fileType: fileType,
          fileSize: fileSize,
          ...categorySpecificData
        }
      })
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Error uploading file',
        error: error.message
      })
    };
  }
}