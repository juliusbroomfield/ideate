from flask import Flask, request, jsonify
import os
import io
import openai  
from google.cloud import videointelligence
from dotenv import load_dotenv

load_dotenv()
openai_api_key = os.environ.get("OPENAI_API_KEY")

app = Flask(__name__)

def video_detect_text(path):
    video_client = videointelligence.VideoIntelligenceServiceClient()
    features = [videointelligence.Feature.TEXT_DETECTION]
    video_context = videointelligence.VideoContext()

    with open(path, "rb") as file:
        input_content = file.read()

    operation = video_client.annotate_video(
        request={
            "features": features,
            "input_content": input_content,
            "video_context": video_context,
        }
    )

    result = operation.result(timeout=180)
    annotation_result = result.annotation_results[0]

    if hasattr(annotation_result, 'text_annotations'):
        all_text = " ".join([annotation.text for annotation in annotation_result.text_annotations])
        return all_text
    else:
        return None
    
def text_to_code_gpt(language, text):
    openai.api_key = openai_api_key


    response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo-16k",
    messages=[{
        "role": "user",
        "content": f"Given the following abstract idea and pseudocode, translate it into functional {language} code. Please ensure that: 1. The code is functional and executable. 2. Assume that all necessary libraries are already imported. 3. Provide comments to explain complex or unintuitive parts of the code. 4. If the idea is too abstract, make reasonable assumptions to create functional code. {text}. Output functional {language} code:"
        }],
    temperature=1.3,
    max_tokens=2056,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0
    )
    
    code = response.choices[0].message.content
    return code

@app.route('/upload', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        file_path = os.path.join("/tmp", file.filename)
        file.save(file_path)

        ocr_text = video_detect_text(file_path)

        if ocr_text is None:
            return jsonify({'error': 'Could not extract text'})

        translated_code = text_to_code_gpt('Julia', ocr_text)

        return jsonify({'translated_code': translated_code})


# @app.route('/create_repo', methods = ['POST'])