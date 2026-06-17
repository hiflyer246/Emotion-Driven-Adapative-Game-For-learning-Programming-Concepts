import api from './api';

export const getUserAnalytics = async (userId) => {
  const response = await api.get(`/api/analytics/${userId}`);
  return response.data;
};

export const updateAnalytics = async (userId, questionData) => {
  const response = await api.post('/api/analytics/update', {
    user_id: userId,
    correct: questionData.correct,
    time_taken: questionData.timeTaken,
    emotion: questionData.emotion || 'focused'
  });
  return response.data;
};

export const updateUserXP = async (userId, xpToAdd) => {
  const response = await api.post('/api/user/update-xp', {
    user_id: userId,
    xp_to_add: xpToAdd
  });
  return response.data;
};

export const getLeaderboard = async (limit = 10) => {
  const response = await api.get('/api/leaderboard', {
    params: { limit }
  });
  return response.data;
};