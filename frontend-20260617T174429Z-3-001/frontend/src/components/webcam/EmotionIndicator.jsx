import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EMOTION_COLORS, EMOTION_EMOJIS } from '../../utils/constants';

export const EmotionIndicator = ({ emotion, confidence, className = '' }) => {
  const emotionColor = EMOTION_COLORS[emotion] || 'bg-gray-500';
  const emotionEmoji = EMOTION_EMOJIS[emotion] || '😐';
  
  // Convert confidence to percentage (1-100 range)
  const confidencePercentage = Math.min(Math.max(Math.round(confidence * 100), 1), 100);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${emotionColor} flex items-center justify-center text-2xl`}>
            {emotionEmoji}
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Emotion</p>
            <p className="text-lg font-semibold capitalize">{emotion}</p>
          </div>
        </div>
        {confidence > 0 && (
          <Badge variant="secondary">
            {confidencePercentage}% confident
          </Badge>
        )}
      </div>
    </Card>
  );
};