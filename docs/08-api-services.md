# API Services

The Nova Hologram platform uses several API services to interact with AWS resources and external services. This document explains how to use these API services in the application.

## API Service Structure

API services are implemented in the `src/lib` directory:

- **api-service.ts**: Core API functionality for interacting with backend services
- **s3-service.ts**: S3-specific API functionality for file operations
- **auth.ts**: Authentication API functionality
- **utils.ts**: Utility functions for API operations

## Core API Service

The core API service (`src/lib/api-service.ts`) provides functions for interacting with the application's backend services.

### Configuration

The API service uses the configuration from `src/config/aws-config.ts`:

```typescript
// Base API URL from config
const API_URL = awsConfig.apiUrl;
const API_GATEWAY_ENDPOINT = awsConfig.apiGateway.endpoint;
```

### Reading Materials API

The reading materials API provides functions for managing reading materials:

#### Get All Reading Materials

```typescript
readingMaterialsApi.getAll(token?: string): Promise<any>
```

Retrieves all reading materials. If a token is provided, it will be used for authentication.

#### Upload Reading Material

```typescript
readingMaterialsApi.upload(file: File, metadata: any, token: string): Promise<any>
```

Uploads a reading material file with metadata. Requires an authentication token.

#### Delete Reading Material

```typescript
readingMaterialsApi.delete(fileId: string, token: string): Promise<any>
```

Deletes a reading material by its ID. Requires an authentication token.

### Generated Content API

The generated content API provides functions for managing AI-generated content:

#### Get All Generated Content

```typescript
generatedContentApi.getAll(token?: string): Promise<any>
```

Retrieves all generated content. If a token is provided, it will be used for authentication.

#### Get Generated Content by ID

```typescript
generatedContentApi.getById(contentId: string, token?: string): Promise<any>
```

Retrieves a specific generated content by its ID. If a token is provided, it will be used for authentication.

## S3 Service

The S3 service (`src/lib/s3-service.ts`) provides functions for interacting with AWS S3 buckets:

### Configuration

The S3 service uses the bucket names from the configuration:

```typescript
const READING_MATERIALS_BUCKET = awsConfig.s3.readingMaterialsBucket;
const GENERATED_CONTENT_BUCKET = awsConfig.s3.generatedContentBucket;
```

### Get Download URL

```typescript
getDownloadUrl(key: string, bucket: string = READING_MATERIALS_BUCKET, token: string): Promise<string>
```

Generates a pre-signed URL for downloading a file from S3. Requires an authentication token.

### Get Upload URL

```typescript
getUploadUrl(key: string, contentType: string, bucket: string = READING_MATERIALS_BUCKET, token: string): Promise<string>
```

Generates a pre-signed URL for uploading a file to S3. Requires an authentication token.

### Upload File

```typescript
uploadFile(file: File, key: string, token: string): Promise<string>
```

Uploads a file directly to S3 using a pre-signed URL. Requires an authentication token.

### Get File

```typescript
getFile(key: string, token: string, bucket: string = READING_MATERIALS_BUCKET): Promise<Blob>
```

Retrieves a file from S3 as a Blob. Requires an authentication token.

## Usage Examples

### Uploading a Reading Material

```typescript
import { readingMaterialsApi } from '@/lib/api-service';
import { uploadFile } from '@/lib/s3-service';

async function uploadReadingMaterial(file: File, metadata: any, token: string) {
  try {
    // First, upload the file to S3
    const fileKey = await uploadFile(file, `materials/${file.name}`, token);
    
    // Then, save the metadata with the file key
    const result = await readingMaterialsApi.upload(file, {
      ...metadata,
      fileKey
    }, token);
    
    return result;
  } catch (error) {
    console.error('Error uploading reading material:', error);
    throw error;
  }
}
```

### Retrieving Generated Content

```typescript
import { generatedContentApi } from '@/lib/api-service';
import { getFile } from '@/lib/s3-service';

async function getGeneratedVideo(contentId: string, token: string) {
  try {
    // First, get the content metadata
    const contentMetadata = await generatedContentApi.getById(contentId, token);
    
    // Then, get the actual video file from S3
    const videoBlob = await getFile(
      contentMetadata.fileKey,
      token,
      awsConfig.s3.generatedContentBucket
    );
    
    // Create a URL for the video
    const videoUrl = URL.createObjectURL(videoBlob);
    
    return {
      metadata: contentMetadata,
      videoUrl
    };
  } catch (error) {
    console.error('Error getting generated video:', error);
    throw error;
  }
}
```

## Error Handling

All API functions include error handling to provide meaningful error messages:

```typescript
try {
  const result = await readingMaterialsApi.getAll(token);
  // Process result
} catch (error) {
  // Handle error
  console.error('API request failed:', error);
  // Show error message to user
}
```
