const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const bedrock = new AWS.BedrockRuntime({ region: process.env.AWS_REGION || 'me-south-1' });
const polly = new AWS.Polly({ region: process.env.AWS_REGION || 'me-south-1' });
const s3 = new AWS.S3();

// Table names from environment variables
const VOCABULARY_TABLE = process.env.VOCABULARY_TABLE || 'Vocabulary';
const BOOKS_TABLE = process.env.BOOKS_TABLE || 'Books';
const USER_POOL_ID = process.env.USER_POOL_ID || 'me-south-1_X7adr285t';
const AUDIO_BUCKET = process.env.AUDIO_BUCKET || 'ReadingMaterialsBucket';

/**
 * Manages vocabulary terms and learning aids for students
 * Supports CRUD operations for vocabulary with AI-powered definitions and examples
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
    
    // Get user info from Cognito authorizer
    const userInfo = getUserInfoFromEvent(event);
    
    // Route based on HTTP method
    switch (httpMethod) {
      case 'GET':
        // Get a specific vocabulary term
        if (pathParameters.termId) {
          return await getVocabularyTerm(pathParameters.termId);
        }
        // List vocabulary terms based on query parameters
        else {
          return await listVocabularyTerms(queryParameters, userInfo);
        }
        
      case 'POST':
        // Create a new vocabulary term
        if (requestBody.action === 'generateAudio') {
          return await generateAudioForTerm(requestBody.termId);
        } else if (requestBody.action === 'extractTerms') {
          return await extractTermsFromText(requestBody, userInfo);
        } else {
          return await createVocabularyTerm(requestBody, userInfo);
        }
        
      case 'PUT':
        // Update an existing vocabulary term
        if (!pathParameters.termId) {
          return errorResponse(400, 'Missing termId parameter');
        }
        return await updateVocabularyTerm(pathParameters.termId, requestBody, userInfo);
        
      case 'DELETE':
        // Delete a vocabulary term
        if (!pathParameters.termId) {
          return errorResponse(400, 'Missing termId parameter');
        }
        return await deleteVocabularyTerm(pathParameters.termId, userInfo);
        
      default:
        return errorResponse(405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return errorResponse(500, 'Internal server error', error.message);
  }
};

/**
 * Extract user information from the event
 */
