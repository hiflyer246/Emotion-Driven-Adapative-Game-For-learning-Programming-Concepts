import api from './api';

export const getStoryChapter = async (chapterId) => {
  const response = await api.get(`/api/story/chapter/${chapterId}`);
  return response.data;
};

export const getStoryProgress = async (userId) => {
  const response = await api.get(`/api/story/progress/${userId}`);
  return response.data;
};

export const restoreBuilding = async (userId, buildingId) => {
  const response = await api.post('/api/story/restore-building', null, {
    params: { user_id: userId, building_id: buildingId }
  });
  return response.data;
};