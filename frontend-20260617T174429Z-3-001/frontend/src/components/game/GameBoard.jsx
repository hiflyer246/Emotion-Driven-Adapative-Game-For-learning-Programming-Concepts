import React, { useState, useEffect, useRef } from 'react';
import { QuestionCard } from './QuestionCard';
import { HintModal } from './HintModal';
import { ProgressBar } from './ProgressBar';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useGame } from '../../context/GameContext';
import { submitAnswer } from '../../services/api';
import { Send, ArrowRight, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';


export const GameBoard = ({ sessionId, hintRecommendation, onHintAccepted, onQuestionSolved }) => {
  const {
    currentQuestion,
    userAnswer,
    setUserAnswer,
    timeSpent,
    setTimeSpent,
    xp,
    questionsSolved,
    questions,
    updateXp,
    incrementSolved,
    nextQuestion,
  } = useGame();

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [dismissedHints, setDismissedHints] = useState(new Set());
  const lastHintRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, setTimeSpent]);

  useEffect(() => {
    if (hintRecommendation && hintRecommendation.action !== 'none') {
      const hintKey = `${currentQuestion?.id}-${hintRecommendation.action}-${hintRecommendation.hint_level || ''}`;
      
      if (!dismissedHints.has(hintKey) && lastHintRef.current !== hintKey) {
        setShowHint(true);
        lastHintRef.current = hintKey;
      }
    }
  }, [hintRecommendation, currentQuestion, dismissedHints]);

  useEffect(() => {
    setDismissedHints(new Set());
    lastHintRef.current = null;
  }, [currentQuestion?.id]);

  const handleSubmit = async () => {
    if (!userAnswer.trim() || !currentQuestion || !sessionId) return;
  
    setSubmitting(true);
    try {
      const result = await submitAnswer(
        sessionId,
        currentQuestion.id,
        userAnswer,
        timeSpent
      );
  
      setFeedback(result);
      if (result.correct) {
        updateXp(result.xp_earned);
        incrementSolved();
        
        // Callback for analytics - FIXED HERE
        if (onQuestionSolved) {
          onQuestionSolved({
            correct: true,
            timeTaken: timeSpent, // Changed from timeTaken to match what we're using
            questionId: currentQuestion.id,
          });
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      setFeedback({
        correct: false,
        explanation: 'Failed to submit answer. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    const hasNext = nextQuestion();
    if (hasNext) {
      setFeedback(null);
      setUserAnswer('');
    } else {
      // All questions completed - show completion message
      setFeedback({
        correct: true,
        explanation: 'Congratulations! You have completed all questions in this session! 🎉',
        all_complete: true
      });
    }
  };

  const handleHintDismiss = () => {
    if (hintRecommendation && currentQuestion) {
      const hintKey = `${currentQuestion.id}-${hintRecommendation.action}-${hintRecommendation.hint_level || ''}`;
      setDismissedHints(prev => new Set([...prev, hintKey]));
    }
    setShowHint(false);
  };

  const handleHintAccept = () => {
    if (hintRecommendation && currentQuestion) {
      const hintKey = `${currentQuestion.id}-${hintRecommendation.action}-${hintRecommendation.hint_level || ''}`;
      setDismissedHints(prev => new Set([...prev, hintKey]));
    }
    setShowHint(false);
    if (onHintAccepted) {
      onHintAccepted(hintRecommendation);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No questions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressBar
        xp={xp}
        questionsSolved={questionsSolved}
        totalQuestions={questions.length}
      />

      <QuestionCard question={currentQuestion} timeSpent={timeSpent} />

      {!feedback && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Answer:</label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Write your solution here..."
              disabled={submitting}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!userAnswer.trim() || submitting}
            className="w-full"
          >
            {submitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      )}

      {feedback && (
  <div className="space-y-4">
    {feedback.correct ? (
      // Success Feedback
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-500">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                Correct! 🎉
              </h3>
              {!feedback.all_complete && (
                <div className="flex items-center gap-4 mb-3">
                  <Badge className="bg-purple-500 text-white text-lg px-4 py-1">
                    +{feedback.xp_earned} XP
                  </Badge>
                  {feedback.hints_used > 0 && (
                    <Badge variant="secondary" className="text-sm">
                      {feedback.hints_used} hint{feedback.hints_used > 1 ? 's' : ''} used
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
              💡 Explanation:
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {feedback.explanation}
            </p>
          </div>

          {feedback.correct && !feedback.all_complete && (
            <Button onClick={handleNextQuestion} className="w-full" size="lg">
              <ArrowRight className="w-5 h-5 mr-2" />
              Next Challenge
            </Button>
          )}

          {feedback.all_complete && (
            <Button onClick={() => window.location.href = '/'} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" size="lg">
              <Trophy className="w-5 h-5 mr-2" />
              Complete Session
            </Button>
          )}
        </div>
      </Card>
    ) : (
      // Error Feedback
      <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-500">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">
                Not Quite Right
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't worry! Every mistake is a learning opportunity.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-red-200 dark:border-red-800">
            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">
              💭 Feedback:
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {feedback.explanation}
            </p>
          </div>

          <Button onClick={() => setFeedback(null)} variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" size="lg">
            Try Again
          </Button>
        </div>
      </Card>
    )}
  </div>
)}
      

      {showHint && (
        <HintModal
          hintData={hintRecommendation}
          onClose={handleHintDismiss}
          onAccept={handleHintAccept}
        />
      )}
    </div>
  );
};