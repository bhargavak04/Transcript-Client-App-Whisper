from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
from dotenv import load_dotenv
from routes.auth import auth_bp
from routes.transcripts import transcripts_bp
from transcription import TranscriptionService

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
# Allow uploads up to 1GB (adjust as needed)
app.config['MAX_CONTENT_LENGTH'] = 1 * 1024 * 1024 * 1024
CORS(app)  # Enable CORS for all routes

# Configure uploads folder
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize transcription service with local model
# Model size options: 'tiny', 'base', 'small', 'medium', 'large'
# Smaller models are faster but less accurate
model_size = os.getenv('WHISPER_MODEL_SIZE', 'base')
transcription_service = TranscriptionService(model_size=model_size, upload_folder=app.config['UPLOAD_FOLDER'])

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(transcripts_bp, url_prefix='/api')

# Route to serve uploaded audio files
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    uploads = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'])
    return send_from_directory(uploads, filename)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "whisper_model": f"{model_size}",
        "device": transcription_service.device
    }), 200

if __name__ == '__main__':
    app.run(debug=True)