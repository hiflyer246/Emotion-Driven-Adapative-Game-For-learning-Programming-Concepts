import { useState, useEffect } from 'react';
import { getStoryProgress, getStoryChapter } from '../services/storyService';

export const useStory = (userId) => {
  const [storyProgress, setStoryProgress] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStory = async () => {
      if (!userId) return;

      try {
        const progress = await getStoryProgress(userId);
        setStoryProgress(progress);
        
        const chapter = await getStoryChapter(progress.current_chapter);
        setCurrentChapter({
          ...chapter,
          chapter_id: progress.current_chapter
        });
      } catch (error) {
        console.error('Failed to load story:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [userId]);

  const refreshStory = async () => {
    if (!userId) return;
    
    try {
      const progress = await getStoryProgress(userId);
      setStoryProgress(progress);
    } catch (error) {
      console.error('Failed to refresh story:', error);
    }
  };

  return {
    storyProgress,
    currentChapter,
    loading,
    refreshStory,
  };
};