const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const bedrock = new AWS.BedrockRuntime({ region: 'us-east-1' });

/**
 * Lambda function for Amazon Lex V2 fulfillment.
 * Handles different intents for the Nova Hologram chatbot.
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract session attributes
    const sessionAttributes = event.sessionState.sessionAttributes || {};
    
    // Get the intent name
    const intentName = event.sessionState.intent.name;
    
    // Handle different intents
    switch (intentName) {
      case 'HelpIntent':
        return handleHelpIntent(event, sessionAttributes);
      
      case 'SearchBookIntent':
        return await handleSearchBookIntent(event, sessionAttributes);
      
      case 'GenerateHologramIntent':
        return await handleGenerateHologramIntent(event, sessionAttributes);
      
      case 'FallbackIntent':
        return handleFallbackIntent(event, sessionAttributes);
      
      default:
        return buildResponse(
          event,
          sessionAttributes,
          'I\'m not sure how to help with that. Can you try asking something else?',
          'Close'
        );
    }
  } catch (error) {
    console.error('Error processing intent:', error);
    
    return buildResponse(
      event,
      {},
      'Sorry, I encountered an error while processing your request. Please try again later.',
      'Close'
    );
  }
};

/**
 * Handle the HelpIntent
 */
function handleHelpIntent(event, sessionAttributes) {
  const helpMessage = `
    I'm your Nova Hologram assistant. Here's what I can help you with:
    
    1. Search for books - Just ask me to "find a book" or "search for [book title]"
    2. Generate holograms - Say "generate a hologram for [book title]" or "visualize [chapter title]"
    
    How can I assist you today?
  `;
  
  return buildResponse(event, sessionAttributes, helpMessage, 'ElicitIntent');
}

/**
 * Handle the SearchBookIntent
 */
async function handleSearchBookIntent(event, sessionAttributes) {
  const slots = event.sessionState.intent.slots;
  const bookTitle = slots.BookTitle?.value?.interpretedValue;
  const authorName = slots.AuthorName?.value?.interpretedValue;
  const genre = slots.Genre?.value?.interpretedValue;
  
  // If no search parameters provided, elicit them
  if (!bookTitle && !authorName && !genre) {
    return buildResponse(
      event,
      sessionAttributes,
      'What would you like to search for? You can provide a book title, author name, or genre.',
      'ElicitSlot',
      'BookTitle'
    );
  }
  
  try {
    // Construct search parameters based on provided slots
    let searchParams = {};
    let searchDescription = [];
    
    if (bookTitle) {
      searchParams.bookTitle = bookTitle;
      searchDescription.push(`title "${bookTitle}"`);
    }
    
    if (authorName) {
      searchParams.authorName = authorName;
      searchDescription.push(`author "${authorName}"`);
    }
    
    if (genre) {
      searchParams.genre = genre;
      searchDescription.push(`genre "${genre}"`);
    }
    
    // Perform the search in DynamoDB
    // This is a simplified example - you would need to implement the actual search logic
    // based on your database structure
    const searchResults = await searchBooks(searchParams);
    
    if (searchResults.length === 0) {
      return buildResponse(
        event,
        sessionAttributes,
        `I couldn't find any books matching ${searchDescription.join(', ')}. Would you like to try a different search?`,
        'ElicitIntent'
      );
    }
    
    // Format the search results
    const formattedResults = searchResults.map((book, index) => 
      `${index + 1}. "${book.title}" by ${book.author}`
    ).join('\n');
    
    const responseMessage = `I found ${searchResults.length} books matching ${searchDescription.join(', ')}:\n\n${formattedResults}\n\nWould you like to generate a hologram for any of these books?`;
    
    // Store search results in session attributes for later use
    sessionAttributes.searchResults = JSON.stringify(searchResults);
    
    return buildResponse(event, sessionAttributes, responseMessage, 'ElicitIntent');
  } catch (error) {
    console.error('Error searching for books:', error);
    
    return buildResponse(
      event,
      sessionAttributes,
      'Sorry, I encountered an error while searching for books. Please try again later.',
      'Close'
    );
  }
}

/**
 * Handle the GenerateHologramIntent
 */
