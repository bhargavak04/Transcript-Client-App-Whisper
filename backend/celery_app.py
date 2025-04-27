from celery import Celery
import os

# Broker URL (using Redis by default)
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0')

celery = Celery('transcript_backend', broker=CELERY_BROKER_URL, backend=CELERY_RESULT_BACKEND)

# Optional: Celery config
celery.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
)

# Explicitly import tasks so Celery registers them
import tasks
