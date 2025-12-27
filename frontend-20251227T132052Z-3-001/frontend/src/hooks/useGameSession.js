import { useState, useEffect } from 'react';
import { createSession, getSessionStats } from '../services/api';

export const useGameSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const [sessionStats, setSessionStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializeSession = async () => {
    setLoading(true);
    try {
      const data = await createSession();
      setSessionId(data.sessionId);
      setError(null);
    } catch (err) {
      setError('Failed to create session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    if (!sessionId) return;
    
    try {
      const stats = await getSessionStats(sessionId);
      setSessionStats(stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    if (sessionId) {
      refreshStats();
    }
  }, [sessionId]);

  return {
    sessionId,
    sessionStats,
    loading,
    error,
    initializeSession,
    refreshStats,
  };
};