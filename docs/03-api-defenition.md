# Nova Hologram API Definition

This document outlines the REST API endpoints available in the Nova Hologram platform. The API is organized around resources and uses standard HTTP methods.

## Base URL

All API endpoints are relative to the base URL:

```
https://api-gateway-endpoint.execute-api.us-east-1.amazonaws.com/prod
```

## Authentication

All API requests require authentication using a JWT token obtained from AWS Cognito. Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

## API Endpoints

------------------------------------------------------------------------------------------

### Reading Materials API

#### Upload a reading material

<details>
 <summary> ▶️ <code>POST</code> <code><b>/files</b></code> <code>(Uploads a new reading material)</code></summary>

##### Parameters

> | name            |  type     | data type     | description                                                           |
> |-----------      |-----------|-------------- |-----------------------------------------------------------------------|
> | file            |  required | File          | The reading material file to upload                                   |
> | metadata        | required  | Object        | Metadata about the reading material                                   |

##### Sample request body format (multipart/form-data):
```
file: [binary data]
metadata: {
    "title": "Introduction to AI",
    "authors": ["John Smith", "Jane Doe"],
    "publishedDate": "2023-01-15",
    "description": "A comprehensive introduction to artificial intelligence",
    "publisher": "Tech Publishing",
    "maturityRating": "General"
}
```

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `201`         | `application/json`                | `{"id": "file123", "status": "success", "message": "File uploaded successfully"}` |
> | `400`         | `application/json`                | `{"status": "error", "message": "Bad Request"}`                      |
> | `401`         | `application/json`                | `{"status": "error", "message": "Unauthorized"}`                     |

</details>

------------------------------------------------------------------------------------------

#### Get all reading materials

<details>
 <summary> ▶️ <code>GET</code> <code><b>/files</b></code> <code>(Retrieves all reading materials)</code></summary>

##### Parameters

> None

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `{"files": [{"id": "file123", "title": "Introduction to AI", "authors": ["John Smith"], "uploadDate": "2023-01-15"}]}` |
> | `401`         | `application/json`                | `{"status": "error", "message": "Unauthorized"}`                     |

</details>

------------------------------------------------------------------------------------------

#### Delete a reading material

<details>
 <summary> ▶️ <code>DELETE</code> <code><b>/files/{fileId}</b></code> <code>(Deletes a reading material)</code></summary>

##### Path Parameters

> | name            |  type     | description                                                           |
> |-----------      |-----------|-----------------------------------------------------------------------|
> | fileId          |  required | The ID of the file to delete                                         |

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `{"status": "success", "message": "File deleted successfully"}`      |
> | `404`         | `application/json`                | `{"status": "error", "message": "File not found"}`                   |
> | `401`         | `application/json`                | `{"status": "error", "message": "Unauthorized"}`                     |

</details>

------------------------------------------------------------------------------------------

### Generated Content API

#### Get all generated content

<details>
 <summary> ▶️ <code>GET</code> <code><b>/content</b></code> <code>(Retrieves all generated content)</code></summary>

##### Parameters

> None

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `{"content": [{"id": "content123", "title": "AI Hologram", "sourceFileId": "file123", "generationDate": "2023-01-16"}]}` |
> | `401`         | `application/json`                | `{"status": "error", "message": "Unauthorized"}`                     |

</details>

------------------------------------------------------------------------------------------

#### Get generated content by ID

<details>
 <summary> ▶️ <code>GET</code> <code><b>/content/{contentId}</b></code> <code>(Retrieves a specific generated content)</code></summary>

##### Path Parameters

> | name            |  type     | description                                                           |
> |-----------      |-----------|-----------------------------------------------------------------------|
> | contentId       |  required | The ID of the content to retrieve                                     |

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `{"id": "content123", "title": "AI Hologram", "sourceFileId": "file123", "generationDate": "2023-01-16", "fileKey": "content/video123.mp4"}` |
> | `404`         | `application/json`                | `{"status": "error", "message": "Content not found"}`                |
> | `401`         | `application/json`                | `{"status": "error", "message": "Unauthorized"}`                     |

