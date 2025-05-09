/**
 * Amazon Bedrock Utilities for Lambda Functions
 */
const AWS = require('aws-sdk');
const config = require('../config');

// Initialize Bedrock Runtime client
// Note: AWS SDK v2 doesn't have native Bedrock support, so we're using a custom endpoint
const bedrockRuntime = new AWS.BedrockRuntime || new AWS.Endpoint(`bedrock-runtime.${config.aws.region}.amazonaws.com`);

// Get the configured model ID
const MODEL_ID = config.bedrock.modelId;

/**
 * Invoke a Bedrock model with text prompt
 * @param {String} prompt - The text prompt
 * @param {String} [modelId=MODEL_ID] - The Bedrock model ID
 * @returns {Promise<Object>} - Bedrock invoke model result
 */
const invokeModel = async (prompt, modelId = MODEL_ID) => {
  // Format the request body based on the model
  let requestBody;

  if (modelId.startsWith('anthropic.claude')) {
    // Claude models use this format
    requestBody = {
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      max_tokens_to_sample: 2000,
      temperature: 0.7,
      top_k: 250,
      top_p: 0.999,
      stop_sequences: ["\n\nHuman:"]
    };
  } else if (modelId.startsWith('amazon.titan')) {
    // Titan models use this format
    requestBody = {
      inputText: prompt,
      textGenerationConfig: {
        maxTokenCount: 2000,
        temperature: 0.7,
        topP: 0.9
      }
    };
  } else {
    throw new Error(`Unsupported model: ${modelId}`);
  }

  const params = {
    body: JSON.stringify(requestBody),
    modelId: modelId,
    accept: 'application/json',
    contentType: 'application/json'
  };

  try {
    // If using AWS SDK v2 with custom endpoint
    if (!AWS.BedrockRuntime) {
      return new Promise((resolve, reject) => {
        const req = new AWS.HttpRequest(bedrockRuntime);
        req.method = 'POST';
        req.path = `/model/${modelId}/invoke`;
        req.headers['Content-Type'] = 'application/json';
        req.headers['Accept'] = 'application/json';
        req.body = JSON.stringify(requestBody);

        const signer = new AWS.Signers.V4(req, 'bedrock');
        signer.addAuthorization(AWS.config.credentials, new Date());

        const sender = new AWS.NodeHttpClient();
        sender.handleRequest(req, null, (response) => {
          let responseBody = '';
          response.on('data', (chunk) => {
            responseBody += chunk;
          });
          response.on('end', () => {
            try {
              const parsed = JSON.parse(responseBody);
              resolve(parsed);
            } catch (e) {
              reject(e);
            }
          });
        }, (err) => {
          reject(err);
        });
      });
    }

    // If using AWS SDK v3 or newer versions with native Bedrock support
    return bedrockRuntime.invokeModel(params).promise();
  } catch (error) {
    console.error('Error invoking Bedrock model:', error);
    throw error;
  }
};

/**
 * Process text with Bedrock for content generation
 * @param {String} text - The text to process
 * @param {String} instruction - The instruction for processing
 * @returns {Promise<String>} - Generated content
 */
const generateContent = async (text, instruction) => {
  try {
    // Combine text and instruction into a prompt
    const prompt = `${instruction}\n\nText to process:\n${text}`;
    
    // Invoke the model
    const response = await invokeModel(prompt);
    
    // Extract and return the generated content based on model type
    if (MODEL_ID.startsWith('anthropic.claude')) {
      return response.completion || response.content[0].text;
    } else if (MODEL_ID.startsWith('amazon.titan')) {
      return response.results[0].outputText;
    } else {
      throw new Error(`Unsupported model: ${MODEL_ID}`);
    }
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};

/**
 * Summarize text using Bedrock
 * @param {String} text - The text to summarize
 * @param {Number} [maxLength=500] - Maximum length of summary
 * @returns {Promise<String>} - Generated summary
 */
const summarizeText = async (text, maxLength = 500) => {
  const instruction = `Please summarize the following text in a concise manner. The summary should be no longer than ${maxLength} words and should capture the main points and key information.`;
  return generateContent(text, instruction);
};

/**
 * Generate questions from text using Bedrock
 * @param {String} text - The text to generate questions from
 * @param {Number} [numQuestions=5] - Number of questions to generate
 * @returns {Promise<Array<String>>} - Generated questions
 */
const generateQuestions = async (text, numQuestions = 5) => {
  const instruction = `Please generate ${numQuestions} thought-provoking questions based on the following text. The questions should test understanding and critical thinking about the content.`;
  
  const response = await generateContent(text, instruction);
  
  // Parse the response to extract questions
  // This is a simple approach - you might need more sophisticated parsing depending on the model output
  const questions = response
    .split('\n')
    .filter(line => line.trim().endsWith('?'))
    .map(line => line.trim());
  
  return questions.slice(0, numQuestions);
};

module.exports = {
  invokeModel,
  generateContent,
  summarizeText,
  generateQuestions,
  MODEL_ID
};
