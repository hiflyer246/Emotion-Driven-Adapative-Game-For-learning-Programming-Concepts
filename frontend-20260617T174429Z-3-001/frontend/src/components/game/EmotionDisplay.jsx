import React from 'react';
import { Card } from '../ui/Card';
import { EMOTION_EMOJIS } from '../../utils/constants';
import { Activity } from 'lucide-react';

export const EmotionDisplay = ({ emotionHistory, className = '' }) => {
  if (!emotionHistory || emotionHistory.length === 0) {
    return null;
  }

  const recentEmotions = emotionHistory.slice(-10).reverse();

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <h4 className="text-sm font-semibold">Emotion History</h4>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {recentEmotions.map((record, idx) => (
            <div
              key={idx}
              className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs"
              title={new Date(record.timestamp).toLocaleTimeString()}
            >
              <span>{EMOTION_EMOJIS[record.emotion]}</span>
              <span className="capitalize">{record.emotion}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};