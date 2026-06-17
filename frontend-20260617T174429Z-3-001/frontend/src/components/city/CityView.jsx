import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Building2, Sparkles } from 'lucide-react';

const BUILDING_ICONS = {
  data_center: '🏢',
  library: '📚',
  power_grid: '⚡',
  comm_tower: '📡',
  router_hub: '🔗',
  fiber_node: '💫',
  learning_center: '🧠',
  optimization_hub: '⚙️',
  ai_core: '🤖',
  core_system: '💎',
  city_hall: '🏛️',
  victory_monument: '🏆',
};

export const CityView = ({ restoredBuildings = [], totalBuildings = 12, className = '' }) => {
  const progress = (restoredBuildings.length / totalBuildings) * 100;

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">NeoCity Restoration</h3>
          </div>
          <Badge variant="secondary">
            {restoredBuildings.length}/{totalBuildings}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-full transition-all duration-1000 flex items-center justify-end pr-1"
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && <Sparkles className="w-3 h-3 text-white" />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 pt-4">
          {Object.entries(BUILDING_ICONS).map(([id, icon]) => {
            const isRestored = restoredBuildings.includes(id);
            return (
              <div
                key={id}
                className={`p-3 rounded-lg text-center transition-all duration-300 ${
                  isRestored
                    ? 'bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 scale-100'
                    : 'bg-gray-100 dark:bg-gray-800 opacity-40 grayscale'
                }`}
              >
                <div className="text-3xl mb-1">{icon}</div>
                <p className="text-xs capitalize font-medium">
                  {id.replace(/_/g, ' ')}
                </p>
                {isRestored && (
                  <div className="mt-1">
                    <Badge className="text-xs bg-green-500">✓</Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {progress === 100 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg text-center">
            <p className="font-bold text-lg">🎉 NeoCity Fully Restored! 🎉</p>
            <p className="text-sm mt-1">You are the hero of NeoCity!</p>
          </div>
        )}
      </div>
    </Card>
  );
};