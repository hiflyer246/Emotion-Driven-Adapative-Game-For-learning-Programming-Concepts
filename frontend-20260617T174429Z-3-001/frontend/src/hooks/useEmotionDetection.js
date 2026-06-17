import { useState, useEffect, useRef } from 'react';
import { EmotionService } from '../services/emotionService';
import { WEBCAM_INTERVAL } from '../utils/constants';

export const useEmotionDetection = (sessionId, questionId, videoElement) => {
  const [currentEmotion, setCurrentEmotion] = useState('focused');
  const [emotionData, setEmotionData] = useState(null);
  const [hintRecommendation, setHintRecommendation] = useState(null);
  const emotionServiceRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    emotionServiceRef.current = new EmotionService(sessionId);

    return () => {
      if (emotionServiceRef.current) {
        emotionServiceRef.current.stopContinuousDetection();
      }
    };
  }, [sessionId]);

  useEffect(() => {
    if (!videoElement || !questionId || !emotionServiceRef.current) return;

    const handleEmotionDetected = (result) => {
      setCurrentEmotion(result.emotion);
      setEmotionData(result);
      
      if (result.hint_recommendation && result.hint_recommendation.action !== 'none') {
        setHintRecommendation(result.hint_recommendation);
      }
    };

    emotionServiceRef.current.startContinuousDetection(
      videoElement,
      questionId,
      handleEmotionDetected,
      WEBCAM_INTERVAL
    );

    return () => {
      if (emotionServiceRef.current) {
        emotionServiceRef.current.stopContinuousDetection();
      }
    };
  }, [videoElement, questionId]);

  const clearHintRecommendation = () => {
    setHintRecommendation(null);
  };

  return {
    currentEmotion,
    emotionData,
    hintRecommendation,
    clearHintRecommendation,
  };
};