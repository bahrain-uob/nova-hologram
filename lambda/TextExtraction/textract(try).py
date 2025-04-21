from textract import extract_text_from_image
import os # making  file path dynamic and compatible across all systems 

image_path = os.path.join(os.path.dirname(__file__), 'img1.jpeg')

lines = extract_text_from_image(image_path)

for line in lines:
    print(line)
