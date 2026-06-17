import { generateQuestions, getQuestions } from './api';

export class QuestionService {
  constructor() {
    this.cache = new Map();
  }

  async loadQuestions(topic, difficulty, count = 5) {
    const cacheKey = `${topic}_${difficulty}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      let result = await getQuestions(topic, difficulty, count);
      
      if (result.count === 0) {
        console.log('No questions found, generating new ones...');
        result = await generateQuestions(topic, difficulty, count);
      }

      this.cache.set(cacheKey, result.questions);
      return result.questions;
    } catch (error) {
      console.error('Error loading questions:', error);
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
  }
}