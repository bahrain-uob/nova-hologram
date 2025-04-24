/**
 * Amazon Textract Utilities for Lambda Functions
 */
const AWS = require('aws-sdk');
const config = require('../config');

// Initialize Textract client
const textract = new AWS.Textract({ region: config.aws.region });

/**
 * Extract text from a document stored in S3
 * @param {String} bucket - The S3 bucket name
 * @param {String} key - The S3 object key
 * @returns {Promise<Object>} - Textract detect document text result
 */
const extractTextFromS3Document = async (bucket, key) => {
  const params = {
    Document: {
      S3Object: {
        Bucket: bucket,
        Name: key
      }
    }
  };

  return textract.detectDocumentText(params).promise();
};

/**
 * Extract text from a document buffer
 * @param {Buffer} documentBytes - The document bytes
 * @returns {Promise<Object>} - Textract detect document text result
 */
const extractTextFromBuffer = async (documentBytes) => {
  const params = {
    Document: {
      Bytes: documentBytes
    }
  };

  return textract.detectDocumentText(params).promise();
};

/**
 * Process Textract response to extract plain text
 * @param {Object} textractResponse - The response from Textract
 * @returns {String} - Extracted text as a string
 */
const processTextractResponse = (textractResponse) => {
  let extractedText = '';
  
  if (textractResponse && textractResponse.Blocks) {
    // Filter for LINE type blocks and extract their text
    const lineBlocks = textractResponse.Blocks.filter(block => block.BlockType === 'LINE');
    
    // Join the text from each line with newlines
    extractedText = lineBlocks.map(block => block.Text).join('\n');
  }
  
  return extractedText;
};

/**
 * Extract forms (key-value pairs) from a document stored in S3
 * @param {String} bucket - The S3 bucket name
 * @param {String} key - The S3 object key
 * @returns {Promise<Object>} - Textract analyze document result
 */
const extractFormsFromS3Document = async (bucket, key) => {
  const params = {
    Document: {
      S3Object: {
        Bucket: bucket,
        Name: key
      }
    },
    FeatureTypes: ['FORMS']
  };

  return textract.analyzeDocument(params).promise();
};

/**
 * Process Textract form response to extract key-value pairs
 * @param {Object} textractResponse - The response from Textract
 * @returns {Object} - Extracted key-value pairs
 */
const processFormResponse = (textractResponse) => {
  const keyValuePairs = {};
  
  if (textractResponse && textractResponse.Blocks) {
    // Find all key-value sets
    const keyValueSets = textractResponse.Blocks.filter(block => 
      block.BlockType === 'KEY_VALUE_SET' && 
      block.EntityTypes && 
      block.EntityTypes.includes('KEY')
    );
    
    // Process each key-value set
    keyValueSets.forEach(keyBlock => {
      // Find the key text
      const keyId = keyBlock.Id;
      const keyText = findBlockText(keyBlock, textractResponse.Blocks);
      
      // Find the value block associated with this key
      const valueBlock = findValueBlock(keyBlock, textractResponse.Blocks);
      if (valueBlock) {
        // Find the value text
        const valueText = findBlockText(valueBlock, textractResponse.Blocks);
        
        // Add to our result object
        if (keyText && valueText) {
          keyValuePairs[keyText.trim()] = valueText.trim();
        }
      }
    });
  }
  
  return keyValuePairs;
};

/**
 * Helper function to find the text associated with a block
 * @param {Object} block - The block to find text for
 * @param {Array} allBlocks - All blocks from the Textract response
 * @returns {String} - The text associated with the block
 */
const findBlockText = (block, allBlocks) => {
  let text = '';
  
  if (block.Relationships) {
    // Find CHILD relationships
    const childRelationships = block.Relationships.filter(rel => rel.Type === 'CHILD');
    
    childRelationships.forEach(relationship => {
      relationship.Ids.forEach(childId => {
        // Find the child block
        const childBlock = allBlocks.find(b => b.Id === childId);
        
        if (childBlock && childBlock.BlockType === 'WORD') {
          text += childBlock.Text + ' ';
        }
      });
    });
  }
  
  return text.trim();
};

/**
 * Helper function to find the value block associated with a key block
 * @param {Object} keyBlock - The key block
 * @param {Array} allBlocks - All blocks from the Textract response
 * @returns {Object} - The value block
 */
const findValueBlock = (keyBlock, allBlocks) => {
  if (keyBlock.Relationships) {
    // Find VALUE relationships
    const valueRelationships = keyBlock.Relationships.filter(rel => rel.Type === 'VALUE');
    
    if (valueRelationships.length > 0 && valueRelationships[0].Ids.length > 0) {
      const valueId = valueRelationships[0].Ids[0];
      return allBlocks.find(b => b.Id === valueId);
    }
  }
  
  return null;
};

module.exports = {
  extractTextFromS3Document,
  extractTextFromBuffer,
  processTextractResponse,
  extractFormsFromS3Document,
  processFormResponse
};
