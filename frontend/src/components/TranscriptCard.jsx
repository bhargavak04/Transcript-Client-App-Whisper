import React, { useState } from 'react';
import { ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// Optional: map language code to full name for better UX
const languageMap = {
  en: 'English',
  hi: 'Hindi',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese',
  ru: 'Russian',
  ar: 'Arabic',
  // Add more as needed
};

const TranscriptCard = ({ transcript }) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get a preview of the transcript text (first 150 characters)
  const previewText = transcript.text.length > 150 
    ? transcript.text.substring(0, 150) + '...' 
    : transcript.text;
  
  // Request notification permission once on mount
  React.useEffect(() => {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Notify user when transcript is completed (only once per transcript)
  React.useEffect(() => {
    if (transcript.status === 'completed') {
      const notifiedKey = `transcript_notified_${transcript.id}`;
      if (localStorage.getItem(notifiedKey)) return; // Already notified

      let notified = false;
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Transcription Complete', {
          body: `${transcript.file_name.replace(/\.[^/.]+$/, "")} is ready!`,
        });
        notified = true;
      }
      // Fallback: play a beep if notifications are not available or blocked
      if (!notified) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = ctx.createOscillator();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz beep
          oscillator.connect(ctx.destination);
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.3);
        } catch (e) {
          // No audio context available
        }
        if (window.Notification && Notification.permission === 'denied') {
          console.warn('Notification permission denied. Enable notifications for popup alerts.');
        }
      }
      localStorage.setItem(notifiedKey, '1');
    }
  }, [transcript.status, transcript.id]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {transcript.file_name.replace(/\.[^/.]+$/, "")}
            </h3>
            {transcript.language && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1 mr-2">
                {languageMap[transcript.language] || transcript.language}
              </span>
            )}
            {transcript.status === 'processing' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1 mr-2">
                <svg className="animate-spin h-4 w-4 mr-1 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                Processing
              </span>
            )}
            {transcript.status === 'failed' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1 mr-2">
                Failed
              </span>
            )}
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {transcript.duration >= 60
              ? `${Math.floor(transcript.duration / 60)} min ${Math.round(transcript.duration % 60)} sec`
              : `${Math.round(transcript.duration)} sec`}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <ClockIcon className="h-4 w-4 mr-1" />
          {formatDate(transcript.created_at)}
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600">
            {expanded ? transcript.text : previewText}
          </p>
        </div>

        {transcript.file_path && (
          <div className="mb-4">
            <div className="bg-gray-50 rounded-md border border-gray-200 p-2 flex items-center shadow-sm">
              <audio
                controls
                src={`http://localhost:5000/${transcript.file_path.replace(/^\\+/, '')}`}
                className="w-full accent-blue-600"
                style={{
                  background: 'transparent',
                  outline: 'none',
                  borderRadius: '0.5rem',
                  height: '2.25rem',
                  minWidth: 0
                }}
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        )}
        
        {transcript.text.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
      
      <div className="px-5 py-3 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <DocumentTextIcon className="h-4 w-4 mr-1" />
          <span>{transcript.text.split(/\s+/).length} words</span>
        </div>
        
        <button
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          onClick={() => {
            const blob = new Blob([transcript.text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${transcript.file_name.replace(/\.[^/.]+$/, "")}-transcript.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default TranscriptCard;