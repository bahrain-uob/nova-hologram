'''
import boto3

def lambda_handler(event, context):
    textract = boto3.client('textract')

    # Get the bucket and image file name from the event
    bucket = event['my-textract-bucket']
    document_key = event['img2.png']

    # Call Textract to detect text
    response = textract.detect_document_text(
        Document={'S3Object': {'Bucket': bucket, 'Name': document_key}}
    )

    # Extract lines of text from response
    lines = []
    for item in response['Blocks']:
        if item['BlockType'] == 'LINE':
            lines.append(item['Text'])

    # Return as Lambda output
    return {
        'statusCode': 200,
        'body': {
            'lines': lines
        }
    }
'''


import boto3
import time

# Example: your bucket where images are uploaded
S3_BUCKET_NAME = "s3://textract-console-us-east-1-83c86fc7-c823-4e34-916d-3b702b3ab15e/Handler/"

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

def lambda_handler(event, context):
    """
    AWS Lambda function to extract text from an image using Textract.
    """
    textract_client = boto3.client('textract', region_name='us-east-1')

    # Get the S3 image key from the event (passed by S3 trigger or API Gateway)
    document_key = event.get("img2.png", "")
    
    if not document_key:
        return {"status": "Failed", "message": "No document_key provided in event."}

    # Start Textract job
    job_id = start_text_extraction_job(textract_client, S3_BUCKET_NAME, document_key)
    print(f"Started Textract job with ID: {job_id}")

    # Wait and poll for job completion
    while True:
        print("Polling job status...")
        result = check_job_status(textract_client, job_id)
        status = result["JobStatus"]

        if status == "SUCCEEDED":
            print("Job succeeded. Extracting text...")
            extracted_text = ""
            for block in result["Blocks"]:
                if block["BlockType"] == "LINE":
                    extracted_text += block["Text"] + "\n"

            return {
                "status": "Success",
                "extractedText": extracted_text.strip()
            }

        elif status == "FAILED":
            return {"status": "Failed", "message": "Textract job failed."}

        else:
            time.sleep(5)  # Wait before polling again

