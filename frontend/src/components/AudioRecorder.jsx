import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import RecordButton from './RecordButton';
import axios from 'axios';

const AudioRecorder = ({ onTranscriptAdded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const { user } = useUser();
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Fetch available audio input devices
  React.useEffect(() => {
    async function getDevices() {
      try {
        // Need to prompt for permissions first to get device labels
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = allDevices.filter(d => d.kind === 'audioinput');
        setDevices(audioInputs);
        if (audioInputs.length > 0) {
          setSelectedDeviceId(audioInputs[0].deviceId);
        }
      } catch (e) {
        setDevices([]);
      }
    }
    getDevices();
  }, []);

  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
  };
  
  const startRecording = async () => {
    setError(null);
    try {
      // Use selected deviceId if available
      const constraints = selectedDeviceId ? { audio: { deviceId: { exact: selectedDeviceId } } } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
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
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">Record New Audio</h2>
      {devices.length > 1 && (
        <div className="mb-4">
          <label htmlFor="mic-select" className="block text-sm font-medium text-gray-700 mb-1">Select Microphone:</label>
          <select
            id="mic-select"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            value={selectedDeviceId}
            onChange={handleDeviceChange}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone (${device.deviceId})`}</option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <p className="text-gray-600 mb-4">
          {isRecording 
            ? `Recording... ${formatTime(recordingTime)}` 
            : isProcessing 
              ? 'Processing your audio...' 
              : 'Click the button below to start recording'}
        </p>
        <div className="mt-2 flex justify-center w-full">
          <RecordButton 
            isRecording={isRecording} 
            startRecording={startRecording} 
            stopRecording={stopRecording} 
          />
        </div>
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