from flask import Flask, request, redirect, jsonify, url_for, render_template
from flask_cors import CORS
import requests
import os
import io
import openai  
from google.cloud import videointelligence, speech
from dotenv import load_dotenv
import base64
from string import printable
from moviepy.editor import *
import argparse



load_dotenv()
openai_api_key = os.environ.get("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

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


@app.route('/textgpt', methods=['GET'])
def text_to_code_gpt():
    # For simplicity, I'm assuming `language` and `text` are constants here. You may want to retrieve them from the request if they are dynamic.
    language = "python"  
    text = "Some pseudocode or description"

    openai.api_key = openai_api_key

    response = openai.Completion.create(
        model="text-davinci-002",
        prompt=f"Translate the following pseudocode into {language}: {text}",
        max_tokens=200
    )
    
    code = response.choices[0].text.strip()
    return jsonify({'code': code})



def upload_video():
    client = speech.SpeechClient()

    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file:
        file_path = os.path.join("/tmp", file.filename)
        file.save(file_path)

        title = file_path[:len(file_path) - 4]

        video = VideoFileClip(title + '.mp4')
        video.audio.write_audiofile(title + '.mp3')

        audio = title + ".mp3"

        config = speech.RecognitionConfig(
            encoding = speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz = 16000, 
            language_code="en-US",
        )

        response = client.recognize(config=config, audio=audio)

        ocr_text = video_detect_text(file_path) + response

        if ocr_text is None:
            return jsonify({'error': 'Could not extract text'})

        translated_code = text_to_code_gpt('Julia', ocr_text)

        return jsonify({'translated_code': translated_code})


@app.route('/video', methods=['GET', 'POST'])
def video():
    if request.method == 'POST':
        uploaded_file = request.files['file']
        if uploaded_file.filename != '':
            filepath = os.path.join("uploads", uploaded_file.filename)
            uploaded_file.save(filepath)

            ocr_text = video_detect_text(filepath)

            if ocr_text is None: return jsonify({'error': 'Could not extract text'})
            
            translated_code = text_to_code_gpt('Java', ocr_text)

            return redirect(url_for('index'))
        
    elif request.method == 'GET':
        if translated_code is None:
            return jsonify({'error': 'No code generated yet'})
        
        return jsonify({'translated_code': translated_code})


@app.route('/publish')
def github():
    github_token = os.environ.get("GITHUB_USER_TOKEN")
    url = f"https://api.github.com/user/repos"

    repo_details = {
        "name": "automation-test-4",
        "description": "This is a new repository",
        "private": False,
        "auto_init": False
    }

    headers = {
        "Authorization": f"token {github_token}"
    }

    response = requests.put(url, json=payload, headers=headers)
    if response.status_code != 200:
        return jsonify({'error': 'Failed to upload to GitHub'})

    user = "JuliustheCreator"
    repo = repo_details['name']

    programming_languages_extensions = {
        "Python": ".py",
        "JavaScript": ".js",
        "Java": ".java",
        "C++": ".cpp",
        "C": ".c",
        "C#": ".cs",
        "TypeScript": ".ts",
        "Ruby": ".rb",
        "Swift": ".swift",
        "Kotlin": ".kt",
        "Go": ".go",
        "Rust": ".rs",
        "PHP": ".php",
        "Shell": ".sh",
        "HTML": ".html",
        "CSS": ".css",
        "SQL": ".sql",
        "MATLAB": ".m",
        "Scala": ".scala",
        "Perl": ".pl",
        "Lua": ".lua",
        "Groovy": ".groovy",
        "R": ".R"}
    
    language = 'Java'
    file_path_in_repo = "generated_code" + programming_languages_extensions[language]
    generated_code = text_to_code_gpt('Java', ocr_text, 'Amateur')
    base64_content = base64.b64encode(generated_code.encode('utf-8')).decode('utf-8')

    url = f"https://api.github.com/repos/{user}/{repo}/contents/{file_path_in_repo}"

    headers = {"Authorization": f"token {token}"}
    payload = {
        "message": "Uploading generated code",
        "content": base64_content
    }

    return requests.put(url, json=payload, headers=headers)


if __name__ == '__main__':
    app.run(debug = True, host='0.0.0.0', port = 8080)