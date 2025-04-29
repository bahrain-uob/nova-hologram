# AI Features

This document explains the AI features of the Nova Hologram platform and how to use them effectively.

## Overview

The Nova Hologram platform leverages advanced AI technologies to transform traditional reading materials into immersive holographic experiences. The primary AI services used are:

1. **Amazon Bedrock**: For generating holographic videos from text
2. **Amazon Textract**: For extracting text from uploaded documents

## Text Extraction with Amazon Textract

### How It Works

The text extraction process follows these steps:

1. A document is uploaded to the S3 reading materials bucket
2. The TextExtraction Lambda function is triggered
3. The function starts an asynchronous Textract job on the document
4. Textract analyzes the document and extracts text
5. The extracted text is saved to the database and associated with the reading material

### Implementation Details

The text extraction is implemented in the `TextExtraction` Lambda function:

```python
def start_text_extraction_job(textract_client, bucket, document_key):
    """
    Starts a Textract asynchronous text extraction job.
    """
    response = textract_client.start_document_text_detection(
        DocumentLocation={'S3Object': {'Bucket': bucket, 'Name': document_key}}
    )
    return response['JobId']

def check_job_status(textract_client, job_id):
    """
    Checks the status of the Textract job.
    """
    return textract_client.get_document_text_detection(JobId=job_id)
```

### Usage in the Application

Text extraction is used in the following scenarios:

1. **Document Upload**: When a librarian uploads a new reading material
2. **Content Generation**: To provide text input for holographic video generation
3. **Search Functionality**: To enable full-text search of reading materials

## Holographic Video Generation with Amazon Bedrock

### How It Works

The holographic video generation process follows these steps:

1. Text content is selected for transformation (either manually or from extracted text)
2. A prompt is created based on the text content
3. The Bedrock Lambda function is triggered with the prompt
4. The function starts an asynchronous video generation job using Amazon Nova Reel
5. The generated video is stored in the S3 generated content bucket
6. The video URL and metadata are saved to the database

### Implementation Details

The video generation is implemented in the `Bedrock` Lambda function:

```python
def start_text_to_video_generation_job(bedrock_runtime, prompt, output_s3_uri):
    """
    Starts an asynchronous text-to-video generation job using Amazon Nova Reel.
    """
    model_id = "amazon.nova-reel-v1:1"
    seed = random.randint(0, 2147483646)

    model_input = {
        "taskType": "MULTI_SHOT_AUTOMATED",
        "multiShotAutomatedParams": {
            "text": prompt
        },
        "videoGenerationConfig": {
            "fps": 24,
            "durationSeconds": 60,
            "dimension": "1280x720",
            "seed": seed,
        },
    }

    output_config = {"s3OutputDataConfig": {"s3Uri": output_s3_uri}}

    response = bedrock_runtime.start_async_invoke(
        modelId=model_id, modelInput=model_input, outputDataConfig=output_config
    )

    return response["invocationArn"]
```

### Prompt Engineering

The quality of generated holographic videos depends significantly on the prompts used. The system uses a base prompt template:

```
You are an AI that transforms story content into immersive holographic scene descriptions for an educational reading platform.

Generate a rich, multi-sensory scene description from this input text. Include:
- Visual setting (location, time, atmosphere)
- Main characters or objects (description, motion)
- Sounds or ambient noise
- Suggested narration with emphasis for pronunciation practice
```

This template is combined with the input text to create the final prompt for video generation.

### Usage in the Application

Holographic video generation is used in the following scenarios:

1. **Content Enhancement**: To create visual representations of text content
2. **Learning Aids**: To provide immersive learning experiences
3. **Accessibility**: To make content accessible to different learning styles

## Book Information Retrieval

### How It Works

The book information retrieval process follows these steps:

1. A user provides an ISBN or DOI for a book
2. The GetBookInfo Lambda function is triggered
3. For ISBN: The function queries the Google Books API
4. For DOI: The function queries the Crossref API
5. The retrieved metadata is returned to the user

### Implementation Details

The book information retrieval is implemented in the `GetBookInfo` Lambda function:

```javascript
const isDOI = input.startsWith("10.");
const url = isDOI
  ? `https://api.crossref.org/works/${encodeURIComponent(input)}`
  : `https://www.googleapis.com/books/v1/volumes?q=isbn:${input}`;
```

### Usage in the Application

Book information retrieval is used in the following scenarios:

1. **Book Addition**: When a librarian adds a new book to the system
2. **Metadata Enhancement**: To enrich existing book records
3. **Search Functionality**: To provide accurate search results

## Integration in the Frontend

### AI Feature Components

The frontend includes several components for interacting with AI features:

1. **TextExtractor**: For initiating and monitoring text extraction
2. **VideoGenerator**: For generating holographic videos
3. **BookInfoFetcher**: For retrieving book information

### Example: Video Generation Component

```tsx
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';

export function VideoGenerator({ textContent }) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const generateVideo = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.tokens.idToken}`
        },
        body: JSON.stringify({ prompt: textContent })
      });
      
      const data = await response.json();
      
      if (data.status === 'Success') {
        setVideoUrl(data.videoUri);
      } else {
        setError(data.message || 'Failed to generate video');
      }
    } catch (err) {
      setError('An error occurred during video generation');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="video-generator">
      <button 
        onClick={generateVideo} 
        disabled={isGenerating || !textContent}
        className="generate-button"
      >
        {isGenerating ? 'Generating...' : 'Generate Holographic Video'}
      </button>
      
      {error && <div className="error-message">{error}</div>}
      
      {videoUrl && (
        <div className="video-container">
          <h3>Generated Video</h3>
          <video controls src={videoUrl} className="video-player" />
        </div>
      )}
    </div>
  );
}
```

## Best Practices

### Optimizing Text Extraction

1. **Document Quality**: Ensure uploaded documents have clear, high-resolution text
2. **File Formats**: Prefer PDF, PNG, or JPEG formats for best results
3. **Document Size**: Keep documents under 10MB for faster processing
4. **Text Layout**: Simple layouts with standard fonts work best

### Optimizing Video Generation

1. **Prompt Length**: Keep prompts between 100-500 words for best results
2. **Descriptive Language**: Use vivid, descriptive language in prompts
3. **Specific Details**: Include specific visual details for better scene generation
4. **Balanced Content**: Include setting, characters, and action in balanced proportions

### Error Handling

1. **Retry Logic**: Implement retry logic for transient failures
2. **User Feedback**: Provide clear feedback to users during processing
3. **Fallback Options**: Have fallback options when AI services are unavailable
4. **Logging**: Maintain detailed logs for troubleshooting

## Future Enhancements

Planned enhancements to the AI features include:

1. **Personalized Content**: Tailoring generated content to user preferences
2. **Interactive Elements**: Adding interactive elements to holographic videos
3. **Multi-language Support**: Generating content in multiple languages
4. **Content Summarization**: Automatically summarizing reading materials
5. **Sentiment Analysis**: Analyzing the sentiment and tone of reading materials
