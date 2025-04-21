from flask import Blueprint, request, jsonify, current_app
from models import Session, User, Transcript
import os
import sys

transcripts_bp = Blueprint('transcripts', __name__)

@transcripts_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio file and save transcript"""
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    user_id = request.form.get('user_id')
    user_name = request.form.get('user_name')
    
    if not user_id or not user_name:
        return jsonify({"error": "User ID and name are required"}), 400
    
    session = Session()
    try:
        # Access the global transcription service
        from app import transcription_service
        
        # Check if user exists, create if not
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            user = User(id=user_id, name=user_name)
            session.add(user)
            session.commit()
        
        # Save audio file
        file_path, file_name = transcription_service.save_audio_file(audio_file)
        
        # Get audio duration
        duration = transcription_service.get_audio_duration(file_path)
        
        # Transcribe audio
        transcript_text = transcription_service.transcribe(file_path)
        
        # Save transcript to database
        transcript = Transcript(
            user_id=user_id,
            file_name=file_name,
            file_path=file_path,
            text=transcript_text,
            duration=duration
        )
        
        session.add(transcript)
        session.commit()
        
        return jsonify(transcript.to_dict()), 201
    
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    
    finally:
        session.close()

@transcripts_bp.route('/transcripts', methods=['GET'])
def get_transcripts():
    """Get all transcripts for a user"""
    user_id = request.args.get('user_id')
    
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400
    
    session = Session()
    try:
        transcripts = session.query(Transcript).filter_by(user_id=user_id).order_by(Transcript.created_at.desc()).all()
        return jsonify([transcript.to_dict() for transcript in transcripts]), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        session.close()

@transcripts_bp.route('/transcripts/<int:transcript_id>', methods=['GET'])
def get_transcript(transcript_id):
    """Get a specific transcript"""
    session = Session()
    try:
        transcript = session.query(Transcript).filter_by(id=transcript_id).first()
        
        if not transcript:
            return jsonify({"error": "Transcript not found"}), 404
        
        return jsonify(transcript.to_dict()), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    finally:
        session.close()

@transcripts_bp.route('/transcripts/<int:transcript_id>', methods=['DELETE'])
def delete_transcript(transcript_id):
    """Delete a transcript"""
    session = Session()
    try:
        transcript = session.query(Transcript).filter_by(id=transcript_id).first()
        
        if not transcript:
            return jsonify({"error": "Transcript not found"}), 404
        
        # Delete the audio file if it exists
        if os.path.exists(transcript.file_path):
            os.remove(transcript.file_path)
        
        session.delete(transcript)
        session.commit()
        
        return jsonify({"message": "Transcript deleted successfully"}), 200
    
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    
    finally:
        session.close()