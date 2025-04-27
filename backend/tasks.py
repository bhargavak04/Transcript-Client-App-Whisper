from celery_app import celery
from transcription import TranscriptionService
from models import db_session, Transcript

@celery.task(bind=True)
def transcribe_audio_task(self, file_path, file_name, user_id, duration, transcript_id):
    """Celery task to transcribe audio and update the transcript in DB"""
    transcription_service = TranscriptionService()
    session = db_session()
    try:
        transcript_text, language = transcription_service.transcribe(file_path)
        # Update transcript in DB by id
        transcript = session.query(Transcript).get(transcript_id)
        if transcript:
            transcript.text = transcript_text
            transcript.language = language
            transcript.status = 'completed'
            session.commit()
        return {'text': transcript_text, 'language': language}
    except Exception as e:
        transcript = session.query(Transcript).get(transcript_id)
        if transcript:
            transcript.status = 'failed'
            session.commit()
        raise self.retry(exc=e, countdown=10, max_retries=3)
    finally:
        session.close()
