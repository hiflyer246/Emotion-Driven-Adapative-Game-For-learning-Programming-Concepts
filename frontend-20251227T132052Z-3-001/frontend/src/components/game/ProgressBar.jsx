import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Trophy, Star, Target } from 'lucide-react';
import { calculateLevel, getXpForNextLevel } from '../../utils/helpers';

export const ProgressBar = ({ xp, questionsSolved, totalQuestions, className = '' }) => {
  const level = calculateLevel(xp);
  const xpForNext = getXpForNextLevel(xp);
  const currentLevelXp = xp % 100;
  const progressPercent = (currentLevelXp / 100) * 100;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-bold">Level {level}</span>
          </div>
          <Badge variant="secondary">
            <Star className="w-3 h-3 mr-1" />
            {xp} XP
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{currentLevelXp} / 100 XP</span>
            <span>{xpForNext} to next level</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Target className="w-4 h-4 text-green-500" />
          <span className="text-gray-600">
            Progress: {questionsSolved} / {totalQuestions} questions solved
          </span>
        </div>
      </div>
    </Card>
  );
};