async function handleGenerateHologramIntent(event, sessionAttributes) {
  const slots = event.sessionState.intent.slots;
  const bookTitle = slots.BookTitle?.value?.interpretedValue;
  const chapterTitle = slots.ChapterTitle?.value?.interpretedValue;
  const chapterNumber = slots.ChapterNumber?.value?.interpretedValue;
  
  // If no parameters provided, elicit them
  if (!bookTitle && !chapterTitle && !chapterNumber) {
    return buildResponse(
      event,
      sessionAttributes,
      'For which book or chapter would you like to generate a hologram?',
      'ElicitSlot',
      'BookTitle'
    );
  }
  
  try {
    // Construct parameters for hologram generation
    let contentToVisualize = '';
    let contentDescription = '';
    
    if (bookTitle) {
      // Fetch book content from DynamoDB
      const bookContent = await getBookContent(bookTitle);
      
      if (!bookContent) {
        return buildResponse(
          event,
          sessionAttributes,
          `I couldn't find a book titled "${bookTitle}". Would you like to search for a different book?`,
          'ElicitIntent'
        );
      }
      
      contentToVisualize = bookContent;
      contentDescription = `book "${bookTitle}"`;
    } else if (chapterTitle || chapterNumber) {
      // Fetch chapter content from DynamoDB
      const chapterIdentifier = chapterTitle || `Chapter ${chapterNumber}`;
      const chapterContent = await getChapterContent(chapterIdentifier);
      
      if (!chapterContent) {
        return buildResponse(
          event,
          sessionAttributes,
          `I couldn't find ${chapterTitle ? `a chapter titled "${chapterTitle}"` : `chapter ${chapterNumber}`}. Would you like to try a different chapter?`,
          'ElicitIntent'
        );
      }
      
      contentToVisualize = chapterContent;
      contentDescription = chapterTitle ? `chapter "${chapterTitle}"` : `chapter ${chapterNumber}`;
    }
    
    // Generate hologram using Bedrock
    const hologramResponse = await generateHologram(contentToVisualize);
    
    // Store the hologram generation job ID in session attributes
    sessionAttributes.hologramJobId = hologramResponse.jobId;
    
    const responseMessage = `I've started generating a hologram for ${contentDescription}. This may take a few moments. You can check the status by asking "What's the status of my hologram?"`;
    
    return buildResponse(event, sessionAttributes, responseMessage, 'ElicitIntent');
  } catch (error) {
    console.error('Error generating hologram:', error);
    
    return buildResponse(
      event,
      sessionAttributes,
      'Sorry, I encountered an error while generating the hologram. Please try again later.',
      'Close'
    );
  }
}

/**
 * Handle the FallbackIntent
 */
function handleFallbackIntent(event, sessionAttributes) {
  return buildResponse(
    event,
    sessionAttributes,
    "I'm not sure I understand what you're asking. You can ask me to search for books or generate holograms. What would you like to do?",
    'ElicitIntent'
  );
}

/**
 * Search for books in DynamoDB
 * This is a placeholder function - implement the actual search logic based on your database structure
 */
async function searchBooks(searchParams) {
  // This is a simplified example - implement the actual search logic based on your database structure
  console.log('Searching for books with params:', searchParams);
  
  try {
    // Example: Search in the 'book' table
    // Modify this to match your actual database schema and query needs
    let queryParams = {
      TableName: 'book',
      FilterExpression: '',
      ExpressionAttributeValues: {},
      ExpressionAttributeNames: {}
    };
    
    let filterExpressions = [];
    let attributeCounter = 1;
    
    if (searchParams.bookTitle) {
      filterExpressions.push('contains(#title, :title' + attributeCounter + ')');
      queryParams.ExpressionAttributeValues[':title' + attributeCounter] = searchParams.bookTitle;
      queryParams.ExpressionAttributeNames['#title'] = 'title';
      attributeCounter++;
    }
    
    if (searchParams.authorName) {
      filterExpressions.push('contains(#author, :author' + attributeCounter + ')');
      queryParams.ExpressionAttributeValues[':author' + attributeCounter] = searchParams.authorName;
      queryParams.ExpressionAttributeNames['#author'] = 'author';
      attributeCounter++;
    }
    
    if (searchParams.genre) {
      filterExpressions.push('contains(#genre, :genre' + attributeCounter + ')');
      queryParams.ExpressionAttributeValues[':genre' + attributeCounter] = searchParams.genre;
      queryParams.ExpressionAttributeNames['#genre'] = 'genre';
      attributeCounter++;
    }
    
    if (filterExpressions.length > 0) {
      queryParams.FilterExpression = filterExpressions.join(' AND ');
    } else {
      // If no search parameters, return empty array
      return [];
    }
    
    const result = await dynamoDB.scan(queryParams).promise();
    return result.Items || [];
  } catch (error) {
    console.error('Error searching books in DynamoDB:', error);
    throw error;
  }
}

/**
 * Get book content from DynamoDB
 * This is a placeholder function - implement the actual logic based on your database structure
 */
