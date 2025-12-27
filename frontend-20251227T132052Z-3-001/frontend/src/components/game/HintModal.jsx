import React from 'react';
import { X, Lightbulb, AlertTriangle, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const HintModal = ({ hintData, onClose, onAccept }) => {
  if (!hintData) return null;

  const getActionIcon = (action) => {
    switch (action) {
      case 'provide_hint':
        return <Lightbulb className="w-6 h-6" />;
      case 'bonus_challenge':
        return <Zap className="w-6 h-6" />;
      case 'encouragement':
        return <Lightbulb className="w-6 h-6" />;
      default:
        return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const getActionTitle = (action) => {
    switch (action) {
      case 'provide_hint':
        return `Hint Level ${hintData.hint_level}`;
      case 'bonus_challenge':
        return 'Bonus Challenge Available!';
      case 'encouragement':
        return 'Keep Going!';
      default:
        return 'Notification';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {getActionIcon(hintData.action)}
            </div>
            <div>
              <h3 className="text-xl font-bold">{getActionTitle(hintData.action)}</h3>
              <p className="text-sm text-gray-500">{hintData.message}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          {hintData.action === 'provide_hint' && (
            <div className="space-y-3">
              <p className="text-sm leading-relaxed">{hintData.hint}</p>
              
              {hintData.common_mistakes && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold mb-2">Common Mistakes to Avoid:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {hintData.common_mistakes.map((mistake, idx) => (
                      <li key={idx}>{mistake}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {hintData.action === 'bonus_challenge' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500 text-white">
                  +{hintData.xp_bonus} XP
                </Badge>
              </div>
              <p className="text-sm leading-relaxed">{hintData.content}</p>
            </div>
          )}

          {hintData.action === 'encouragement' && (
            <p className="text-sm text-center text-gray-600">{hintData.message}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Dismiss
          </Button>
          {hintData.action === 'provide_hint' && (
            <Button onClick={onAccept}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Use Hint (-2 XP)
            </Button>
          )}
          {hintData.action === 'bonus_challenge' && (
            <Button onClick={onAccept} className="bg-yellow-500 hover:bg-yellow-600">
              <Zap className="w-4 h-4 mr-2" />
              Accept Challenge
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};