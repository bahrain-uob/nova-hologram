import boto3
import random
import time

# Replace with your own S3 bucket to store the generated video
# Format: s3://your-bucket-name
OUTPUT_S3_URI = "s3://mycdkstack-genvideosb3836295-xaimbyezl0dl/upload/"

def start_text_to_video_generation_job(bedrock_runtime, prompt, output_s3_uri):
    """
    Starts an asynchronous text-to-video generation job using Amazon Nova Reel.

    :param bedrock_runtime: The Bedrock runtime client
    :param prompt: The text description of the video to generate
    :param output_s3_uri: S3 URI where the generated video will be stored

    :return: The invocation ARN of the async job
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

def query_job_status(bedrock_runtime, invocation_arn):
    """
    Queries the status of an asynchronous video generation job.

    :param bedrock_runtime: The Bedrock runtime client
    :param invocation_arn: The ARN of the async invocation to check

    :return: The runtime response containing the job status and details
    """
    return bedrock_runtime.get_async_invoke(invocationArn=invocation_arn)

def lambda_handler(event, context):
    """
    Lambda entry point function.
    Starts the video generation job and polls for its status.
    """
    bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")

    # Base prompt template for educational holographic scenes
    base_prompt = """
You are an AI that transforms story content into immersive holographic scene descriptions for an educational reading platform.

Generate a rich, multi-sensory scene description from this input text. Include:
- Visual setting (location, time, atmosphere)
- Main characters or objects (description, motion)
- Sounds or ambient noise
- Suggested narration with emphasis for pronunciation practice
    """

    # Story content provided by the user/event
    input_text = event.get("prompt", "")
    prompt = f"{base_prompt.strip()}\n\nInput Text:\n{input_text}"

    # Start video generation job
    invocation_arn = start_text_to_video_generation_job(
        bedrock_runtime, prompt, OUTPUT_S3_URI
    )
    print(f"Job started with invocation ARN: {invocation_arn}")

    # Poll job status until it completes or fails
    while True:
        print("\nPolling job status...")
        job = query_job_status(bedrock_runtime, invocation_arn)
        status = job["status"]

        if status == "Completed":
            bucket_uri = job["outputDataConfig"]["s3OutputDataConfig"]["s3Uri"]
            print(f"\nSuccess! The video is available at: {bucket_uri}/output.mp4")
            return {
                "status": "Success",
                "videoUri": f"{bucket_uri}/output.mp4"
            }
        elif status == "Failed":
            print(f"\nVideo generation failed: {job.get('failureMessage', 'Unknown error')}")
            return {
                "status": "Failed",
                "message": job.get("failureMessage", "Unknown error")
            }
        else:
            print("In progress. Waiting 15 seconds...")
            time.sleep(15)
