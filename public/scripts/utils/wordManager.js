import { Utils } from './helpers.js';

export class WordManager {
    constructor() {
        this.wordCategories = null;
        this.loaded = false;
        this.loadWords();
    }

    async loadWords() {
        try {
            const response = await fetch('/data/wordCategories.json');
            const data = await response.json();
            this.wordCategories = data.categories;
            this.loaded = true;
            console.log('Word categories loaded successfully');
        } catch (error) {
            console.error('Error loading word categories:', error);
            // Fallback to basic word list if loading fails
            this.loadFallbackWords();
        }
    }

    loadFallbackWords() {
        // Basic fallback word list in case the JSON file fails to load
        this.wordCategories = [
            {
                id: 'animals',
                name: 'Animals',
                words: [
                    { word: 'CAT', hint: 'Common household pet', difficulty: 'easy' },
                    { word: 'DOG', hint: 'Man\'s best friend', difficulty: 'easy' },
                    { word: 'ELEPHANT', hint: 'Large animal with trunk', difficulty: 'medium' },
                    { word: 'GIRAFFE', hint: 'Tallest animal', difficulty: 'medium' }
                ]
            },
            {
                id: 'countries',
                name: 'Countries',
                words: [
                    { word: 'USA', hint: 'United States of America', difficulty: 'easy' },
                    { word: 'FRANCE', hint: 'Country with Eiffel Tower', difficulty: 'easy' },
                    { word: 'BRAZIL', hint: 'Largest South American country', difficulty: 'medium' },
                    { word: 'AUSTRALIA', hint: 'Country and continent', difficulty: 'medium' }
                ]
            },
            {
                id: 'technology',
                name: 'Technology',
                words: [
                    { word: 'COMPUTER', hint: 'Electronic device for processing data', difficulty: 'easy' },
                    { word: 'INTERNET', hint: 'Global network', difficulty: 'easy' },
                    { word: 'ALGORITHM', hint: 'Step-by-step procedure', difficulty: 'hard' },
                    { word: 'BLOCKCHAIN', hint: 'Distributed ledger technology', difficulty: 'hard' }
                ]
            }
        ];
        this.loaded = true;
    }

    async getRandomWord(category = 'random', difficulty = 'medium') {
        // Ensure words are loaded
        if (!this.loaded) {
            await this.waitForWordsLoaded();
        }

        let availableWords = [];

        // Get words based on category
        if (category === 'random') {
            // Get all words from all categories
            this.wordCategories.forEach(cat => {
                availableWords = availableWords.concat(cat.words);
            });
        } else {
            // Get words from specific category
            const categoryData = this.wordCategories.find(cat => cat.id === category);
            if (categoryData) {
                availableWords = categoryData.words;
            }
        }

        // Filter by difficulty
        if (difficulty !== 'random') {
            availableWords = availableWords.filter(word => word.difficulty === difficulty);
        }

        // If no words found, try to get any words
        if (availableWords.length === 0) {
            console.warn(`No words found for category: ${category}, difficulty: ${difficulty}`);
            // Get all words as fallback
            this.wordCategories.forEach(cat => {
                availableWords = availableWords.concat(cat.words);
            });
        }

        // Select random word
        if (availableWords.length > 0) {
            const selectedWord = Utils.randomItem(availableWords);
            return {
                word: selectedWord.word,
                hint: selectedWord.hint,
                category: category === 'random' ? this.getCategoryForWord(selectedWord.word) : category,
                difficulty: selectedWord.difficulty
            };
        }

        // Final fallback
        return {
            word: 'HANGMAN',
            hint: 'The name of this game',
            category: 'random',
            difficulty: 'medium'
        };
    }

    getCategoryForWord(word) {
        for (const category of this.wordCategories) {
            const foundWord = category.words.find(w => w.word === word);
            if (foundWord) {
                return category.id;
            }
        }
        return 'random';
    }

    async waitForWordsLoaded() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait
        
        return new Promise((resolve, reject) => {
            const checkLoaded = () => {
                attempts++;
                if (this.loaded) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Timeout waiting for words to load'));
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            checkLoaded();
        });
    }

    getCategories() {
        if (!this.loaded) return [];
        
        return this.wordCategories.map(category => ({
            id: category.id,
            name: category.name,
            wordCount: category.words.length
        }));
    }

    getWordsByCategory(categoryId) {
        if (!this.loaded) return [];
        
        const category = this.wordCategories.find(cat => cat.id === categoryId);
        return category ? category.words : [];
    }

