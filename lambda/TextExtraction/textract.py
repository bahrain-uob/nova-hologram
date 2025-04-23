import boto3

def extract_text_from_image(image_name):
    extract = boto3.client('textract')

    with open(image_name, 'rb') as img:
        document_bytes = img.read()

    response = extract.detect_document_text(Document={'Bytes': document_bytes})
    
    lines = [] # empty arry
    for item in response['Blocks']:
        if item['BlockType'] == 'LINE':
            lines.append(item['Text'])
    
    return lines
