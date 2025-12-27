import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const createSession = async () => {
  const response = await api.post('/api/session/create');
  return response.data;
};

export const detectEmotion = async (imageData, questionId, timeSpent, sessionId) => {
  const response = await api.post('/api/detect-emotion', {
    image: imageData,
    questionId,
    timeSpent,
    sessionId,
  });
  return response.data;
};

export const generateQuestions = async (topic, difficulty, count = 5) => {
  const response = await api.post('/api/generate-questions', {
    topic,
    difficulty,
    count,
  });
  return response.data;
};

export const getQuestions = async (topic = null, difficulty = null, limit = 10) => {
  const params = {};
  if (topic) params.topic = topic;
  if (difficulty) params.difficulty = difficulty;
  if (limit) params.limit = limit;
  
  const response = await api.get('/api/questions', { params });
  return response.data;
};

export const getQuestionById = async (questionId) => {
  const response = await api.get(`/api/questions/${questionId}`);
  return response.data;
};

export const submitAnswer = async (sessionId, questionId, answer, timeTaken) => {
  const response = await api.post('/api/submit-answer', {
    sessionId,
    questionId,
    answer,
    timeTaken,
  });
  return response.data;
};

export const getSessionStats = async (sessionId) => {
  const response = await api.get(`/api/session/${sessionId}/stats`);
  return response.data;
};

export default api;