</details>

------------------------------------------------------------------------------------------

### Book Information API

#### Get book information by ISBN or DOI

<details>
 <summary> ▶️ <code>POST</code> <code><b>/book-info</b></code> <code>(Retrieves book information from external APIs)</code></summary>

##### Parameters

> | name            |  type     | data type     | description                                                           |
> |-----------      |-----------|-------------- |-----------------------------------------------------------------------|
> | input           |  required | string        | ISBN or DOI of the book                                              |

##### Sample request body format:
```json
{
    "input": "9781234567890"
}
```

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `{"title": "Book Title", "authors": ["Author Name"], "publish_date": "2023-01-01", "description": "Book description", "publisher": "Publisher Name", "maturity_rating": "NOT_MATURE", "cover_image": "https://url-to-cover-image", "page_count": 300}` |
> | `400`         | `application/json`                | `{"error": "Invalid JSON body"}`                                     |
> | `500`         | `application/json`                | `{"error": "Failed to process response", "detail": "Error message"}`  |

</details>

------------------------------------------------------------------------------------------

### Pre-signed URL API

#### Generate a pre-signed URL

<details>
 <summary> ▶️ <code>POST</code> <code><b>/presigned-url</b></code> <code>(Generates a pre-signed URL for S3 operations)</code></summary>

##### Parameters

> | name            |  type     | data type     | description                                                           |
> |-----------      |-----------|-------------- |-----------------------------------------------------------------------|
> | key             |  required | string        | The S3 object key                                                     |
> | bucket          |  required | string        | The S3 bucket name                                                    |
> | operation       |  required | string        | The S3 operation (getObject or putObject)                             |
> | contentType     |  optional | string        | The content type (required for putObject)                             |

##### Sample request body format:
```json
{
    "key": "materials/book.pdf",
    "bucket": "reading-materials-bucket",
    "operation": "getObject"
}
```

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `{"url": "https://presigned-s3-url..."}`                             |
> | `400`         | `application/json`                | `{"error": "Missing required parameters"}`                            |
> | `401`         | `application/json`                | `{"error": "Unauthorized"}`                                           |

</details>

------------------------------------------------------------------------------------------

### Text Extraction API

#### Extract text from document

<details>
 <summary> ▶️ <code>POST</code> <code><b>/extract-text</b></code> <code>(Extracts text from a document using Textract)</code></summary>

##### Parameters

> | name            |  type     | data type     | description                                                           |
> |-----------      |-----------|-------------- |-----------------------------------------------------------------------|
> | documentKey     |  required | string        | The S3 key of the document                                            |

##### Sample request body format:
```json
{
    "documentKey": "materials/document.pdf"
}
```

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `{"status": "Success", "extractedText": "The extracted text content from the document"}` |
> | `400`         | `application/json`                | `{"status": "Failed", "message": "Missing document key"}`            |
> | `500`         | `application/json`                | `{"status": "Failed", "message": "Textract job failed"}`             |

</details>

------------------------------------------------------------------------------------------

### Video Generation API

#### Generate holographic video

<details>
 <summary> ▶️ <code>POST</code> <code><b>/generate-video</b></code> <code>(Generates a holographic video from text)</code></summary>

##### Parameters

> | name            |  type     | data type     | description                                                           |
> |-----------      |-----------|-------------- |-----------------------------------------------------------------------|
> | prompt          |  required | string        | The text content to generate a video from                             |

##### Sample request body format:
```json
{
    "prompt": "The text content to generate a video from"
}
```

##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json`                | `{"status": "Success", "videoUri": "s3://bucket-name/path/to/video/output.mp4"}` |
> | `400`         | `application/json`                | `{"status": "Failed", "message": "Missing prompt"}`                  |
> | `500`         | `application/json`                | `{"status": "Failed", "message": "Video generation failed"}`         |

</details>

------------------------------------------------------------------------------------------