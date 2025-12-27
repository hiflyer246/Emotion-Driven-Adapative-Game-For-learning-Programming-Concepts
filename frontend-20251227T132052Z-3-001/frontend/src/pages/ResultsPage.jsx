import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getSessionStats } from '../services/api';
import { Trophy, Star, Target, Clock, Home, RotateCcw } from 'lucide-react';
import { EMOTION_EMOJIS } from '../utils/constants';
import { calculateLevel } from '../utils/helpers';

export const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = location.state || {};
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!sessionId) {
        navigate('/');
        return;
      }

      try {
        const data = await getSessionStats(sessionId);
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading results...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-600">No results available</p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const level = calculateLevel(stats.total_xp);
  const accuracy = stats.questions_attempted > 0
    ? ((stats.questions_solved / stats.questions_attempted) * 100).toFixed(1)
    : 0;

  const emotionCounts = {};
  stats.emotion_data?.recent_emotions?.forEach(record => {
    emotionCounts[record.emotion] = (emotionCounts[record.emotion] || 0) + 1;
  });

  const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4 py-8">
          <Trophy className="w-20 h-20 mx-auto text-yellow-500" />
          <h1 className="text-4xl font-bold">Session Complete! 🎉</h1>
          <p className="text-xl text-gray-600">Great job solving those challenges!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="text-xl font-semibold">Your Performance</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Level Reached:</span>
                <Badge className="bg-blue-500 text-white text-lg px-3 py-1">
                  Level {level}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total XP:</span>
                <span className="text-2xl font-bold text-purple-600">{stats.total_xp}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Questions Solved:</span>
                <span className="text-xl font-semibold text-green-600">
                  {stats.questions_solved}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Questions Attempted:</span>
                <span className="text-xl font-semibold">{stats.questions_attempted}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Accuracy:</span>
                <span className="text-xl font-semibold text-blue-600">{accuracy}%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Hints Used:</span>
                <span className="text-xl font-semibold">{stats.hints_used}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              <h3 className="text-xl font-semibold">Emotion Analysis</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Emotion Checks:</span>
                <span className="text-xl font-semibold">{stats.emotion_data?.total_checks || 0}</span>
              </div>

              {dominantEmotion && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Most Common Emotion:</p>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{EMOTION_EMOJIS[dominantEmotion[0]]}</span>
                    <div>
                      <p className="text-lg font-semibold capitalize">{dominantEmotion[0]}</p>
                      <p className="text-sm text-gray-500">Detected {dominantEmotion[1]} times</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Emotion Distribution:</p>
                {Object.entries(emotionCounts).map(([emotion, count]) => {
                  const percentage = ((count / stats.emotion_data.total_checks) * 100).toFixed(0);
                  return (
                    <div key={emotion} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize flex items-center gap-1">
                          {EMOTION_EMOJIS[emotion]} {emotion}
                        </span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-green-500" />
            <h3 className="text-xl font-semibold">Achievements Unlocked</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {stats.questions_solved > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div className="text-3xl mb-2">🎯</div>
                <p className="font-semibold">First Blood</p>
                <p className="text-sm text-gray-600">Solved your first question</p>
              </div>
            )}

            {stats.questions_solved >= 3 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div className="text-3xl mb-2">🔥</div>
                <p className="font-semibold">On Fire</p>
                <p className="text-sm text-gray-600">Solved 3+ questions</p>
              </div>
            )}

            {stats.hints_used === 0 && stats.questions_solved > 0 && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <div className="text-3xl mb-2">🧠</div>
                <p className="font-semibold">Big Brain</p>
                <p className="text-sm text-gray-600">No hints used</p>
              </div>
            )}

            {level >= 2 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                <div className="text-3xl mb-2">⭐</div>
                <p className="font-semibold">Level Up</p>
                <p className="text-sm text-gray-600">Reached Level {level}</p>
              </div>
            )}

            {accuracy >= 80 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
                <div className="text-3xl mb-2">🎖️</div>
                <p className="font-semibold">Sharpshooter</p>
                <p className="text-sm text-gray-600">80%+ accuracy</p>
              </div>
            )}

            {stats.emotion_data?.total_checks >= 10 && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center">
                <div className="text-3xl mb-2">📸</div>
                <p className="font-semibold">Camera Ready</p>
                <p className="text-sm text-gray-600">10+ emotion checks</p>
              </div>
            )}
          </div>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/')} variant="outline" size="lg">
            <Home className="w-5 h-5 mr-2" />
            Go Home
          </Button>
          <Button onClick={() => window.location.reload()} size="lg">
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
};