    getWordsByDifficulty(difficulty) {
        if (!this.loaded) return [];
        
        const words = [];
        this.wordCategories.forEach(category => {
            words.push(...category.words.filter(word => word.difficulty === difficulty));
        });
        return words;
    }

    searchWords(query, category = 'all', difficulty = 'all') {
        if (!this.loaded) return [];
        
        let words = [];
        
        // Filter by category
        if (category === 'all') {
            this.wordCategories.forEach(cat => {
                words.push(...cat.words);
            });
        } else {
            const categoryData = this.wordCategories.find(cat => cat.id === category);
            if (categoryData) {
                words = categoryData.words;
            }
        }
        
        // Filter by difficulty
        if (difficulty !== 'all') {
            words = words.filter(word => word.difficulty === difficulty);
        }
        
        // Filter by query
        if (query) {
            const lowerQuery = query.toLowerCase();
            words = words.filter(word => 
                word.word.toLowerCase().includes(lowerQuery) ||
                word.hint.toLowerCase().includes(lowerQuery)
            );
        }
        
        return words;
    }

    addCustomWord(word, hint, category, difficulty = 'medium') {
        if (!this.loaded) return false;
        
        // Find or create category
        let categoryData = this.wordCategories.find(cat => cat.id === category);
        if (!categoryData) {
            categoryData = {
                id: category,
                name: Utils.capitalize(category),
                words: []
            };
            this.wordCategories.push(categoryData);
        }
        
        // Check if word already exists
        if (categoryData.words.find(w => w.word === word.toUpperCase())) {
            return false;
        }
        
        // Add word
        categoryData.words.push({
            word: word.toUpperCase(),
            hint: hint,
            difficulty: difficulty
        });
        
        return true;
    }

    removeWord(word, category) {
        if (!this.loaded) return false;
        
        const categoryData = this.wordCategories.find(cat => cat.id === category);
        if (!categoryData) return false;
        
        const wordIndex = categoryData.words.findIndex(w => w.word === word.toUpperCase());
        if (wordIndex === -1) return false;
        
        categoryData.words.splice(wordIndex, 1);
        return true;
    }

    validateWord(word) {
        if (!word || typeof word !== 'string') {
            return { valid: false, reason: 'Word must be a non-empty string' };
        }
        
        const trimmedWord = word.trim().toUpperCase();
        
        if (trimmedWord.length < 2) {
            return { valid: false, reason: 'Word must be at least 2 characters long' };
        }
        
        if (trimmedWord.length > 20) {
            return { valid: false, reason: 'Word must be no more than 20 characters long' };
        }
        
        if (!/^[A-Z]+$/.test(trimmedWord)) {
            return { valid: false, reason: 'Word must contain only letters' };
        }
        
        return { valid: true, word: trimmedWord };
    }

    validateHint(hint) {
        if (!hint || typeof hint !== 'string') {
            return { valid: false, reason: 'Hint must be a non-empty string' };
        }
        
        const trimmedHint = hint.trim();
        
        if (trimmedHint.length < 5) {
            return { valid: false, reason: 'Hint must be at least 5 characters long' };
        }
        
        if (trimmedHint.length > 100) {
            return { valid: false, reason: 'Hint must be no more than 100 characters long' };
        }
        
        return { valid: true, hint: trimmedHint };
    }

    getWordStats() {
        if (!this.loaded) return null;
        
        const stats = {
            totalWords: 0,
            categories: this.wordCategories.length,
            difficultyDistribution: {
                easy: 0,
                medium: 0,
                hard: 0
            },
            categoryStats: {}
        };
        
        this.wordCategories.forEach(category => {
            stats.totalWords += category.words.length;
            
            category.words.forEach(word => {
                stats.difficultyDistribution[word.difficulty]++;
            });
            
            stats.categoryStats[category.id] = {
                name: category.name,
                wordCount: category.words.length,
                difficultyDistribution: {
                    easy: category.words.filter(w => w.difficulty === 'easy').length,
                    medium: category.words.filter(w => w.difficulty === 'medium').length,
                    hard: category.words.filter(w => w.difficulty === 'hard').length
                }
            };
        });
        
        return stats;
    }

    exportWords() {
        if (!this.loaded) return null;
        
        return JSON.stringify({
            categories: this.wordCategories,
            exportedAt: new Date().toISOString()
        });
    }

    importWords(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.categories && Array.isArray(data.categories)) {
                this.wordCategories = data.categories;
                this.loaded = true;
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error importing words:', error);
            return false;
        }
    }
}

export default WordManager;