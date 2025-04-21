import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AudioRecorder from '../components/AudioRecorder';
import TranscriptCard from '../components/TranscriptCard';

const RecordPage = () => {
  const [latestTranscript, setLatestTranscript] = useState(null);
  const navigate = useNavigate();
  
  const handleTranscriptAdded = (transcript) => {
    setLatestTranscript(transcript);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create a New Recording</h1>
        <p className="mt-2 text-gray-600">
          Record audio and get an instant transcription powered by OpenAI Whisper
        </p>
      </div>
      
      <div className="mb-12">
        <AudioRecorder onTranscriptAdded={handleTranscriptAdded} />
      </div>
      
      {latestTranscript && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Transcript</h2>
          <TranscriptCard transcript={latestTranscript} />
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              View all transcripts
            </button>
          </div>
        </div>
      )}      
    </div>
  );
};

export default RecordPage;