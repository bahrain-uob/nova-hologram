'use strict';

const AWS = require('aws-sdk');
const https = require('https');
const url = require('url');

const s3 = new AWS.S3();

exports.handler = async (event) => {
  console.log('Play response triggered with:', JSON.stringify(event));
  
  // Check for S3 event records
  if (!event.Records || event.Records.length === 0) {
    console.error("No records found in event");
    return { statusCode: 400, body: "No records found in event" };
  }
  
  // Assume only one record is in the event
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
  
  // Generate a presigned URL for the audio file (expires in 5 minutes)
  let fileUrl;
  try {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: 300 // seconds
    };
    fileUrl = s3.getSignedUrl('getObject', params);
    console.log('Generated signed URL:', fileUrl);
  } catch (err) {
    console.error('Error generating signed URL:', err);
    return { statusCode: 500, body: "Error generating file URL" };
  }
  
  // Read the API Gateway endpoint from an environment variable
  const playbackApiUrl = process.env.PLAYBACK_API_URL;
  if (!playbackApiUrl) {
    console.error("PLAYBACK_API_URL is not set in the environment");
    return { statusCode: 500, body: "Playback API URL not configured" };
  }
  
  // Prepare payload to send to the API Gateway
  const payload = JSON.stringify({
    bucket,
    key,
    fileUrl
  });
  
  // Parse the URL to build HTTPS request options
  const parsedUrl = url.parse(playbackApiUrl);
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port ? parsedUrl.port : 443,
    path: parsedUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };
  
  // Wrap the HTTPS request in a promise
  const sendRequest = () => {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = "";
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: responseData
          });
        });
      });
      
      req.on('error', (e) => {
        reject(e);
      });
      
      req.write(payload);
      req.end();
    });
  };
  
  try {
    const apiResponse = await sendRequest();
    console.log('API Gateway response:', apiResponse);
  } catch (err) {
    console.error('Error calling API Gateway:', err);
  }
  
  // Return a final response (the reader client can fetch the audio using the provided signed URL)
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Playback triggered',
      bucket: bucket,
      key: key,
      fileUrl: fileUrl
    }),
  };
};
