import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import RecordButton from './RecordButton';
import axios from 'axios';

const AudioRecorder = ({ onTranscriptAdded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  const { user } = useUser();
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to use this feature.');
      console.error('Error accessing microphone:', err);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      
      mediaRecorderRef.current.onstop = async () => {
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          // Use a more readable file name: Recording_YYYY-MM-DD_HH-MM-SS.webm
          const now = new Date();
          const formatted = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0') + '_' +
            String(now.getHours()).padStart(2, '0') + '-' +
            String(now.getMinutes()).padStart(2, '0') + '-' +
            String(now.getSeconds()).padStart(2, '0');
          const fileName = `Recording_${formatted}.webm`;
          
          // Create form data to send to backend
          const formData = new FormData();
          formData.append('audio', audioBlob, fileName);
          formData.append('user_id', user.id);
          formData.append('user_name', user.fullName || `${user.firstName} ${user.lastName || ''}`);
          
          // Send to backend for processing
          const response = await axios.post('http://localhost:5000/api/transcribe', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          
          console.log('Transcribe API response:', response.data);
          // Handle success
          if (response.data && (response.data.text || response.data.transcript)) {
            onTranscriptAdded(response.data);
          } else {
            setError('No transcript returned from backend.');
          }
        } catch (err) {
          setError('Failed to process audio. Please try again.');
          console.error('Error processing audio:', err);
        } finally {
          setIsProcessing(false);
        }
        
        // Stop all audio tracks
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
      };
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Record Audio</h2>
        <p className="text-gray-600">
          {isRecording 
            ? `Recording... ${formatTime(recordingTime)}` 
            : isProcessing 
              ? 'Processing your audio...' 
              : 'Click the button below to start recording'}
        </p>
      </div>
      
      <div className="mb-6">
        <RecordButton 
          isRecording={isRecording} 
          startRecording={startRecording} 
          stopRecording={stopRecording} 
        />
      </div>
      
      {isProcessing && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Transcribing your audio...</span>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Speak clearly for best results</p>
        <p>Audio will be processed using OpenAI Whisper</p>
      </div>
    </div>
  );
};

export default AudioRecorder;