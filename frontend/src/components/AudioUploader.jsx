import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';

const AudioUploader = ({ onTranscriptAdded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const handleFileChange = async (event) => {
    setError(null);
    const file = event.target.files[0];
    if (!file) return;
    // Accept only audio files
    if (!file.type.startsWith('audio/')) {
      setError('Please upload a valid audio file.');
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file, file.name);
      formData.append('user_id', user.id);
      formData.append('user_name', user.fullName || `${user.firstName} ${user.lastName || ''}`);
      const response = await axios.post('http://localhost:5000/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Expect response.data to have transcript_id and job_id
      const { transcript_id } = response.data;
      if (!transcript_id) {
        setError('Failed to start transcription.');
        setIsUploading(false);
        return;
      }
      // Poll for transcript status
      let pollCount = 0;
      const maxPolls = 30; // e.g. 30 x 2s = 60s max
      const pollInterval = 2000;
      let transcript = null;
      while (pollCount < maxPolls) {
        try {
          const pollResponse = await axios.get(`http://localhost:5000/api/transcripts/${transcript_id}`);
          transcript = pollResponse.data;
          if (transcript.status === 'completed') {
            onTranscriptAdded(transcript);
            setError(null);
            break;
          } else if (transcript.status === 'failed') {
            setError('Transcription failed.');
            break;
          }
        } catch (pollErr) {
          setError('Error fetching transcript status.');
          break;
        }
        await new Promise(res => setTimeout(res, pollInterval));
        pollCount += 1;
      }
      if (!transcript || transcript.status !== 'completed') {
        setError('Transcription timed out. Please try again.');
      }
    } catch (err) {
      setError('Failed to process audio. Please try again.');
      console.error('Error processing audio:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md mt-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Audio File</h2>
      <p className="text-gray-600 mb-4">Select an audio file to transcribe</p>
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="mb-4"
      />
      {isUploading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Uploading & transcribing...</span>
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>
      )}
    </div>
  );
};

export default AudioUploader;
