import api from "./api";

export const interviewApi = {
  startInterview: async (userId, topic, difficulty) => {
    const response = await api.post("/api/interview/start", {
      user_id: userId,
      topic,
      difficulty,
    });
    return response.data;
  },

  startInterviewWithResume: async (formData) => {
    const response = await api.post("/api/interview/start-with-resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  processFrame: async (sessionId, imageBase64) => {
    const response = await api.post("/api/interview/process-frame", {
      session_id: sessionId,
      image: imageBase64,
    });
    return response.data;
  },

  submitResponse: async (sessionId, answerText) => {
    const response = await api.post("/api/interview/submit-response", {
      session_id: sessionId,
      answer_text: answerText,
    });
    return response.data;
  },

  getReport: async (sessionId) => {
    const response = await api.get(`/api/interview/report/${sessionId}`);
    return response.data;
  },

  getAudio: async (text) => {
    const response = await api.post("/api/interview/tts", { text });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get("/api/interview/history");
    return response.data;
  },
};
