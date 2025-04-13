import json
import boto3

# Initialize Bedrock client
bedrock_client = boto3.client(
    service_name="bedrock-runtime",
    region_name="us-east-1"
)

# Claude 3.5 Sonnet model ID
modelID = "anthropic.claude-3-5-sonnet-20240620-v1:0"

def handler(event, context):
    freeform_text = event.get("freeform_text", "")

    if not freeform_text:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing 'freeform_text' in request."})
        }

    prompt = f"""
You are an AI that transforms story content into immersive holographic scene descriptions for an educational reading platform.

Generate a rich, multi-sensory scene description from this input text. Include:
- Visual setting (location, time, atmosphere)
- Main characters or objects (description, motion)
- Sounds or ambient noise
- Suggested narration with emphasis for pronunciation practice

Text:
\"{freeform_text}\"
"""

    try:
        response = bedrock_client.invoke_model(
            modelId=modelID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",  # ✅ Required field
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "max_tokens": 2000,
                "temperature": 0.9
            })
        )

        # Parse response
        response_body = response['body'].read().decode('utf-8')
        response_data = json.loads(response_body)

        generated_output = response_data['content'][0]['text'] if 'content' in response_data else "No content returned."

        return {
            "statusCode": 200,
            "body": json.dumps({
                "generated_scene": generated_output
            })
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
