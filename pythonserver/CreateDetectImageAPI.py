from flask import Flask, request, jsonify
from flask_cors import CORS  # Added import for CORS
import clip
import torch
from PIL import Image
import io

app = Flask(__name__)
CORS(app)  # Allow API requests from any origin

# Load the CLIP model and preprocessing function
model, preprocess = clip.load("ViT-B/32", device="cpu")  # Use "cuda" if available

# Define the possible complaint categories
labels = [
    "Pothole on road",
    "Garbage accumulation",
    "Clean road",
    "Broken streetlight",
    "Illegal construction",
]

# Tokenize the text labels once
text_tokens = clip.tokenize(labels)

@app.route('/api/detect-image/', methods=['POST'])
def detect_image():
    # Check if an image file is provided
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Open image and preprocess it for CLIP
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_input = preprocess(image).unsqueeze(0)
        
        # Run the model
        with torch.no_grad():
            image_features = model.encode_image(image_input)
            text_features = model.encode_text(text_tokens)
            similarity = (image_features @ text_features.T).softmax(dim=-1)
            detected_issue = labels[similarity.argmax().item()]
        
        # Return the detection result as JSON
        return jsonify({'scenario': detected_issue})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=6000)
