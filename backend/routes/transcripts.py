from flask import Blueprint, request, jsonify, current_app
from werkzeug.exceptions import RequestEntityTooLarge
from models import Session, User, Transcript
import os
import sys
from transcription import TranscriptionService
from celery_app import celery
from celery.result import AsyncResult
from tasks import transcribe_audio_task

transcription_service = TranscriptionService()
transcripts_bp = Blueprint('transcripts', __name__)

# Handle large file upload errors
@transcripts_bp.errorhandler(RequestEntityTooLarge)
def handle_large_file(e):
    return jsonify({'error': 'File is too large. Maximum allowed size is 1GB.'}), 413

@transcripts_bp.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Handle audio file upload and transcription (asynchronously via Celery)"""
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio_file = request.files['audio']
    user_id = request.form.get('user_id')
    user_name = request.form.get('user_name')
    
    if not user_id or not user_name:
        return jsonify({"error": "User ID and name are required"}), 400
    
    # Save audio file
    file_path, file_name = transcription_service.save_audio_file(audio_file)
    duration = transcription_service.get_audio_duration(file_path)

    # Create Transcript row (status='processing')
    from models import Transcript, db_session
    session = db_session()
    transcript = Transcript(
        user_id=user_id,
        file_name=file_name,
        file_path=file_path,
        text='',
        duration=duration,
        language=None,
        status='processing',
        job_id=None
    )
    session.add(transcript)
    session.commit()
    transcript_id = transcript.id
    session.close()

    # Enqueue transcription job, pass transcript_id
    task = transcribe_audio_task.delay(file_path, file_name, user_id, duration, transcript_id)
    
    # Update job_id in the transcript row
    session = db_session()
    transcript = session.query(Transcript).get(transcript_id)
    transcript.job_id = task.id
    session.commit()
    session.close()

    return jsonify({'message': 'Transcription started', 'job_id': task.id, 'transcript_id': transcript_id}), 202

@transcripts_bp.route('/job_status/<job_id>', methods=['GET'])
def job_status(job_id):
    """Check the status/result of a transcription job"""
    task = AsyncResult(job_id, app=celery)
    response = {'job_id': job_id, 'state': task.state}
    if task.state == 'SUCCESS':
        response['result'] = task.result
    elif task.state == 'FAILURE':
        response['error'] = str(task.info)
    return jsonify(response)

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