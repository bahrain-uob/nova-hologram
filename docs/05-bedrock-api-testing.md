## Amazon Bedrock Model API Endpoints

This section documents the endpoints and request/response formats used for testing Amazon Bedrock models: Titan, Nova Lite, Nova Pro, and Nova Reel.

------------------------------------------------------------------------------------------

#### Titan Text G1 - Premier Model (amazon.titan-text-premier-v1:0)

<details>
<summary>▶️ <code>POST</code> <code><b>/model/amazon.titan-text-premier-v1:0/invoke</b></code> <code>(Generates text completions)</code></summary>

##### Headers

> | name          | value                      |
> |---------------|-----------------------------|
> | Content-Type  | application/json            |
> | Accept        | application/json            |

##### Parameters

> | name              | type      | data type  | description                              |
> |-------------------|-----------|------------|------------------------------------------|
> | inputText         | required  | string     | the input prompt for text generation     |
> | textGenerationConfig | required | object    | settings like maxTokenCount, temperature |

##### Sample request body format:
```json
{
  "inputText": "Write a short story about a dragon living on a mountain.",
  "textGenerationConfig": {
    "maxTokenCount": 512,
    "stopSequences": [],
    "temperature": 0.2,
    "topP": 0.9
  }
}
```

##### Responses

> | http code | content-type            | response                                                                      |
> |-----------|--------------------------|-------------------------------------------------------------------------------|
> | `200`     | `application/json`        | `{ "inputTextTokenCount": 12, "results": [{ "outputText": "...", "tokenCount": 482 }] }` |

</details>

------------------------------------------------------------------------------------------

#### Nova Lite Model (amazon.nova-lite-v1:0)

<details>
<summary>▶️ <code>POST</code> <code><b>/model/amazon.nova-lite-v1:0/invoke</b></code> <code>(Chat-style assistant model)</code></summary>

##### Headers

> | name          | value                      |
> |---------------|-----------------------------|
> | Content-Type  | application/json            |
> | Accept        | application/json            |

##### Parameters

> | name            | type      | data type    | description                         |
> |-----------------|-----------|--------------|-------------------------------------|
> | inferenceConfig | required  | object       | generation parameters like tokens   |
> | messages        | required  | array        | conversation history with the model |

##### Sample request body format:
```json
{
  "inferenceConfig": {
    "max_new_tokens": 1000,
    "temperature": 0.2,
    "top_p": 0.9
  },
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "text": "Tell me about the history of the Great Wall of China."
        }
      ]
    }
  ]
}
```

##### Responses

> | http code | content-type            | response                                                                       |
> |-----------|--------------------------|--------------------------------------------------------------------------------|
> | `200`     | `application/json`        | `{ "output": { "message": { "content": [{ "text": "..." }] } }, "stopReason": "end_turn" }` |

</details>

------------------------------------------------------------------------------------------

#### Nova Pro Model (amazon.nova-pro-v1:0)

<details>
<summary>▶️ <code>POST</code> <code><b>/model/amazon.nova-pro-v1:0/invoke</b></code> <code>(More advanced assistant model)</code></summary>

##### Headers

> | name          | value                      |
> |---------------|-----------------------------|
> | Content-Type  | application/json            |
> | Accept        | application/json            |

##### Parameters

> | name            | type      | data type    | description                         |
> |-----------------|-----------|--------------|-------------------------------------|
> | inferenceConfig | required  | object       | generation parameters like tokens   |
> | messages        | required  | array        | conversation history with the model |

##### Sample request body format:
```json
{
  "inferenceConfig": {
    "max_new_tokens": 1000,
    "temperature": 0.2,
    "top_p": 0.9
  },
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "text": "Explain how a rainbow is formed in simple words."
        }
      ]
    }
  ]
}
```

##### Responses

> | http code | content-type            | response                                                                       |
> |-----------|--------------------------|--------------------------------------------------------------------------------|
> | `200`     | `application/json`        | `{ "output": { "message": { "content": [{ "text": "..." }] } }, "stopReason": "end_turn" }` |

</details>

------------------------------------------------------------------------------------------

#### Nova Reel (amazon.nova-reel-v1:0) (via Lambda Function)

<details>
<summary>▶️ <code>POST</code> <code><b>/lambda/nova-reel-invoke</b></code> <code>(Triggers video generation via Lambda)</code></summary>
  
#### Lambda Function URL: https://bepjzc7om4x34xjul4ckzt27dm0ptpho.lambda-url.us-east-1.on.aws/

##### Headers

> | name          | value                      |
> |---------------|-----------------------------|
> | Content-Type  | application/json            |

##### Parameters

> | name     | type      | data type | description                         |
> |----------|-----------|-----------|-------------------------------------|
> | prompt   | required  | string    | text prompt to generate video       |

##### Sample request body format:
```json
{
  "prompt": "A young girl enters a magical floating library surrounded by glowing books and enchanted staircases."
}
```

##### Responses

> | http code | content-type            | response                                                                          |
> |-----------|--------------------------|-----------------------------------------------------------------------------------|
> | `200`     | `application/json`        | `{ "videoUri": "s3://...", "status": "Success" }`                                 |

##### Expected Behavior

- Lambda triggers the Nova Reel model asynchronously.
- Generated video is saved to an S3 bucket (`storagestack-genvideosb3836295-cgsm7lv3g2uy/upload/`).
- Success response returned after 1–3 minutes.

</details>

------------------------------------------------------------------------------------------

#### Nova Reel Model (amazon.nova-reel-v1:0) (via Python Script)

<details>
<summary>▶️ <code>POST</code> <code><b>/start_async_invoke</b></code> <code>(Starts async video generation via boto3)</code></summary>

##### Parameters

> | name                  | type      | data type   | description                                    |
> |------------------------|-----------|-------------|------------------------------------------------|
> | taskType               | required  | string      | must be "TEXT_VIDEO"                           |
> | textToVideoParams.text | required  | string      | input text prompt for video generation         |
> | videoGenerationConfig  | required  | object      | fps, duration, dimension, seed configuration   |

##### Sample request body format:
```json
{
  "taskType": "TEXT_VIDEO",
  "textToVideoParams": {
    "text": "Your input prompt here"
  },
  "videoGenerationConfig": {
    "fps": 24,
    "durationSeconds": 6,
    "dimension": "1280x720",
    "seed": 12345
  }
}
```

#### Responses

> | http code | content-type            | response                                                                                           |
> |-----------|--------------------------|---------------------------------------------------------------------------------------------------|
> | `202`     | `application/json`        | `Job started successfully.<br>Invocation ARN: arn:aws:bedrock:...`                                |
> | `200`     | `application/json`        | `Video generated successfully!<br>Video S3 location: s3://storagestack-genvideosb3836295-.../output.mp4` |
> | `400`     | `application/json`        | `Video generation failed: <failureMessage>` (e.g., invalid input, bad request)                    |
> | `500`     | `application/json`        | `Video generation failed: Unknown error` (unexpected server-side error)                           |

##### Expected Behavior

- Python script uses `boto3` to call `start_async_invoke`.
- Retrieves S3 video location when generation is finished.
- Success response returned after 1–3 minutes.

##### Notes

- Ensure AWS credentials are correctly configured (use environment variables for credentials).
- Refer to [Amazon Nova Reel 1.1 Announcement](https://aws.amazon.com/blogs/aws/amazon-nova-reel-1-1-featuring-up-to-2-minutes-multi-shot-videos/) for more details of the python script.

</details>

------------------------------------------------------------------------------------------
