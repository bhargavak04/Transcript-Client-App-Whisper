import React from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';

const RecordButton = ({ isRecording, startRecording, stopRecording }) => {
  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`flex items-center justify-center w-24 h-24 rounded-full shadow-lg transition-all ${
        isRecording
          ? 'bg-red-500 hover:bg-red-600 animate-pulse-slow'
          : 'bg-primary-600 hover:bg-primary-700'
      }`}
    >
      {isRecording ? (
        <StopIcon className="h-10 w-10 text-white" />
      ) : (
        <MicrophoneIcon className="h-10 w-10 text-white" />
      )}
    </button>
  );
};

export default RecordButton;