import React, { useState } from 'react';
import { ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

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
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-800 truncate">
            {transcript.file_name.replace(/\.[^/.]+$/, "")}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {(transcript.duration / 60).toFixed(1)} min
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