import boto3
textract = boto3. client( 'textract')
with open ('img.jpeg','rb') as img:
    document_bytes = img.read()

response= textract.detect_document_text(Document = {'Bytes': document_bytes})
for item in response[ 'Blocks']:
    if item[ 'BlockType'] == 'LINE':
        print (item[ 'Text '])