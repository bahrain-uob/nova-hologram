import boto3
import json
import random
import time
import os

dynamodb = boto3.client("dynamodb")
bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")
sqs = boto3.client("sqs")

ssml_queue_url = os.environ["SSML_QUEUE_URL"]
base_output_uri = os.environ["VIDEO_OUTPUT_S3_URI"]
if not base_output_uri.startswith("s3://"):
    base_output_uri = f"s3://{base_output_uri}"

book_table = os.environ["BOOKS_TABLE"]
chapter_table = os.environ["CHAPTERS_TABLE"]

def get_output_uri(book_id):
    if not base_output_uri.endswith("/"):
        return f"{base_output_uri}/{book_id}/"
    return f"{base_output_uri}{book_id}/"

def flatten_text(text):
    flat = text.replace('\n', ' ')
    flat = flat.replace('\r', ' ')
    flat = flat.replace('"', '')
    flat = flat.replace('**', '')
    flat = flat.replace('###', '')
    flat = flat.replace('*', '')
    flat = flat.replace('#', '')
    flat = flat.replace('$', '')
    flat = flat.replace('@', '')
    flat = ' '.join(flat.split())
    return flat.strip()

def start_video_job(prompt, s3_output_uri):
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
        summary_text = body["summaryText"]
        is_book_summary = body.get("isBookSummary", False)

        # Fetch user ID
        book_response = dynamodb.query(
            TableName=book_table,
            IndexName="GSI_by_book_id",
            KeyConditionExpression="book_id = :bid",
            ExpressionAttributeValues={":bid": {"S": book_id}},
        )
        item = book_response["Items"][0]
        user_id = item["user_id"]["S"]

        # Clean and trim script text
        cleaned_script = flatten_text(script_text)
        if len(cleaned_script) > 4000:
            print(f"⚠️ Script is too long ({len(cleaned_script)} characters). Trimming to 4000.")
            cleaned_script = cleaned_script[:4000]

        final_prompt = f"""
Generate a 1-minute cinematic educational video using the following scene descriptions.

Each scene has already been described in rich visual detail. Use each one as a separate static shot. Do not add extra movement or transitions.

Scene descriptions:
{cleaned_script}
""".strip()

        print("——— Nova Reel Prompt Submission ———")
        print("Chapter:", chapter_no)
        print("Book ID:", book_id)
        print("Prompt:\n", final_prompt)
        print("———————————————————————————————")

        # Mark as "processing"
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
            s3_output_uri = get_output_uri(book_id)
            invocation_arn = start_video_job(final_prompt, s3_output_uri)
            video_url = poll_video_job(invocation_arn)

            # Update video info
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

            # Trigger SSML
            sqs.send_message(
                QueueUrl=ssml_queue_url,
                MessageBody=json.dumps({
                    "bookId": book_id,
                    "chapterNo": chapter_no,
                    "script": cleaned_script,
                    "summary": summary_text,
                    "videoS3Path": video_url,
                    "isBookSummary": is_book_summary
                })
            )
            print("✅ Sent to SSML Queue")

        except Exception as e:
            print(f"❌ Video generation failed: {str(e)}")
            fail_status = {"S": "failed"}
            dynamodb.update_item(
                TableName=book_table if is_book_summary else chapter_table,
                Key=key,
                UpdateExpression="SET trailer_status = :status",
                ExpressionAttributeValues={":status": fail_status},
            )
