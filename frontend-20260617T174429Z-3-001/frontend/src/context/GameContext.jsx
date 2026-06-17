import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [questionsSolved, setQuestionsSolved] = useState(0);

  const loadQuestions = (questionList) => {
    setQuestions(questionList);
    setCurrentQuestionIndex(0);
    if (questionList.length > 0) {
      setCurrentQuestion(questionList[0]);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setUserAnswer('');
      setTimeSpent(0);
      return true;
    }
    return false;
  };

  const updateXp = (amount) => {
    const newXp = xp + amount;
    setXp(newXp);
    setLevel(Math.floor(newXp / 100) + 1);
  };

  const incrementSolved = () => {
    setQuestionsSolved(prev => prev + 1);
  };

  const value = {
    currentQuestion,
    questions,
    currentQuestionIndex,
    userAnswer,
    timeSpent,
    xp,
    level,
    questionsSolved,
    setCurrentQuestion,
    setUserAnswer,
    setTimeSpent,
    loadQuestions,
    nextQuestion,
    updateXp,
    incrementSolved,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};