function getUserInfoFromEvent(event) {
  try {
    if (event.requestContext && 
        event.requestContext.authorizer && 
        event.requestContext.authorizer.claims) {
      
      const claims = event.requestContext.authorizer.claims;
      
      return {
        userId: claims.sub,
        email: claims.email,
        userType: claims['custom:userType'] || 'reader',
        name: claims.name || claims.email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting user info:', error);
    return null;
  }
}

/**
 * Create a new vocabulary term
 */
async function createVocabularyTerm(data, userInfo) {
  // Validate required fields
  if (!data.term) {
    return errorResponse(400, 'term is required');
  }
  
  // Use authenticated user ID or the provided one
  const userId = userInfo ? userInfo.userId : data.userId;
  
  if (!userId) {
    return errorResponse(400, 'userId is required when not authenticated');
  }
  
  // Generate a unique ID for the term
  const termId = `term-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  // Generate definition and examples if not provided
  let definition = data.definition;
  let examples = data.examples;
  let partOfSpeech = data.partOfSpeech;
  let synonyms = data.synonyms;
  let antonyms = data.antonyms;
  
  if (!definition || !examples) {
    const enrichedData = await enrichVocabularyTerm(data.term, data.bookId, data.context);
    
    definition = definition || enrichedData.definition;
    examples = examples || enrichedData.examples;
    partOfSpeech = partOfSpeech || enrichedData.partOfSpeech;
    synonyms = synonyms || enrichedData.synonyms;
    antonyms = antonyms || enrichedData.antonyms;
  }
  
  // Create vocabulary item
  const vocabularyItem = {
    term_id: termId,
    user_id: userId,
    term: data.term,
    definition: definition || '',
    examples: examples || [],
    part_of_speech: partOfSpeech || '',
    synonyms: synonyms || [],
    antonyms: antonyms || [],
    book_id: data.bookId || null,
    chapter_id: data.chapterId || null,
    page_id: data.pageId || null,
    context: data.context || null,
    mastery_level: 0,
    review_count: 0,
    last_reviewed: null,
    audio_url: null,
    created_at: timestamp,
    updated_at: timestamp
  };
  
  // Save to DynamoDB
  const params = {
    TableName: VOCABULARY_TABLE,
    Item: vocabularyItem
  };
  
  await dynamoDB.put(params).promise();
  
  // Generate audio if requested
  if (data.generateAudio) {
    const audioUrl = await generateAudioForWord(data.term, termId);
    
    if (audioUrl) {
      // Update the term with audio URL
      const updateParams = {
        TableName: VOCABULARY_TABLE,
        Key: { term_id: termId },
        UpdateExpression: 'SET audio_url = :audioUrl',
        ExpressionAttributeValues: {
          ':audioUrl': audioUrl
        }
      };
      
      await dynamoDB.update(updateParams).promise();
      vocabularyItem.audio_url = audioUrl;
    }
  }
  
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Vocabulary term created successfully',
      termId,
      term: vocabularyItem
    })
  };
}

/**
 * Get a specific vocabulary term
 */
async function getVocabularyTerm(termId) {
  const params = {
    TableName: VOCABULARY_TABLE,
    Key: { term_id: termId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Vocabulary term not found');
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      term: result.Item
    })
  };
}

/**
 * List vocabulary terms with optional filtering
 */
async function listVocabularyTerms(queryParams, userInfo) {
  let params = {
    TableName: VOCABULARY_TABLE
  };
  
  // Apply filters based on query parameters
  let filterExpressions = [];
  let expressionAttributeValues = {};
  
  // Filter by user ID
  if (queryParams.userId) {
    filterExpressions.push('user_id = :userId');
    expressionAttributeValues[':userId'] = queryParams.userId;
  }
  
  // Filter by book ID
  if (queryParams.bookId) {
    filterExpressions.push('book_id = :bookId');
    expressionAttributeValues[':bookId'] = queryParams.bookId;
  }
  
  // Filter by chapter ID
  if (queryParams.chapterId) {
    filterExpressions.push('chapter_id = :chapterId');
    expressionAttributeValues[':chapterId'] = queryParams.chapterId;
  }
  
  // Filter by page ID
  if (queryParams.pageId) {
    filterExpressions.push('page_id = :pageId');
    expressionAttributeValues[':pageId'] = queryParams.pageId;
  }
  
  // Filter by mastery level
  if (queryParams.masteryLevel) {
    filterExpressions.push('mastery_level = :masteryLevel');
    expressionAttributeValues[':masteryLevel'] = parseInt(queryParams.masteryLevel, 10);
  }
  
  // Filter by term (partial match)
  if (queryParams.term) {
    filterExpressions.push('contains(term, :term)');
    expressionAttributeValues[':term'] = queryParams.term;
  }
  
  // Apply filters if any
  if (filterExpressions.length > 0) {
    params.FilterExpression = filterExpressions.join(' AND ');
    params.ExpressionAttributeValues = expressionAttributeValues;
  }
  
  // If user is authenticated and not a librarian, only show their terms
  if (userInfo && userInfo.userType !== 'librarian' && !queryParams.userId) {
    if (!params.FilterExpression) {
      params.FilterExpression = 'user_id = :currentUserId';
    } else {
      params.FilterExpression += ' AND user_id = :currentUserId';
    }
    
    if (!params.ExpressionAttributeValues) {
      params.ExpressionAttributeValues = {};
    }
    params.ExpressionAttributeValues[':currentUserId'] = userInfo.userId;
  }
  
  const result = await dynamoDB.scan(params).promise();
  
  // Sort results if requested
  let sortedItems = result.Items;
  
  if (queryParams.sortBy) {
    const sortField = queryParams.sortBy;
    const sortDirection = queryParams.sortDirection === 'desc' ? -1 : 1;
    
    sortedItems = sortedItems.sort((a, b) => {
      if (a[sortField] < b[sortField]) return -1 * sortDirection;
      if (a[sortField] > b[sortField]) return 1 * sortDirection;
      return 0;
    });
  }
  
  // Apply pagination if requested
  let paginatedItems = sortedItems;
  
  if (queryParams.limit) {
    const limit = parseInt(queryParams.limit, 10);
    const offset = queryParams.offset ? parseInt(queryParams.offset, 10) : 0;
    
    paginatedItems = sortedItems.slice(offset, offset + limit);
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      terms: paginatedItems,
      count: paginatedItems.length,
      total: result.Items.length
    })
  };
}

/**
 * Update an existing vocabulary term
 */
async function updateVocabularyTerm(termId, data, userInfo) {
  // Get existing term
  const params = {
    TableName: VOCABULARY_TABLE,
    Key: { term_id: termId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Vocabulary term not found');
  }
  
  // Check if user has permission to update this term
  if (userInfo && userInfo.userType !== 'librarian' && result.Item.user_id !== userInfo.userId) {
    return errorResponse(403, 'You can only update your own vocabulary terms');
  }
  
  // Build update expression
  let updateExpression = 'SET updated_at = :updatedAt';
  let expressionAttributeValues = {
    ':updatedAt': new Date().toISOString()
  };
  
  // Update fields if provided
  if (data.definition !== undefined) {
    updateExpression += ', definition = :definition';
    expressionAttributeValues[':definition'] = data.definition;
  }
  
  if (data.examples !== undefined) {
    updateExpression += ', examples = :examples';
    expressionAttributeValues[':examples'] = data.examples;
  }
  
  if (data.partOfSpeech !== undefined) {
    updateExpression += ', part_of_speech = :partOfSpeech';
    expressionAttributeValues[':partOfSpeech'] = data.partOfSpeech;
  }
  
  if (data.synonyms !== undefined) {
    updateExpression += ', synonyms = :synonyms';
    expressionAttributeValues[':synonyms'] = data.synonyms;
  }
  
  if (data.antonyms !== undefined) {
    updateExpression += ', antonyms = :antonyms';
    expressionAttributeValues[':antonyms'] = data.antonyms;
  }
  
  if (data.masteryLevel !== undefined) {
    updateExpression += ', mastery_level = :masteryLevel';
    expressionAttributeValues[':masteryLevel'] = data.masteryLevel;
  }
  
  if (data.reviewCount !== undefined) {
    updateExpression += ', review_count = :reviewCount';
    expressionAttributeValues[':reviewCount'] = data.reviewCount;
  }
  
  if (data.lastReviewed !== undefined) {
    updateExpression += ', last_reviewed = :lastReviewed';
    expressionAttributeValues[':lastReviewed'] = data.lastReviewed;
  }
  
  // Update in DynamoDB
  const updateParams = {
    TableName: VOCABULARY_TABLE,
    Key: { term_id: termId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  const updateResult = await dynamoDB.update(updateParams).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Vocabulary term updated successfully',
      term: updateResult.Attributes
    })
  };
}

/**
 * Delete a vocabulary term
 */
async function deleteVocabularyTerm(termId, userInfo) {
  // Get existing term
  const params = {
    TableName: VOCABULARY_TABLE,
    Key: { term_id: termId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Vocabulary term not found');
  }
  
  // Check if user has permission to delete this term
  if (userInfo && userInfo.userType !== 'librarian' && result.Item.user_id !== userInfo.userId) {
    return errorResponse(403, 'You can only delete your own vocabulary terms');
  }
  
  // Delete from DynamoDB
  const deleteParams = {
    TableName: VOCABULARY_TABLE,
    Key: { term_id: termId }
  };
  
  await dynamoDB.delete(deleteParams).promise();
  
  // Delete audio file if exists
  if (result.Item.audio_url) {
    try {
      const audioKey = result.Item.audio_url.split('/').pop();
      
      await s3.deleteObject({
        Bucket: AUDIO_BUCKET,
        Key: `vocabulary-audio/${audioKey}`
      }).promise();
    } catch (error) {
      console.error('Error deleting audio file:', error);
      // Continue with deletion even if audio file deletion fails
    }
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Vocabulary term deleted successfully',
      termId
    })
  };
}

/**
 * Generate audio for a vocabulary term
 */
async function generateAudioForTerm(termId) {
  // Get the term
  const params = {
    TableName: VOCABULARY_TABLE,
    Key: { term_id: termId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Vocabulary term not found');
  }
  
  const term = result.Item;
  
  // Generate audio
  const audioUrl = await generateAudioForWord(term.term, termId);
  
  if (!audioUrl) {
    return errorResponse(500, 'Failed to generate audio');
  }
  
  // Update the term with audio URL
  const updateParams = {
    TableName: VOCABULARY_TABLE,
    Key: { term_id: termId },
    UpdateExpression: 'SET audio_url = :audioUrl',
    ExpressionAttributeValues: {
      ':audioUrl': audioUrl
    },
    ReturnValues: 'ALL_NEW'
  };
  
  const updateResult = await dynamoDB.update(updateParams).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Audio generated successfully',
      term: updateResult.Attributes
    })
  };
}

/**
 * Generate audio for a word using Amazon Polly
 */
async function generateAudioForWord(word, termId) {
  try {
    // Create SSML with pronunciation emphasis
    const ssml = `<speak><prosody rate="slow"><emphasis level="moderate">${word}</emphasis></prosody></speak>`;
    
    // Generate speech using Polly
    const pollyParams = {
      Engine: 'neural',
      LanguageCode: 'en-US',
      OutputFormat: 'mp3',
      SampleRate: '24000',
      Text: ssml,
      TextType: 'ssml',
      VoiceId: 'Matthew'
    };
    
    const pollyResponse = await polly.synthesizeSpeech(pollyParams).promise();
    
    // Upload to S3
    const audioKey = `vocabulary-audio/${termId}.mp3`;
    
    await s3.putObject({
      Bucket: AUDIO_BUCKET,
      Key: audioKey,
      Body: pollyResponse.AudioStream,
      ContentType: 'audio/mpeg'
    }).promise();
    
    // Generate public URL
    const audioUrl = `https://${AUDIO_BUCKET}.s3.amazonaws.com/${audioKey}`;
    
    return audioUrl;
  } catch (error) {
    console.error('Error generating audio:', error);
    return null;
  }
}

/**
 * Extract vocabulary terms from text
 */
async function extractTermsFromText(data, userInfo) {
  // Validate required fields
  if (!data.text) {
    return errorResponse(400, 'text is required');
  }
  
  // Use authenticated user ID or the provided one
  const userId = userInfo ? userInfo.userId : data.userId;
  
  if (!userId) {
    return errorResponse(400, 'userId is required when not authenticated');
  }
  
  // Create prompt for Bedrock
  const prompt = `
Analyze the following text and identify 3-5 important vocabulary terms that would be valuable for a student to learn.
For each term, extract it from the text and provide its definition, part of speech, an example sentence (preferably from the text), 
synonyms, and antonyms.

Text: "${data.text}"

Format your response as a JSON array of objects with these fields for each term:
- term: The vocabulary word
- definition: A clear, concise definition appropriate for a student
- partOfSpeech: The grammatical category (noun, verb, adjective, etc.)
- examples: An array of 1-2 example sentences using the term
- synonyms: An array of 2-3 synonyms
- antonyms: An array of 1-2 antonyms (if applicable)
- context: The sentence from the text where the term appears

Only include terms that would be educational and appropriate for a student to learn.
`;
  
  try {
    // Call Bedrock API
    const bedrockParams = {
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
    
    const response = await bedrock.invokeModel(bedrockParams).promise();
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract and parse the terms
    const completion = responseBody.completion.trim();
    
    // Try to parse as JSON
    let extractedTerms = [];
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = completion.match(/```json\n([\s\S]*?)\n```/) || 
                        completion.match(/```\n([\s\S]*?)\n```/) || 
                        completion.match(/\[([\s\S]*?)\]/);
      
      const jsonString = jsonMatch ? jsonMatch[0] : completion;
      extractedTerms = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing Bedrock response as JSON:', parseError);
      return errorResponse(500, 'Failed to parse extracted terms');
    }
    
    // Create vocabulary terms
    const createdTerms = await Promise.all(
      extractedTerms.map(async (term) => {
        // Generate a unique ID for the term
        const termId = `term-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const timestamp = new Date().toISOString();
        
        // Create vocabulary item
        const vocabularyItem = {
          term_id: termId,
          user_id: userId,
          term: term.term,
          definition: term.definition || '',
          examples: term.examples || [],
          part_of_speech: term.partOfSpeech || '',
          synonyms: term.synonyms || [],
          antonyms: term.antonyms || [],
          book_id: data.bookId || null,
          chapter_id: data.chapterId || null,
          page_id: data.pageId || null,
          context: term.context || null,
          mastery_level: 0,
          review_count: 0,
          last_reviewed: null,
          audio_url: null,
          created_at: timestamp,
          updated_at: timestamp
        };
        
        // Save to DynamoDB
        const params = {
          TableName: VOCABULARY_TABLE,
          Item: vocabularyItem
        };
        
        await dynamoDB.put(params).promise();
        
        return vocabularyItem;
      })
    );
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Vocabulary terms extracted and created successfully',
        terms: createdTerms,
        count: createdTerms.length
      })
    };
  } catch (error) {
    console.error('Error extracting terms with Bedrock:', error);
    return errorResponse(500, 'Failed to extract vocabulary terms', error.message);
  }
}

/**
 * Enrich a vocabulary term with AI-generated content
 */
async function enrichVocabularyTerm(term, bookId, context) {
  try {
    // Create prompt for Bedrock
    const prompt = `
Provide educational information for the vocabulary term "${term}" that would help a student understand and remember it.
${context ? `The term appears in this context: "${context}"` : ''}
${bookId ? `The term is from a book with ID: ${bookId}` : ''}

Please provide:
1. A clear, concise definition appropriate for a student
2. The part of speech (noun, verb, adjective, etc.)
3. 1-2 example sentences using the term
4. 2-3 synonyms
5. 1-2 antonyms (if applicable)

Format your response as JSON with these fields: definition, partOfSpeech, examples (array), synonyms (array), antonyms (array)
`;
    
    // Call Bedrock API
    const params = {
      modelId: 'anthropic.claude-v2',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 1000,
        temperature: 0.7,
        top_p: 0.9
      })
    };
    
    const response = await bedrock.invokeModel(params).promise();
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract and parse the enriched data
    const completion = responseBody.completion.trim();
    
    // Try to parse as JSON
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = completion.match(/```json\n([\s\S]*?)\n```/) || 
                        completion.match(/```\n([\s\S]*?)\n```/) || 
                        completion.match(/{[\s\S]*?}/);
      
      const jsonString = jsonMatch ? jsonMatch[0] : completion;
      const enrichedData = JSON.parse(jsonString);
      
      return {
        definition: enrichedData.definition || '',
        partOfSpeech: enrichedData.partOfSpeech || '',
        examples: enrichedData.examples || [],
        synonyms: enrichedData.synonyms || [],
        antonyms: enrichedData.antonyms || []
      };
    } catch (parseError) {
      console.error('Error parsing Bedrock response as JSON:', parseError);
      
      // Fallback: extract data using regex
      const definitionMatch = completion.match(/definition[:\s]+(.*?)(?=part|$)/i);
      const partOfSpeechMatch = completion.match(/partOfSpeech[:\s]+(.*?)(?=examples|$)/i);
      
      return {
        definition: definitionMatch ? definitionMatch[1].trim() : '',
        partOfSpeech: partOfSpeechMatch ? partOfSpeechMatch[1].trim() : '',
        examples: [],
        synonyms: [],
        antonyms: []
      };
    }
  } catch (error) {
    console.error('Error enriching vocabulary term with Bedrock:', error);
    return {
      definition: '',
      partOfSpeech: '',
      examples: [],
      synonyms: [],
      antonyms: []
    };
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