async function getBookContent(bookTitle) {
  console.log('Getting content for book:', bookTitle);
  
  try {
    // Example: Query the 'book' table to get the book ID
    const bookQueryParams = {
      TableName: 'book',
      FilterExpression: 'contains(#title, :title)',
      ExpressionAttributeNames: {
        '#title': 'title'
      },
      ExpressionAttributeValues: {
        ':title': bookTitle
      }
    };
    
    const bookResult = await dynamoDB.scan(bookQueryParams).promise();
    
    if (!bookResult.Items || bookResult.Items.length === 0) {
      return null;
    }
    
    const book = bookResult.Items[0];
    
    // Example: Get the book content from the 'extractedTextTable'
    const contentQueryParams = {
      TableName: 'ExtractedTextTable',
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': book.book_id
      }
    };
    
    const contentResult = await dynamoDB.query(contentQueryParams).promise();
    
    if (!contentResult.Items || contentResult.Items.length === 0) {
      return null;
    }
    
    return contentResult.Items[0].content;
  } catch (error) {
    console.error('Error getting book content from DynamoDB:', error);
    throw error;
  }
}

/**
 * Get chapter content from DynamoDB
 * This is a placeholder function - implement the actual logic based on your database structure
 */
async function getChapterContent(chapterIdentifier) {
  console.log('Getting content for chapter:', chapterIdentifier);
  
  try {
    // Example: Query the 'chapter' table to get the chapter ID
    const chapterQueryParams = {
      TableName: 'chapter',
      FilterExpression: 'contains(#title, :title)',
      ExpressionAttributeNames: {
        '#title': 'title'
      },
      ExpressionAttributeValues: {
        ':title': chapterIdentifier
      }
    };
    
    const chapterResult = await dynamoDB.scan(chapterQueryParams).promise();
    
    if (!chapterResult.Items || chapterResult.Items.length === 0) {
      return null;
    }
    
    const chapter = chapterResult.Items[0];
    
    // Example: Get the chapter content from the 'extractedTextTable'
    const contentQueryParams = {
      TableName: 'ExtractedTextTable',
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': chapter.chapter_id
      }
    };
    
    const contentResult = await dynamoDB.query(contentQueryParams).promise();
    
    if (!contentResult.Items || contentResult.Items.length === 0) {
      return null;
    }
    
    return contentResult.Items[0].content;
  } catch (error) {
    console.error('Error getting chapter content from DynamoDB:', error);
    throw error;
  }
}

/**
 * Generate a hologram using Amazon Bedrock
 * This function integrates with the existing Bedrock implementation
 */
async function generateHologram(content) {
  console.log('Generating hologram for content:', content.substring(0, 100) + '...');
  
  try {
    // Base prompt template for educational holographic scenes
    const basePrompt = `
      You are an AI that transforms story content into immersive holographic scene descriptions for an educational reading platform.

      Generate a rich, multi-sensory scene description from this input text. Include:
      - Visual setting (location, time, atmosphere)
      - Main characters or objects (description, motion)
      - Sounds or ambient noise
      - Suggested narration with emphasis for pronunciation practice
    `;
    
    const prompt = `${basePrompt.trim()}\n\nInput Text:\n${content}`;
    
    // Model ID for Amazon Nova Reel
    const modelId = "amazon.nova-reel-v1:1";
    
    // Random seed for Nova Reel
    const seed = Math.floor(Math.random() * 2147483646);
    
    // Output S3 URI for the generated video
    const outputS3Uri = "s3://storagestack-genvideosb3836295-cgsm7lv3g2uy/upload/";
    
    // Model input for Nova Reel
    const modelInput = {
      taskType: "MULTI_SHOT_AUTOMATED",
      multiShotAutomatedParams: {
        text: prompt
      },
      videoGenerationConfig: {
        fps: 24,
        durationSeconds: 60,
        dimension: "1280x720",
        seed: seed,
      },
    };
    
    // Output configuration for Nova Reel
    const outputConfig = {
      s3OutputDataConfig: {
        s3Uri: outputS3Uri
      }
    };
    
    // Start the asynchronous invocation
    const response = await bedrock.startAsyncInvoke({
      modelId: modelId,
      modelInput: JSON.stringify(modelInput),
      outputDataConfig: outputConfig
    }).promise();
    
    return {
      jobId: response.invocationArn,
      status: 'InProgress'
    };
  } catch (error) {
    console.error('Error generating hologram with Bedrock:', error);
    throw error;
  }
}

/**
 * Build the response object for Lex
 */
function buildResponse(event, sessionAttributes, message, dialogAction, slotToElicit = null) {
  const response = {
    sessionState: {
      sessionAttributes: sessionAttributes,
      dialogAction: {
        type: dialogAction
      },
      intent: event.sessionState.intent
    },
    messages: [
      {
        contentType: 'PlainText',
        content: message
      }
    ]
  };
  
  // If we need to elicit a slot, add the slot information
  if (dialogAction === 'ElicitSlot' && slotToElicit) {
    response.sessionState.dialogAction.slotToElicit = slotToElicit;
  }
  
  return response;
}
