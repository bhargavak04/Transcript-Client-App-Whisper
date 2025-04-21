import React from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { MicrophoneIcon, DocumentTextIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

const Landing = () => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 mx-auto">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-primary-800 md:text-5xl lg:text-6xl">
          Whisper Transcribe
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-600 lg:text-xl">
          Record audio and get instant transcriptions powered by OpenAI Whisper
        </p>
        
        <div className="mb-12">
          <SignInButton mode="modal">
            <button className="px-6 py-3 text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 text-lg font-medium transition-all">
              Get Started
            </button>
          </SignInButton>
        </div>

        {/* Features */}
        <div className="grid gap-8 md:grid-cols-3 my-12">
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
            <div className="p-3 mb-3 text-primary-600 bg-primary-100 rounded-full">
              <MicrophoneIcon className="w-8 h-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Easy Recording</h3>
            <p className="text-gray-600">Record audio directly from your browser with one click</p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
            <div className="p-3 mb-3 text-primary-600 bg-primary-100 rounded-full">
              <DocumentTextIcon className="w-8 h-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Instant Transcription</h3>
            <p className="text-gray-600">Powered by OpenAI's Whisper for high-accuracy speech-to-text</p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
            <div className="p-3 mb-3 text-primary-600 bg-primary-100 rounded-full">
              <CloudArrowUpIcon className="w-8 h-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Save & Access</h3>
            <p className="text-gray-600">All your transcripts stored in one place for easy access</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;