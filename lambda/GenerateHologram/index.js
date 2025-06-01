const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();
const bedrock = new AWS.BedrockRuntime({ region: process.env.AWS_REGION || 'us-east-1' });

// Environment variables
const BOOKS_TABLE = process.env.BOOKS_TABLE || 'Books';
const CHAPTERS_TABLE = process.env.CHAPTERS_TABLE || 'Chapters';
const SCRIPT_QUEUE_URL = process.env.SCRIPT_QUEUE_URL;
const BEDROCK_QUEUE_URL = process.env.BEDROCK_QUEUE_URL;

/**
 * Generates a hologram for a book or chapter
 * This handler initiates the hologram generation process by:
 * 1. Validating the request
 * 2. Retrieving book/chapter content
 * 3. Generating a script for the hologram
 * 4. Sending the script to the Bedrock queue for video generation
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { bookId, chapterId, userId, customPrompt } = body;
    
    // Validate required parameters
    if (!bookId) {
      return errorResponse(400, 'Missing required parameter: bookId is required');
    }
    
    // Check if the book exists
    const bookDetails = await getBookDetails(bookId);
    if (!bookDetails) {
      return errorResponse(404, 'Book not found');
    }
    
    // If chapterId is provided, check if the chapter exists
    let chapterDetails = null;
    if (chapterId) {
      chapterDetails = await getChapterDetails(bookId, chapterId);
      if (!chapterDetails) {
        return errorResponse(404, 'Chapter not found');
      }
    }
    
    // Check if hologram already exists and if we need to regenerate
    const shouldRegenerate = body.regenerate === true;
    const hologramExists = chapterId 
      ? chapterDetails.trailer && chapterDetails.trailer_status === 'completed'
      : bookDetails.book_trailer && bookDetails.trailer_status === 'completed';
    
    if (hologramExists && !shouldRegenerate) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hologram already exists',
          hologramUrl: chapterId ? chapterDetails.trailer : bookDetails.book_trailer,
          status: 'completed'
        })
      };
    }
    
    // Update status to 'pending' in DynamoDB
    await updateHologramStatus(bookId, chapterId, 'pending');
    
    // Generate script for the hologram
    let scriptText, summaryText;
    
    if (chapterId) {
      // Generate script for a specific chapter
      scriptText = chapterDetails.script || await generateScript(bookDetails, chapterDetails, customPrompt);
      summaryText = chapterDetails.summary || '';
    } else {
      // Generate script for the entire book
      scriptText = bookDetails.script || await generateScript(bookDetails, null, customPrompt);
      summaryText = bookDetails.summary || '';
    }
    
    // Save the generated script if it doesn't exist
    if (chapterId && !chapterDetails.script) {
      await saveChapterScript(bookId, chapterId, scriptText);
    } else if (!bookDetails.script) {
      await saveBookScript(bookId, scriptText);
    }
    
    // Send message to Bedrock queue for video generation
    const message = {
      bookId,
      chapterNo: chapterId ? parseInt(chapterId.split('#')[1], 10) : null,
      scriptText,
      summaryText,
      isBookSummary: !chapterId,
      userId: userId || bookDetails.user_id
    };
    
    await sqs.sendMessage({
      QueueUrl: BEDROCK_QUEUE_URL,
      MessageBody: JSON.stringify(message)
    }).promise();
    
    return {
      statusCode: 202,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Hologram generation initiated',
        bookId,
        chapterId,
        status: 'pending',
        estimatedCompletionTime: '3-5 minutes'
      })
    };
    
  } catch (error) {
    console.error('Error generating hologram:', error);
    return errorResponse(500, 'Failed to generate hologram', error.message);
  }
};

/**
 * Get book details from DynamoDB
 */
async function getBookDetails(bookId) {
  const params = {
    TableName: BOOKS_TABLE,
    Key: { book_id: bookId }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error('Error getting book details:', error);
    return null;
  }
}

/**
 * Get chapter details from DynamoDB
 */
async function getChapterDetails(bookId, chapterId) {
  const params = {
    TableName: CHAPTERS_TABLE,
    Key: { 
      chapter_id: chapterId,
      book_id: bookId
    }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error('Error getting chapter details:', error);
    return null;
  }
}

/**
 * Update hologram status in DynamoDB
 */
async function updateHologramStatus(bookId, chapterId, status) {
  if (chapterId) {
    // Update chapter status
    const params = {
      TableName: CHAPTERS_TABLE,
      Key: {
        chapter_id: chapterId,
        book_id: bookId
      },
      UpdateExpression: 'SET trailer_status = :status',
      ExpressionAttributeValues: {
        ':status': status
      }
    };
    
    await dynamoDB.update(params).promise();
  } else {
    // Update book status
    const params = {
      TableName: BOOKS_TABLE,
      Key: { book_id: bookId },
      UpdateExpression: 'SET trailer_status = :status',
      ExpressionAttributeValues: {
        ':status': status
      }
    };
    
    await dynamoDB.update(params).promise();
  }
}

/**
 * Save generated script for a chapter
 */
async function saveChapterScript(bookId, chapterId, script) {
  const params = {
    TableName: CHAPTERS_TABLE,
    Key: {
      chapter_id: chapterId,
      book_id: bookId
    },
    UpdateExpression: 'SET script = :script',
    ExpressionAttributeValues: {
      ':script': script
    }
  };
  
  await dynamoDB.update(params).promise();
}

/**
 * Save generated script for a book
 */
async function saveBookScript(bookId, script) {
  const params = {
    TableName: BOOKS_TABLE,
    Key: { book_id: bookId },
    UpdateExpression: 'SET script = :script',
    ExpressionAttributeValues: {
      ':script': script
    }
  };
  
  await dynamoDB.update(params).promise();
}

/**
 * Generate a script for hologram creation using Bedrock
 */
async function generateScript(book, chapter = null, customPrompt = null) {
  // Content to base the script on
  const content = chapter ? chapter.summary || '' : book.summary || '';
  const title = book.book_title || 'Untitled Book';
  const chapterTitle = chapter ? chapter.chapter_title || `Chapter ${chapter.chapter_no}` : null;
  
  // Base prompt for script generation
  let prompt = customPrompt || `
Create a detailed script for a 1-minute educational hologram video about ${chapterTitle ? `Chapter ${chapter.chapter_no}: ${chapterTitle}` : title}.

The script should:
1. Be divided into 4-6 distinct visual scenes
2. Each scene should have a detailed visual description that creates a compelling educational visualization
3. Focus on key concepts, characters, and settings from the ${chapter ? 'chapter' : 'book'}
4. Be appropriate for students and enhance their understanding of the material
5. Each scene description should be 2-3 sentences with rich visual details
6. Do not include camera directions or transitions

Content to base the script on:
${content}
`;

  // Call Bedrock API to generate the script
  const params = {
    modelId: 'anthropic.claude-v2',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      max_tokens_to_sample: 2000,
      temperature: 0.7,
      top_p: 0.9
    })
  };
  
  try {
    const response = await bedrock.invokeModel(params).promise();
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract the script from the response
    return responseBody.completion.trim();
  } catch (error) {
    console.error('Error generating script with Bedrock:', error);
    throw new Error('Failed to generate script for hologram');
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
