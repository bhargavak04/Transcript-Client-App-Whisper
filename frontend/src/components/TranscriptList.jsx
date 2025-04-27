import React, { useState } from 'react';
import TranscriptCard from './TranscriptCard';

const TranscriptList = ({ transcripts, isLoading, onDeleted }) => {
  const [localTranscripts, setLocalTranscripts] = useState(transcripts);

  React.useEffect(() => {
    setLocalTranscripts(transcripts);
  }, [transcripts]);

  const handleDeleted = (id) => {
    setLocalTranscripts((prev) => prev.filter(t => t.id !== id));
    if (onDeleted) onDeleted(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (transcripts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <h3 className="mt-2 text-lg font-medium text-gray-900">No transcripts yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your transcribed audio will appear here once you've created some recordings.
        </p>
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => window.location.href = '/record'}
          >
            Create your first recording
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {localTranscripts.map((transcript) => (
        <TranscriptCard key={transcript.id} transcript={transcript} onDeleted={handleDeleted} />
      ))}
    </div>
  );
};

export default TranscriptList;