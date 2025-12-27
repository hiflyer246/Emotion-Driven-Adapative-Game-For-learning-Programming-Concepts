import { detectEmotion } from './api';
import { convertImageToBase64 } from '../utils/helpers';

export class EmotionService {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.isRunning = false;
    this.interval = null;
  }

  async captureAndDetect(videoElement, questionId, timeSpent) {
    if (!videoElement || videoElement.readyState !== 4) {
      return null;
    }

    try {
      const imageBase64 = convertImageToBase64(videoElement);
      const result = await detectEmotion(
        imageBase64,
        questionId,
        timeSpent,
        this.sessionId
      );
      return result;
    } catch (error) {
      console.error('Emotion detection error:', error);
      return null;
    }
  }

  startContinuousDetection(videoElement, questionId, onEmotionDetected, intervalMs = 3000) {
    if (this.isRunning) return;

    this.isRunning = true;
    let timeSpent = 0;

    this.interval = setInterval(async () => {
      timeSpent += intervalMs / 1000;
      const result = await this.captureAndDetect(videoElement, questionId, timeSpent);
      if (result && onEmotionDetected) {
        onEmotionDetected(result);
      }
    }, intervalMs);
  }

  stopContinuousDetection() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
  }
}