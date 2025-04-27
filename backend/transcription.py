import os
import torch
from pydub import AudioSegment
import tempfile
from werkzeug.utils import secure_filename
from transformers import WhisperProcessor, WhisperForConditionalGeneration
from langdetect import detect

class TranscriptionService:
    def __init__(self, model_size="small", upload_folder='uploads'):
        """
        Initialize the transcription service with a local Whisper model
        
        Args:
            model_size (str): Size of the Whisper model to use ('tiny', 'base', 'small', 'medium', 'large')
            upload_folder (str): Folder to store uploaded audio files
        """
        self.upload_folder = upload_folder
        os.makedirs(self.upload_folder, exist_ok=True)
        
        # Load whisper model from transformers
        self.model_size = "small"
        self.model_path = os.path.join(r"C:\Users\bharg\Downloads\Transcript-Client\backend", f"whisper-small")
        self.model_name = f"openai/whisper-{model_size}"
        
        print(f"Loading Whisper {model_size} model from Hugging Face...")
        self.processor = WhisperProcessor.from_pretrained(self.model_path)
        self.model = WhisperForConditionalGeneration.from_pretrained(self.model_path)
        
        # Move model to GPU if available
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = self.model.to(self.device)
        
        print(f"Model loaded and ready on {self.device}!")
    
    def save_audio_file(self, file):
        """Save audio file to disk and return the file path"""
        filename = secure_filename(file.filename)
        file_path = os.path.join(self.upload_folder, filename)
        file.save(file_path)
        return file_path, filename
    
    def get_audio_duration(self, file_path):
        """Get audio duration in seconds"""
        audio = AudioSegment.from_file(file_path)
        return len(audio) / 1000  # Convert milliseconds to seconds
    
    def convert_to_wav(self, file_path):
        """Convert audio file to WAV format at 16kHz as required by Whisper"""
        try:
            audio = AudioSegment.from_file(file_path)
            
            # Create a temp file with .wav extension
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
                temp_path = temp_file.name
            
            # Export as WAV with 16kHz sample rate
            audio = audio.set_frame_rate(16000)
            audio = audio.set_channels(1)  # Mono
            audio.export(temp_path, format="wav")
            
            return temp_path
            
        except Exception as e:
            print(f"Error converting audio: {e}")
            raise
    
    def transcribe(self, file_path):
        """Transcribe arbitrarily long audio by chunking into 30-second segments for Whisper."""
        try:
            # Convert to WAV format at 16kHz
            wav_path = self.convert_to_wav(file_path)
            
            import librosa
            import numpy as np
            audio, sr = librosa.load(wav_path, sr=16000)
            chunk_duration = 30  # seconds
            chunk_samples = chunk_duration * sr
            total_samples = len(audio)
            num_chunks = int(np.ceil(total_samples / chunk_samples))
            
            all_transcripts = []
            for i in range(num_chunks):
                start = int(i * chunk_samples)
                end = int(min((i + 1) * chunk_samples, total_samples))
                audio_chunk = audio[start:end]
                if len(audio_chunk) == 0:
                    continue
                input_features = self.processor(audio_chunk, sampling_rate=16000, return_tensors="pt").input_features
                input_features = input_features.to(self.device)
                predicted_ids = self.model.generate(input_features)
                chunk_transcript = self.processor.batch_decode(predicted_ids, skip_special_tokens=True)[0]
                all_transcripts.append(chunk_transcript)
            transcription = " ".join(all_transcripts)

            # Detect language using langdetect (on first chunk or full text)
            from langdetect import detect
            try:
                language = detect(all_transcripts[0] if all_transcripts else "")
            except Exception as e:
                print(f"[DEBUG] langdetect failed: {e}")
                language = None

            print(f"[DEBUG] Detected language: {language}")
            print(f"[DEBUG] Transcription: {transcription[:200]}...")
            
            # Clean up temp file
            if os.path.exists(wav_path) and wav_path.endswith('.wav'):
                os.remove(wav_path)
            
            return transcription, language
        
        except Exception as e:
            print(f"Error transcribing audio: {e}")
            raise