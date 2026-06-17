import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { getDifficultyColor } from '../../utils/helpers';
import { Clock, Code } from 'lucide-react';

export const QuestionCard = ({ question, timeSpent, className = '' }) => {
  if (!question) return null;

  const difficultyColor = getDifficultyColor(question.difficulty);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={difficultyColor}>
                {question.difficulty}
              </Badge>
              <Badge variant="secondary">{question.topic}</Badge>
            </div>
            <h2 className="text-xl font-bold">{question.question}</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{Math.floor(timeSpent)}s</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Code className="w-4 h-4" />
            Example:
          </div>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-gray-600">Input:</span>
              <code className="ml-2 bg-white dark:bg-slate-800 px-2 py-1 rounded">
                {question.example_input}
              </code>
            </div>
            <div>
              <span className="text-gray-600">Output:</span>
              <code className="ml-2 bg-white dark:bg-slate-800 px-2 py-1 rounded">
                {question.example_output}
              </code>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 flex gap-4">
          <span>Time: {question.time_complexity}</span>
          <span>Space: {question.space_complexity}</span>
        </div>
      </div>
    </Card>
  );
};