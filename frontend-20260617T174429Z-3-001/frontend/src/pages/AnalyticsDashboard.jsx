import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserAnalytics, getLeaderboard } from '../services/analyticsService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  BarChart3,
  TrendingUp,
  Trophy,
  Target,
  Clock,
  Zap,
  Award,
  Users,
  Home,
  Brain,
  Flame
} from 'lucide-react';
import { EMOTION_EMOJIS } from '../utils/constants';

export const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const [analyticsData, leaderboardData] = await Promise.all([
          getUserAnalytics(user.id),
          getLeaderboard(10)
        ]);
        setAnalytics(analyticsData);
        setLeaderboard(leaderboardData.leaderboard);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 animate-pulse mx-auto text-blue-500" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const { user_info, performance, emotion_analysis, difficulty_performance, streak, achievements } = analytics;

  // Calculate emotion percentages
  const totalEmotionChecks = Object.values(emotion_analysis).reduce((a, b) => a + b, 0);
  const emotionPercentages = Object.entries(emotion_analysis).map(([emotion, count]) => ({
    emotion,
    count,
    percentage: totalEmotionChecks > 0 ? (count / totalEmotionChecks * 100).toFixed(1) : 0
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your coding journey</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        {/* User Overview Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-3xl font-bold text-blue-600">{user_info.current_level}</p>
              </div>
              <Trophy className="w-10 h-10 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total XP</p>
                <p className="text-3xl font-bold text-purple-600">{user_info.total_xp}</p>
              </div>
              <Zap className="w-10 h-10 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-3xl font-bold text-green-600">{performance.accuracy}%</p>
              </div>
              <Target className="w-10 h-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-3xl font-bold text-orange-600">{streak}</p>
              </div>
              <Flame className="w-10 h-10 text-orange-500" />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Performance Stats */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Performance Overview</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Questions Attempted</span>
                    <span className="text-2xl font-bold">{performance.total_questions_attempted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Questions Solved</span>
                    <span className="text-2xl font-bold text-green-600">{performance.total_questions_solved}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <Badge className="bg-green-500 text-white text-lg">
                      {performance.accuracy}%
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Time</span>
                    <span className="text-2xl font-bold">
                      {Math.floor(performance.total_time_spent / 60)}m
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Time/Question</span>
                    <span className="text-2xl font-bold">
                      {Math.floor(performance.average_time_per_question)}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">City Restored</span>
                    <Badge className="bg-blue-500 text-white text-lg">
                      {user_info.city_restoration}%
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Emotion Analysis */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-semibold">Emotion Analysis</h2>
              </div>

              {emotionPercentages.length > 0 ? (
                <div className="space-y-4">
                  {emotionPercentages.map(({ emotion, count, percentage }) => (
                    <div key={emotion} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{EMOTION_EMOJIS[emotion]}</span>
                          <span className="capitalize font-medium">{emotion}</span>
                        </div>
                        <span className="text-gray-600">
                          {count} times ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">No emotion data yet</p>
              )}
            </Card>

            {/* Difficulty Performance */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-green-500" />
                <h2 className="text-xl font-semibold">Performance by Difficulty</h2>
              </div>

              <div className="space-y-4">
                {Object.entries(difficulty_performance).map(([difficulty, accuracy]) => (
                  <div key={difficulty} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="capitalize font-medium">{difficulty}</span>
                      <Badge variant={
                        accuracy >= 80 ? 'success' : 
                        accuracy >= 60 ? 'warning' : 
                        'danger'
                      }>
                        {accuracy.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${
                          accuracy >= 80 ? 'bg-green-500' :
                          accuracy >= 60 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-500" />
                <h2 className="text-xl font-semibold">Achievements</h2>
              </div>

              {achievements && achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement}
                      className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🏆</span>
                        <span className="font-medium capitalize">
                          {achievement.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No achievements yet. Keep coding!
                </p>
              )}
            </Card>

            {/* Leaderboard */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-semibold">Leaderboard</h2>
              </div>

              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      entry.username === user_info.username
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500 text-white' :
                        entry.rank === 2 ? 'bg-gray-400 text-white' :
                        entry.rank === 3 ? 'bg-orange-600 text-white' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{entry.username}</p>
                        <p className="text-xs text-gray-600">Level {entry.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">{entry.xp}</p>
                      <p className="text-xs text-gray-600">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Most Common Emotion:</span>
                  <span className="font-semibold capitalize flex items-center gap-1">
                    {emotionPercentages[0]?.emotion && (
                      <>
                        {EMOTION_EMOJIS[emotionPercentages[0].emotion]}
                        {emotionPercentages[0].emotion}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Difficulty:</span>
                  <span className="font-semibold capitalize">
                    {Object.entries(difficulty_performance).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Streak:</span>
                  <span className="font-semibold text-orange-600">{streak} days 🔥</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};