import boto3
import json

prompt= "what is the capital of bahrain" # write the promte you will send it to the API

bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')

body = {
    "inputText": prompt,
    "textGenerationConfig": {
        "maxTokenCount": 3072,
        "stopSequences": [],
        "temperature": 0.7,
        "topP": 0.9
    }
}

response = bedrock_runtime.invoke_model(
    modelId="amazon.titan-text-premier-v1:0",
    contentType="application/json",
    accept="application/json",
    body=json.dumps(body)
)

response_body = json.loads(response['body'].read())

print(response_body["results"][0]["outputText"])