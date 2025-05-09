# Lambda Functions

The Nova Hologram platform uses AWS Lambda functions for backend processing. This document explains the various Lambda functions and how to use them.

## Lambda Function Structure

Lambda functions are organized in the `lambda` directory with the following structure:

- **Bedrock/**: AI content generation using Amazon Bedrock
- **GetBookInfo/**: Book metadata retrieval
- **GetFiles/**: File retrieval from S3
- **SaveExtractedText/**: Save extracted text to database
- **Student/**: Student-specific functions
- **TextExtraction/**: Text extraction from documents
- **deleteFiles/**: File deletion from S3
- **postUpload/**: Post-upload processing
- **utils/**: Shared utility functions

## Bedrock - AI Content Generation

The Bedrock Lambda function generates holographic videos from text using Amazon Bedrock's Nova Reel model.

**Location**: `lambda/Bedrock/index.py`

**Functionality**:
- Takes text input and transforms it into a video generation prompt
- Starts an asynchronous text-to-video generation job
- Polls for job completion and returns the S3 URI of the generated video

**Usage**:
```json
{
  "prompt": "The text content to generate a video from"
}
```

**Response**:
```json
{
  "status": "Success",
  "videoUri": "s3://bucket-name/path/to/video/output.mp4"
}
```

## GetBookInfo - Book Metadata Retrieval

This Lambda function retrieves book metadata from external APIs using ISBN or DOI.

**Location**: `lambda/GetBookInfo/index.js`

**Functionality**:
- Accepts ISBN or DOI input
- Queries Google Books API for ISBN or Crossref API for DOI
- Returns structured book metadata

**Usage**:
```json
{
  "input": "9781234567890" // ISBN or "10.1000/xyz123" for DOI
}
```

**Response**:
```json
{
  "title": "Book Title",
  "authors": ["Author Name"],
  "publish_date": "2023-01-01",
  "description": "Book description",
  "publisher": "Publisher Name",
  "maturity_rating": "NOT_MATURE",
  "cover_image": "https://url-to-cover-image",
  "page_count": 300
}
```

## TextExtraction - Document Text Extraction

This Lambda function extracts text from documents using Amazon Textract.

**Location**: `lambda/TextExtraction/textex.py`

**Functionality**:
- Starts an asynchronous Textract job on a document in S3
- Polls for job completion
- Returns the extracted text

**Usage**:
```json
{
  "img2.png": "path/to/document/in/s3"
}
```

**Response**:
```json
{
  "status": "Success",
  "extractedText": "The extracted text content from the document"
}
```

## Deploying Lambda Functions

To deploy a Lambda function:

1. Ensure you have the AWS CLI configured with appropriate credentials
2. Navigate to the Lambda function directory
3. Install dependencies (if any)
4. Create a deployment package
5. Deploy using AWS CLI or AWS Management Console

**Example deployment using AWS CLI**:
```bash
# Navigate to the Lambda function directory
cd lambda/GetBookInfo

# Install dependencies
npm install

# Create a deployment package
zip -r function.zip .

# Deploy the function
aws lambda update-function-code --function-name GetBookInfo --zip-file fileb://function.zip
```

## Testing Lambda Functions Locally

You can test Lambda functions locally using the AWS SAM CLI:

1. Install AWS SAM CLI
2. Create a test event JSON file
3. Run the function locally

**Example**:
```bash
# Create a test event
echo '{"input": "9781234567890"}' > test-event.json

# Test the function locally
sam local invoke GetBookInfo --event test-event.json
```

## Error Handling

Lambda functions implement error handling to provide meaningful error messages:

- HTTP status codes in the 400 range indicate client errors
- HTTP status codes in the 500 range indicate server errors
- Error responses include a message field with details about the error

**Example error response**:
```json
{
  "error": "Invalid JSON body",
  "detail": "Missing required field: input"
}
```
