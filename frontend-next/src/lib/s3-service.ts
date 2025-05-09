import { awsConfig } from '../config/aws-config';

/**
 * S3 Service
 * Utility functions for interacting with AWS S3 buckets
 */

// Get the configured bucket names from environment variables
const READING_MATERIALS_BUCKET = awsConfig.s3.readingMaterialsBucket;
const GENERATED_CONTENT_BUCKET = awsConfig.s3.generatedContentBucket;

// Generate a pre-signed URL for file download
export const getDownloadUrl = async (key: string, bucket: string = READING_MATERIALS_BUCKET, token: string): Promise<string> => {
  try {
    // In a real implementation, this would call your API Gateway endpoint that generates pre-signed URLs
    const response = await fetch(`${awsConfig.apiGateway.endpoint}/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        key,
        bucket,
        operation: 'getObject'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate download URL');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw error;
  }
};

// Generate a pre-signed URL for file upload
export const getUploadUrl = async (key: string, contentType: string, bucket: string = READING_MATERIALS_BUCKET, token: string): Promise<string> => {
  try {
    // In a real implementation, this would call your API Gateway endpoint that generates pre-signed URLs
    const response = await fetch(`${awsConfig.apiGateway.endpoint}/presigned-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        key,
        bucket,
        contentType,
        operation: 'putObject'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate upload URL');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw error;
  }
};

// Upload a file directly to S3 using a pre-signed URL
export const uploadFile = async (file: File, key: string, token: string): Promise<string> => {
  try {
    // Get a pre-signed URL for uploading
    const uploadUrl = await getUploadUrl(key, file.type, READING_MATERIALS_BUCKET, token);
    
    // Upload the file to S3 using the pre-signed URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type
      },
      body: file
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3');
    }

    // Return the key of the uploaded file
    return key;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get a file from S3 using a pre-signed URL
export const getFile = async (key: string, token: string, bucket: string = READING_MATERIALS_BUCKET): Promise<Blob> => {
  try {
    // Get a pre-signed URL for downloading
    const downloadUrl = await getDownloadUrl(key, bucket, token);
    
    // Download the file from S3 using the pre-signed URL
    const downloadResponse = await fetch(downloadUrl);

    if (!downloadResponse.ok) {
      throw new Error('Failed to download file from S3');
    }

    // Return the file as a blob
    return await downloadResponse.blob();
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

export default {
  getDownloadUrl,
  getUploadUrl,
  uploadFile,
  getFile,
};
