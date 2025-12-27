import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BookOpen, X } from 'lucide-react';

export const StoryModal = ({ chapter, onClose, onContinue }) => {
  if (!chapter) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full p-8 space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Chapter {chapter.chapter_id}</h2>
              <p className="text-lg text-gray-600">{chapter.title}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
          <p className="text-base leading-relaxed whitespace-pre-line">
            {chapter.intro}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Buildings to Restore:</h3>
          <div className="grid grid-cols-3 gap-3">
            {chapter.buildings?.map((buildingId) => (
              <div
                key={buildingId}
                className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-center"
              >
                <div className="text-2xl mb-1">🏢</div>
                <p className="text-xs capitalize">{buildingId.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            <p>Required XP: <strong>{chapter.required_xp}</strong></p>
            <p>Questions: <strong>{chapter.questions_to_complete}</strong></p>
          </div>
          <Button onClick={onContinue} size="lg">
            Begin Chapter
          </Button>
        </div>
      </Card>
    </div>
  );
};