import boto3
textract = boto3. client( 'textract')
with open ('/Users/mohammedalasad/Desktop/nova-hologram/lambda/TextExtraction/img.jpeg','rb') as img:
    document_bytes = img.read()

response= textract.detect_document_text(Document = {'Bytes': document_bytes})
for item in response[ 'Blocks']:
    if item[ 'BlockType'] == 'LINE':
        print (item['Text'])

# This code should print (You can do it!) like what is in the (img.jpeg)
        # in real life we will apload more content pages, which will print (extract) More 
# Mke sure to modify the path of the image in line 3 <3