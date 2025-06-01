const AWS = require('aws-sdk');
const bedrock = new AWS.BedrockRuntime({ region: process.env.AWS_REGION || 'us-east-1' });
const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Table to store summaries
const SUMMARIES_TABLE = process.env.SUMMARIES_TABLE || 'BookSummaries';
// Bucket where book content is stored
const CONTENT_BUCKET = process.env.CONTENT_BUCKET || 'ReadingMaterialsBucket';

/**
 * Generates a summary of a book using Amazon Bedrock
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse the request body
    const body = JSON.parse(event.body || '{}');
    const { bookId, bookKey, chapterId, userId, maxLength } = body;
    
    // Validate required parameters
    if (!bookId && !bookKey) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Missing required parameter: bookId or bookKey is required' 
        })
      };
    }
    
    // Check if summary already exists in DynamoDB
    if (bookId) {
      const existingSummary = await checkExistingSummary(bookId, chapterId);
      if (existingSummary) {
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'Summary already exists',
            summary: existingSummary.summary,
            learningObjectives: existingSummary.learningObjectives,
            keyTerms: existingSummary.keyTerms,
            createdAt: existingSummary.createdAt
          })
        };
      }
    }
    
    // Retrieve book content from S3
    let bookContent;
    if (bookKey) {
      bookContent = await getBookContentFromS3(bookKey);
    } else {
      // Get book key from DynamoDB using bookId
      const bookDetails = await getBookDetails(bookId);
      if (!bookDetails || !bookDetails.contentKey) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Book not found' })
        };
      }
      bookContent = await getBookContentFromS3(bookDetails.contentKey);
    }
    
    // If chapter ID is provided, extract only that chapter
    let contentToSummarize = bookContent;
    if (chapterId && bookContent.chapters && bookContent.chapters[chapterId]) {
      contentToSummarize = bookContent.chapters[chapterId].content;
    }
    
    // Generate summary using Bedrock
    const summaryData = await generateSummaryWithBedrock(contentToSummarize, maxLength);
    
    // Save summary to DynamoDB
    if (bookId) {
      await saveSummaryToDynamoDB(bookId, chapterId, summaryData, userId);
    }
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Summary generated successfully',
        bookId: bookId,
        chapterId: chapterId,
        summary: summaryData.summary,
        learningObjectives: summaryData.learningObjectives,
        keyTerms: summaryData.keyTerms
      })
    };
    
  } catch (error) {
    console.error('Error generating summary:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Failed to generate summary',
        error: error.message
      })
    };
  }
};

/**
 * Check if a summary already exists for the given book/chapter
 */
async function checkExistingSummary(bookId, chapterId) {
  const params = {
    TableName: SUMMARIES_TABLE,
    Key: {
      bookId: bookId,
      chapterId: chapterId || 'full'
    }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error('Error checking existing summary:', error);
    return null;
  }
}

/**
 * Get book details from DynamoDB
 */
async function getBookDetails(bookId) {
  const params = {
    TableName: 'Books',
    Key: { bookId }
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
 * Retrieve book content from S3
 */
async function getBookContentFromS3(key) {
  const params = {
    Bucket: CONTENT_BUCKET,
    Key: key
  };
  
  try {
    const data = await s3.getObject(params).promise();
    return JSON.parse(data.Body.toString('utf-8'));
  } catch (error) {
    console.error('Error retrieving book content from S3:', error);
    throw new Error('Failed to retrieve book content');
  }
}

/**
 * Generate summary using Amazon Bedrock
 */
async function generateSummaryWithBedrock(content, maxLength = 500) {
  // Truncate content if too long
  const truncatedContent = content.length > 24000 
    ? content.substring(0, 24000) + '...'
    : content;
  
  // Prepare prompt for Bedrock
  const prompt = `
  Please analyze the following text and provide:
  1. A concise summary (maximum ${maxLength} words)
  2. 3-5 key learning objectives
  3. A list of important terms and concepts with brief definitions
  
  Text to analyze:
  ${truncatedContent}
  `;
  
  // Call Bedrock API
  const params = {
    modelId: 'anthropic.claude-v2',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      max_tokens_to_sample: 4000,
      temperature: 0.7,
      top_p: 0.9
    })
  };
  
  try {
    const response = await bedrock.invokeModel(params).promise();
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Parse the response to extract summary, learning objectives, and key terms
    const result = parseBedrockResponse(responseBody.completion);
    
    return result;
  } catch (error) {
    console.error('Error calling Bedrock:', error);
    throw new Error('Failed to generate summary with Bedrock');
  }
}

/**
 * Parse the Bedrock response to extract structured data
 */
function parseBedrockResponse(text) {
  // Default structure
  const result = {
    summary: '',
    learningObjectives: [],
    keyTerms: {}
  };
  
  // Extract summary (assuming it's the first paragraph)
  const summaryMatch = text.match(/(?:summary|Summary):(.*?)(?=\n\s*\d\.|\n\s*Key learning objectives|\n\s*Learning objectives|\n\s*Important terms)/s);
  if (summaryMatch && summaryMatch[1]) {
    result.summary = summaryMatch[1].trim();
  } else {
    // Fallback: take the first paragraph
    const firstParagraph = text.split('\n\n')[0];
    result.summary = firstParagraph.trim();
  }
  
  // Extract learning objectives
  const objectivesMatch = text.match(/(?:learning objectives|Learning objectives|Key learning objectives):(.*?)(?=\n\s*(?:Important terms|Key terms|Concepts))/s);
  if (objectivesMatch && objectivesMatch[1]) {
    const objectives = objectivesMatch[1].trim().split('\n');
    result.learningObjectives = objectives
      .map(obj => obj.replace(/^\s*\d+\.\s*|\s*-\s*/, '').trim())
      .filter(obj => obj.length > 0);
  }
  
  // Extract key terms
  const termsMatch = text.match(/(?:Important terms|Key terms|Concepts|Terms and concepts):(.*?)$/s);
  if (termsMatch && termsMatch[1]) {
    const termsText = termsMatch[1].trim();
    const termLines = termsText.split('\n');
    
    termLines.forEach(line => {
      const termMatch = line.match(/^\s*(?:\d+\.\s*|\*\s*|-\s*)?([^:]+):\s*(.*)/);
      if (termMatch) {
        const [, term, definition] = termMatch;
        result.keyTerms[term.trim()] = definition.trim();
      }
    });
  }
  
  return result;
}

/**
 * Save summary to DynamoDB
 */
async function saveSummaryToDynamoDB(bookId, chapterId, summaryData, userId) {
  const timestamp = new Date().toISOString();
  
  const params = {
    TableName: SUMMARIES_TABLE,
    Item: {
      bookId: bookId,
      chapterId: chapterId || 'full',
      summary: summaryData.summary,
      learningObjectives: summaryData.learningObjectives,
      keyTerms: summaryData.keyTerms,
      createdAt: timestamp,
      createdBy: userId || 'system'
    }
  };
  
  try {
    await dynamoDB.put(params).promise();
    console.log('Summary saved to DynamoDB');
  } catch (error) {
    console.error('Error saving summary to DynamoDB:', error);
    throw new Error('Failed to save summary');
  }
}
