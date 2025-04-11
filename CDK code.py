import boto3
import json

bedrock_runtime = boto3.clinet('bedrock_runtime' , region_name='us-east-1')

prompt="Describe the purpose of a hello world program in one line."

kwagrgs= {
    "modelId": "anthropic.claude-3-7-sonnet-20250219-v1:0",
    "contentType": "application/json",
    "accept": "application/json",
    "body": json.dumps ({
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 200,
    "top_k": 250,
    "stop_sequences": [],
    "temperature": 1,
    "top_p": 0.999,
    "messages": [
        {
        "role": "user",
        "content": [
        {
            "type": "text",
            "text": "hello world"
        }
        ]
        }
        ]
        } )
}


response =bedrock_runtime.invoke_model(**kwagrgs)
body = json. loads (response ['body']. read ( ))

print(body)