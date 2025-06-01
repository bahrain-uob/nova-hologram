const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// Table to store categories
const CATEGORIES_TABLE = process.env.CATEGORIES_TABLE || 'BookCategories';
const CONTENT_BUCKET = process.env.CONTENT_BUCKET || 'ReadingMaterialsBucket';

/**
 * Manages book categories for the reading platform
 * Supports creating, updating, deleting, and listing categories
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract HTTP method and path parameters
    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const queryParameters = event.queryStringParameters || {};
    
    // Parse request body if present
    let requestBody = {};
    if (event.body) {
      requestBody = JSON.parse(event.body);
    }
    
    // Route based on HTTP method
    switch (httpMethod) {
      case 'GET':
        // If categoryId is provided, get specific category, otherwise list all
        if (pathParameters.categoryId) {
          return await getCategory(pathParameters.categoryId);
        } else {
          return await listCategories(queryParameters);
        }
        
      case 'POST':
        // Create a new category
        return await createCategory(requestBody);
        
      case 'PUT':
        // Update an existing category
        if (!pathParameters.categoryId) {
          return errorResponse(400, 'Missing categoryId parameter');
        }
        return await updateCategory(pathParameters.categoryId, requestBody);
        
      case 'DELETE':
        // Delete a category
        if (!pathParameters.categoryId) {
          return errorResponse(400, 'Missing categoryId parameter');
        }
        return await deleteCategory(pathParameters.categoryId, queryParameters.force === 'true');
        
      default:
        return errorResponse(405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return errorResponse(500, 'Internal server error', error.message);
  }
};

/**
 * Create a new category
 */
async function createCategory(data) {
  // Validate required fields
  if (!data.name) {
    return errorResponse(400, 'Category name is required');
  }
  
  // Generate a unique ID if not provided
  const categoryId = data.id || `cat-${Date.now()}`;
  
  // Prepare item for DynamoDB
  const timestamp = new Date().toISOString();
  const item = {
    categoryId,
    name: data.name,
    description: data.description || '',
    ageRange: data.ageRange || { min: 0, max: 18 },
    gradeLevel: data.gradeLevel || [],
    subjects: data.subjects || [],
    tags: data.tags || [],
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: data.userId || 'system'
  };
  
  // Save to DynamoDB
  const params = {
    TableName: CATEGORIES_TABLE,
    Item: item,
    ConditionExpression: 'attribute_not_exists(categoryId)'
  };
  
  try {
    await dynamoDB.put(params).promise();
    
    // Create a folder in S3 for this category
    await s3.putObject({
      Bucket: CONTENT_BUCKET,
      Key: `categories/${categoryId}/`,
      Body: ''
    }).promise();
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Category created successfully',
        category: item
      })
    };
  } catch (error) {
    if (error.code === 'ConditionalCheckFailedException') {
      return errorResponse(409, 'Category with this ID already exists');
    }
    throw error;
  }
}

/**
 * Get a specific category by ID
 */
async function getCategory(categoryId) {
  const params = {
    TableName: CATEGORIES_TABLE,
    Key: { categoryId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Category not found');
  }
  
  // Get count of books in this category
  const bookCount = await getBookCountForCategory(categoryId);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      category: {
        ...result.Item,
        bookCount
      }
    })
  };
}

/**
 * List all categories with optional filtering
 */
async function listCategories(queryParams) {
  const params = {
    TableName: CATEGORIES_TABLE
  };
  
  // Apply filters if provided
  if (queryParams.subject) {
    params.FilterExpression = 'contains(subjects, :subject)';
    params.ExpressionAttributeValues = {
      ':subject': queryParams.subject
    };
  }
  
  if (queryParams.gradeLevel) {
    const gradeLevel = parseInt(queryParams.gradeLevel, 10);
    if (!params.FilterExpression) {
      params.FilterExpression = 'contains(gradeLevel, :grade)';
    } else {
      params.FilterExpression += ' AND contains(gradeLevel, :grade)';
    }
    
    if (!params.ExpressionAttributeValues) {
      params.ExpressionAttributeValues = {};
    }
    params.ExpressionAttributeValues[':grade'] = gradeLevel;
  }
  
  const result = await dynamoDB.scan(params).promise();
  
  // Get book counts for each category
  const categoriesWithCounts = await Promise.all(
    result.Items.map(async (category) => {
      const bookCount = await getBookCountForCategory(category.categoryId);
      return {
        ...category,
        bookCount
      };
    })
  );
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      categories: categoriesWithCounts,
      count: categoriesWithCounts.length
    })
  };
}

/**
 * Update an existing category
 */
async function updateCategory(categoryId, data) {
  // Check if category exists
  const getParams = {
    TableName: CATEGORIES_TABLE,
    Key: { categoryId }
  };
  
  const existingCategory = await dynamoDB.get(getParams).promise();
  
  if (!existingCategory.Item) {
    return errorResponse(404, 'Category not found');
  }
  
  // Prepare update expressions
  let updateExpression = 'SET updatedAt = :updatedAt';
  const expressionAttributeValues = {
    ':updatedAt': new Date().toISOString()
  };
  
  // Add fields to update
  const updateableFields = [
    { key: 'name', param: 'name' },
    { key: 'description', param: 'description' },
    { key: 'ageRange', param: 'ageRange' },
    { key: 'gradeLevel', param: 'gradeLevel' },
    { key: 'subjects', param: 'subjects' },
    { key: 'tags', param: 'tags' }
  ];
  
  updateableFields.forEach(field => {
    if (data[field.param] !== undefined) {
      updateExpression += `, ${field.key} = :${field.param}`;
      expressionAttributeValues[`:${field.param}`] = data[field.param];
    }
  });
  
  // Update in DynamoDB
  const updateParams = {
    TableName: CATEGORIES_TABLE,
    Key: { categoryId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  const result = await dynamoDB.update(updateParams).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Category updated successfully',
      category: result.Attributes
    })
  };
}

/**
 * Delete a category
 */
async function deleteCategory(categoryId, force = false) {
  // Check if category exists
  const getParams = {
    TableName: CATEGORIES_TABLE,
    Key: { categoryId }
  };
  
  const existingCategory = await dynamoDB.get(getParams).promise();
  
  if (!existingCategory.Item) {
    return errorResponse(404, 'Category not found');
  }
  
  // Check if there are books in this category
  const bookCount = await getBookCountForCategory(categoryId);
  
  if (bookCount > 0 && !force) {
    return errorResponse(409, `Cannot delete category with ${bookCount} books. Use force=true to delete anyway.`);
  }
  
  // Delete from DynamoDB
  const deleteParams = {
    TableName: CATEGORIES_TABLE,
    Key: { categoryId }
  };
  
  await dynamoDB.delete(deleteParams).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Category deleted successfully',
      categoryId
    })
  };
}

/**
 * Get the count of books in a category
 */
async function getBookCountForCategory(categoryId) {
  const params = {
    TableName: 'Books',
    FilterExpression: 'contains(categories, :categoryId)',
    ExpressionAttributeValues: {
      ':categoryId': categoryId
    },
    Select: 'COUNT'
  };
  
  try {
    const result = await dynamoDB.scan(params).promise();
    return result.Count;
  } catch (error) {
    console.error('Error getting book count:', error);
    return 0;
  }
}

/**
 * Helper function to create error responses
 */
function errorResponse(statusCode, message, details = null) {
  const response = {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message
    })
  };
  
  if (details) {
    response.body = JSON.stringify({
      message,
      details
    });
  }
  
  return response;
}
