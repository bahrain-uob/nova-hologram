import boto3
import json
import random
import time
import os

dynamodb = boto3.client("dynamodb")
bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")

s3_output_uri = os.environ["VIDEO_OUTPUT_S3_URI"]
if not s3_output_uri.startswith("s3://"):
    s3_output_uri = f"s3://{s3_output_uri}"

book_table = os.environ["BOOKS_TABLE"]
chapter_table = os.environ["CHAPTERS_TABLE"]

def start_video_job(prompt):
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

    output_config = {"s3OutputDataConfig": {"s3Uri": s3_output_uri}}

    response = bedrock_runtime.start_async_invoke(
        modelId=model_id,
        modelInput=model_input,
        outputDataConfig=output_config
    )
    return response["invocationArn"]

def poll_video_job(invocation_arn):
    while True:
        job = bedrock_runtime.get_async_invoke(invocationArn=invocation_arn)
        status = job["status"]

        if status == "Completed":
            return f"{job['outputDataConfig']['s3OutputDataConfig']['s3Uri']}/output.mp4"
        elif status == "Failed":
            raise Exception(f"Video generation failed: {job.get('failureMessage', 'Unknown error')}")
        time.sleep(15)

def lambda_handler(event, context):
    for record in event["Records"]:
        body = json.loads(record["body"])
        book_id = body["bookId"]
        chapter_no = body.get("chapterNo")
        script_text = body["scriptText"]
        is_book_summary = body.get("isBookSummary", False)

        # Get user_id only (no prompt used)
        book_response = dynamodb.query(
            TableName=book_table,
            IndexName="GSI_by_book_id",
            KeyConditionExpression="book_id = :bid",
            ExpressionAttributeValues={":bid": {"S": book_id}},
        )
        item = book_response["Items"][0]
        user_id = item["user_id"]["S"]

        # Build the Nova Reel final prompt
        final_prompt = f"""
Generate a 1-minute cinematic educational video using the following scene descriptions.

Each scene has already been described in rich visual detail. Use each one as a separate static shot. Do not add extra movement or transitions.

Scene descriptions:
{script_text}
""".strip()

        # ✅ Log to help detect blocked prompts or chapter failures
        print("——— Nova Reel Prompt Submission ———")
        print("Chapter:", chapter_no)
        print("Book ID:", book_id)
        print("Prompt:\n", final_prompt)
        print("———————————————————————————————")

        # Set initial status
        if is_book_summary:
            key = {"user_id": {"S": user_id}, "book_id": {"S": book_id}}
            dynamodb.update_item(
                TableName=book_table,
                Key=key,
                UpdateExpression="SET trailer_status = :status",
                ExpressionAttributeValues={":status": {"S": "processing"}},
            )
        else:
            chapter_id = f"{book_id}#{chapter_no}"
            key = {"chapter_id": {"S": chapter_id}, "book_id": {"S": book_id}}
            dynamodb.update_item(
                TableName=chapter_table,
                Key=key,
                UpdateExpression="SET trailer_status = :status",
                ExpressionAttributeValues={":status": {"S": "processing"}},
            )

        try:
            invocation_arn = start_video_job(final_prompt)
            video_url = poll_video_job(invocation_arn)

            # Save video result
            if is_book_summary:
                dynamodb.update_item(
                    TableName=book_table,
                    Key=key,
                    UpdateExpression="SET book_trailer = :url, trailer_status = :status",
                    ExpressionAttributeValues={
                        ":url": {"S": video_url},
                        ":status": {"S": "completed"},
                    },
                )
            else:
                dynamodb.update_item(
                    TableName=chapter_table,
                    Key=key,
                    UpdateExpression="SET trailer = :url, trailer_status = :status",
                    ExpressionAttributeValues={
                        ":url": {"S": video_url},
                        ":status": {"S": "completed"},
                    },
                )

            print(f"✅ Video available at: {video_url}")

        except Exception as e:
            print(f"❌ Video generation failed: {str(e)}")
            fail_status = {"S": "failed"}
            if is_book_summary:
                dynamodb.update_item(
                    TableName=book_table,
                    Key=key,
                    UpdateExpression="SET trailer_status = :status",
                    ExpressionAttributeValues={":status": fail_status},
                )
            else:
                dynamodb.update_item(
                    TableName=chapter_table,
                    Key=key,
                    UpdateExpression="SET trailer_status = :status",
                    ExpressionAttributeValues={":status": fail_status},
                )
