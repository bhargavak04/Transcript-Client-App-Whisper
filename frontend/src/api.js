import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  // Transcript endpoints
  getTranscripts: async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/transcripts`, {
      params: { user_id: userId }
    });
    return response.data;
  },
  
  transcribeAudio: async (formData) => {
    const response = await axios.post(`${API_BASE_URL}/transcribe`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  deleteTranscript: async (transcriptId) => {
    const response = await axios.delete(`${API_BASE_URL}/transcripts/${transcriptId}`);
    return response.data;
  }
};

export default apiService;