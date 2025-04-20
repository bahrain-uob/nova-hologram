import boto3
textract = boto3. client( 'textract')
with open ('/Users/mohammedalasad/Desktop/nova-hologram/lambda/TextExtraction/img1.jpeg','rb') as img:
    document_bytes = img.read()

response= textract.detect_document_text(Document = {'Bytes': document_bytes})

print ("printing the text in the imge")
for item in response[ 'Blocks']:
    if item[ 'BlockType'] == 'LINE':
        print (item['Text'])


'''
print ("printing the Key value pairs") # For the future 
for item in response[ 'Blocks']:
    if item[ 'BlockType'] == 'KEY_VALUE_SET':
        print (item['Text'])    

print ("printing the Key value Tables") # For the future 
for item in response[ 'Blocks']:
    if item[ 'BlockType'] == 'TABLE':
        print (item['Text']) 
'''

# This code should print (You can do it!) like what is in the (img.jpeg)
        # in real life we will apload more content pages, which will print (extract) More 
        # this code could be 
# Make sure to modify the path of the image in line 3 <3