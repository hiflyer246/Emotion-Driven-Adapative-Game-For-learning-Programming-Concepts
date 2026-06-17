import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GameBoard } from '../components/game/GameBoard';
import { WebcamCapture } from '../components/webcam/WebcamCapture';
import { EmotionIndicator } from '../components/webcam/EmotionIndicator';
import { EmotionDisplay } from '../components/game/EmotionDisplay';
import { CityView } from '../components/city/CityView';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useGameSession } from '../hooks/useGameSession';
import { useEmotionDetection } from '../hooks/useEmotionDetection';
import { useGame } from '../context/GameContext';
import { useStory } from '../hooks/useStory';
import { QuestionService } from '../services/questionService';
import { restoreBuilding } from '../services/storyService';
import { updateAnalytics, updateUserXP } from '../services/analyticsService';
import { Home, Loader, Building2, Trophy } from 'lucide-react';
import { Card } from '../components/ui/Card';

const questionService = new QuestionService();

export const GamePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { topic, difficulty, userId } = location.state || { topic: 'arrays', difficulty: 'easy' };
  
  const { sessionId, initializeSession, sessionStats, refreshStats } = useGameSession();
  const { loadQuestions, currentQuestion, questionsSolved, xp } = useGame();
  const { storyProgress, refreshStory } = useStory(userId);
  
  const [videoElement, setVideoElement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buildingRestored, setBuildingRestored] = useState(null);
  const [levelUp, setLevelUp] = useState(false);
  const [lastSyncedXP, setLastSyncedXP] = useState(0);
  
  const { currentEmotion, emotionData, hintRecommendation, clearHintRecommendation } = 
    useEmotionDetection(sessionId, currentQuestion?.id, videoElement);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await initializeSession();
        const questions = await questionService.loadQuestions(topic, difficulty, 5);
        loadQuestions(questions);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (sessionId) {
      const interval = setInterval(() => {
        refreshStats();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [sessionId]);

  // Sync XP to database whenever it changes
  useEffect(() => {
    const syncXP = async () => {
      if (!userId || xp === lastSyncedXP) return;

      try {
        // Update user's total XP in database
        await updateUserXP(userId, xp);
        setLastSyncedXP(xp);
        
        // Update local user state
        const newTotalXp = (user.total_xp || 0) + xp - lastSyncedXP;
        const newLevel = Math.floor(newTotalXp / 100) + 1;
        
        updateUser({ 
          total_xp: newTotalXp,
          current_level: newLevel
        });
      } catch (error) {
        console.error('Failed to sync XP:', error);
      }
    };

    syncXP();
  }, [xp, userId, lastSyncedXP, user]);

  // Check for building restoration and level up
  useEffect(() => {
    const checkProgress = async () => {
      if (!userId || !storyProgress) return;

      // Check if we should restore a building (every 2 questions solved)
      if (questionsSolved > 0 && questionsSolved % 2 === 0) {
        const currentChapter = storyProgress.chapter_data;
        if (currentChapter && currentChapter.buildings) {
          const unrestoredBuildings = currentChapter.buildings.filter(
            b => !storyProgress.city_buildings_restored.includes(b)
          );

          if (unrestoredBuildings.length > 0) {
            const buildingToRestore = unrestoredBuildings[0];
            try {
              const result = await restoreBuilding(userId, buildingToRestore);
              setBuildingRestored(result.building);
              await refreshStory();
              
              // Update user's city restoration progress
              updateUser({ city_restoration_progress: result.restoration_progress });
              
              setTimeout(() => setBuildingRestored(null), 5000);
            } catch (error) {
              console.error('Failed to restore building:', error);
            }
          }
        }
      }

      // Check for level up
      if (user && sessionStats) {
        const currentTotalXp = user.total_xp || 0;
        const currentLevel = Math.floor(currentTotalXp / 100) + 1;
        const userLevel = user.current_level || 1;

        if (currentLevel > userLevel) {
          setLevelUp(true);
          updateUser({ current_level: currentLevel });
          setTimeout(() => setLevelUp(false), 5000);
        }
      }
    };

    checkProgress();
  }, [questionsSolved, userId, storyProgress, user, sessionStats]);

  const handleHintAccepted = (hint) => {
    clearHintRecommendation();
  };

  const handleQuestionSolved = async (questionData) => {
    if (!userId) return;

    // Update analytics
    try {
      await updateAnalytics(userId, {
        correct: questionData.correct,
        timeTaken: questionData.timeTaken,
        emotion: currentEmotion,
      });
    } catch (error) {
      console.error('Failed to update analytics:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Code Runner</h1>
            <p className="text-gray-600">
              Level {user?.current_level || 1} • {user?.total_xp || 0} XP
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        {/* Building Restored Alert */}
        {buildingRestored && (
          <Alert variant="success" className="animate-in slide-in-from-top">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-green-500" />
              <div>
                <h4 className="font-semibold">Building Restored! 🎉</h4>
                <p className="text-sm">
                  {buildingRestored.icon} {buildingRestored.name} - {buildingRestored.restoration_text}
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Level Up Alert */}
        {levelUp && (
          <Alert className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-500 animate-in slide-in-from-top">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <div>
                <h4 className="font-bold text-lg">LEVEL UP! 🎊</h4>
                <p className="text-sm">
                  You've reached Level {user?.current_level}! Keep coding to unlock more!
                </p>
              </div>
            </div>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            <GameBoard
              sessionId={sessionId}
              hintRecommendation={hintRecommendation}
              onHintAccepted={handleHintAccepted}
              onQuestionSolved={handleQuestionSolved}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <WebcamCapture onVideoReady={setVideoElement} />
            
            <EmotionIndicator
              emotion={currentEmotion}
              confidence={emotionData?.confidence || 0}
            />

            <CityView
              restoredBuildings={storyProgress?.city_buildings_restored || []}
              totalBuildings={12}
            />

            {sessionStats && (
              <EmotionDisplay emotionHistory={sessionStats.emotion_data?.recent_emotions} />
            )}

            {/* Story Progress */}
            {storyProgress && (
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <h4 className="font-semibold mb-2">Current Chapter</h4>
                <p className="text-sm text-gray-600">
                  Chapter {storyProgress.current_chapter}: {storyProgress.chapter_data?.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Buildings restored: {storyProgress.city_buildings_restored.length} / {storyProgress.chapter_data?.buildings?.length || 0}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};