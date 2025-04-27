import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import TranscriptList from '../components/TranscriptList';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useUser();
  const [transcripts, setTranscripts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchTranscripts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:5000/api/transcripts?user_id=${user.id}`);
      setTranscripts(response.data);
    } catch (err) {
      console.error('Error fetching transcripts:', err);
      setError('Failed to load your transcripts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchTranscripts();
    }
  }, [user]);
  
  const handleTranscriptDeleted = () => {
    fetchTranscripts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Transcripts</h1>
          <p className="mt-1 text-sm text-gray-500">
            {transcripts.length > 0
              ? `You have ${transcripts.length} saved transcript${transcripts.length === 1 ? '' : 's'}`
              : 'Start recording to create your first transcript'}
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <button
            onClick={fetchTranscripts}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Refresh
          </button>
          
          <Link 
            to="/record"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            New Recording
          </Link>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-md border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      <TranscriptList transcripts={transcripts} isLoading={isLoading} onDeleted={handleTranscriptDeleted} />
    </div>
  );
};

export default Dashboard;