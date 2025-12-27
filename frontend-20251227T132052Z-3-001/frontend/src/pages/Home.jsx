import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStory } from '../hooks/useStory';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StoryModal } from '../components/story/StoryModal';
import { CityView } from '../components/city/CityView';
import { TOPICS, DIFFICULTIES } from '../utils/constants';
import { Code, Brain, Trophy, ArrowRight, LogOut, BarChart3 } from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { storyProgress, currentChapter, loading: storyLoading } = useStory(user?.id);
  
  const [selectedTopic, setSelectedTopic] = useState('arrays');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [showStoryModal, setShowStoryModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Show story modal when user first loads or starts new chapter
    if (currentChapter && storyProgress) {
      const hasSeenChapter = localStorage.getItem(`seen_chapter_${currentChapter.chapter_id}`);
      if (!hasSeenChapter) {
        setShowStoryModal(true);
      }
    }
  }, [currentChapter, storyProgress]);

  const handleStart = () => {
    navigate('/game', {
      state: { 
        topic: selectedTopic, 
        difficulty: selectedDifficulty,
        userId: user?.id 
      },
    });
  };

  const handleStoryClose = () => {
    if (currentChapter) {
      localStorage.setItem(`seen_chapter_${currentChapter.chapter_id}`, 'true');
    }
    setShowStoryModal(false);
  };

  const handleStoryContinue = () => {
    handleStoryClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (storyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="w-12 h-12 text-blue-500" />
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Code Runner
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Welcome back, {user?.username}!
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/analytics')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <p className="text-sm opacity-90">Level</p>
            <p className="text-3xl font-bold">{user?.current_level || 1}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <p className="text-sm opacity-90">Total XP</p>
            <p className="text-3xl font-bold">{user?.total_xp || 0}</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <p className="text-sm opacity-90">City Restored</p>
            <p className="text-3xl font-bold">{user?.city_restoration_progress || 0}%</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
            <p className="text-sm opacity-90">Achievements</p>
            <p className="text-3xl font-bold">{user?.achievements?.length || 0}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Chapter Info */}
            {currentChapter && (
              <Card className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Chapter {currentChapter.chapter_id}</h3>
                    <p className="text-lg opacity-90 mt-1">{currentChapter.title}</p>
                    <p className="text-sm opacity-75 mt-2">
                      {currentChapter.questions_to_complete} challenges remaining
                    </p>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowStoryModal(true)}
                  >
                    View Story
                  </Button>
                </div>
              </Card>
            )}

            <Card className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <h2 className="text-2xl font-semibold">Start Your Adventure</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-3xl mb-2">📸</div>
                    <h3 className="font-semibold mb-1">Emotion Detection</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your webcam tracks emotions in real-time
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-3xl mb-2">💡</div>
                    <h3 className="font-semibold mb-1">Adaptive Hints</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get help when frustrated or confused
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-3xl mb-2">🎯</div>
                    <h3 className="font-semibold mb-1">Restore City</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Each solve rebuilds NeoCity
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Topic:</label>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((topic) => (
                      <Badge
                        key={topic}
                        onClick={() => setSelectedTopic(topic)}
                        className={`cursor-pointer capitalize ${
                          selectedTopic === topic
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Select Difficulty:</label>
                  <div className="flex gap-2">
                    {Object.values(DIFFICULTIES).map((difficulty) => (
                      <Badge
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className={`cursor-pointer capitalize ${
                          selectedDifficulty === difficulty
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {difficulty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleStart} className="w-full" size="lg">
                <Trophy className="w-5 h-5 mr-2" />
                Start Challenge
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Card>
          </div>

          {/* Sidebar - City View */}
          <div>
            <CityView
              restoredBuildings={storyProgress?.city_buildings_restored || []}
              totalBuildings={12}
            />
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>🎮 Solve puzzles • 😊 Track emotions • 🏗️ Rebuild NeoCity • 🚀 Level up!</p>
        </div>
      </div>

      {showStoryModal && currentChapter && (
        <StoryModal
          chapter={currentChapter}
          onClose={handleStoryClose}
          onContinue={handleStoryContinue}
        />
      )}
    </div>
  );
};