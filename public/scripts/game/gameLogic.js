import { EventEmitter } from '../utils/helpers.js';

export class Game extends EventEmitter {
    constructor(difficulty = 'medium', category = 'random') {
        super();
        this.difficulty = difficulty;
        this.category = category;
        this.word = '';
        this.hint = '';
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.maxWrongGuesses = this.getMaxWrongGuesses();
        this.score = 0;
        this.baseScore = 100;
        this.hintUsed = false;
        this.startTime = null;
        this.endTime = null;
        this.isGameOverFlag = false;
    }

    getMaxWrongGuesses() {
        switch (this.difficulty) {
            case 'easy':
                return 8;
            case 'medium':
                return 6;
            case 'hard':
                return 4;
            default:
                return 6;
        }
    }

    startGame(word, hint, category) {
        this.word = word.toUpperCase();
        this.hint = hint;
        this.category = category;
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.score = 0;
        this.hintUsed = false;
        this.startTime = Date.now();
        this.endTime = null;
        this.isGameOverFlag = false;

        this.emit('gameStarted', {
            word: this.word,
            hint: this.hint,
            category: this.category,
            difficulty: this.difficulty,
            maxWrongGuesses: this.maxWrongGuesses
        });
    }

    makeGuess(letter) {
        if (this.isGameOverFlag) {
            return { valid: false, message: 'Game is over' };
        }

        letter = letter.toUpperCase();

        if (this.guessedLetters.includes(letter)) {
            return { valid: false, message: 'Letter already guessed' };
        }

        if (!/^[A-Z]$/.test(letter)) {
            return { valid: false, message: 'Invalid letter' };
        }

        this.guessedLetters.push(letter);
        const correct = this.word.includes(letter);

        if (!correct) {
            this.wrongGuesses++;
        }

        const guessData = {
            letter,
            correct,
            wrongGuesses: this.wrongGuesses,
            maxWrongGuesses: this.maxWrongGuesses,
            guessedLetters: [...this.guessedLetters]
        };

        this.emit('guessMade', guessData);

        if (this.checkGameOver()) {
            this.endGame();
        }

        return { valid: true, correct, guessData };
    }

    checkGameOver() {
        // Check if all letters have been guessed (win)
        const wordLetters = new Set(this.word.split(''));
        const guessedWordLetters = new Set(this.guessedLetters.filter(letter => wordLetters.has(letter)));
        
        if (guessedWordLetters.size === wordLetters.size) {
            return true;
        }

        // Check if max wrong guesses reached (lose)
        if (this.wrongGuesses >= this.maxWrongGuesses) {
            return true;
        }

        return false;
    }

    isGameOver() {
        return this.isGameOverFlag;
    }

    hasWon() {
        if (!this.isGameOverFlag) return false;
        
        const wordLetters = new Set(this.word.split(''));
        const guessedWordLetters = new Set(this.guessedLetters.filter(letter => wordLetters.has(letter)));
        
        return guessedWordLetters.size === wordLetters.size;
    }

    endGame() {
        this.endTime = Date.now();
        this.isGameOverFlag = true;
        
        const won = this.hasWon();
        const score = this.calculateScore();
        
        const result = {
            won,
            word: this.word,
            score,
            baseScore: this.baseScore,
            timeBonus: this.calculateTimeBonus(),
            difficultyMultiplier: this.getDifficultyMultiplier(),
            wrongGuesses: this.wrongGuesses,
            hintUsed: this.hintUsed,
            timeTaken: this.endTime - this.startTime
        };

        this.emit('gameEnded', result);
        return result;
    }

    calculateScore() {
        if (!this.isGameOverFlag) return 0;

        let score = this.baseScore;
        
        // Apply difficulty multiplier
        score *= this.getDifficultyMultiplier();
        
        // Add time bonus
        score += this.calculateTimeBonus();
        
        // Subtract penalty for wrong guesses
        score -= this.wrongGuesses * 10;
        
        // Subtract penalty for using hint
        if (this.hintUsed) {
            score -= 25;
        }
        
        // Ensure score is not negative
        this.score = Math.max(0, Math.round(score));
        return this.score;
    }

    getDifficultyMultiplier() {
        switch (this.difficulty) {
            case 'easy':
                return 1;
            case 'medium':
                return 1.5;
            case 'hard':
                return 2;
            default:
                return 1;
        }
    }

    calculateTimeBonus() {
        if (!this.startTime || !this.endTime) return 0;
        
        const timeInSeconds = (this.endTime - this.startTime) / 1000;
        const maxTimeBonus = 50;
        
        // Calculate bonus based on how quickly the game was completed
        if (timeInSeconds < 30) {
            return maxTimeBonus;
        } else if (timeInSeconds < 60) {
            return Math.round(maxTimeBonus * 0.75);
        } else if (timeInSeconds < 120) {
            return Math.round(maxTimeBonus * 0.5);
        } else if (timeInSeconds < 180) {
            return Math.round(maxTimeBonus * 0.25);
        } else {
            return 0;
        }
    }

    useHint() {
        if (!this.hint || this.hintUsed) {
            return false;
        }
        
        this.hintUsed = true;
        this.emit('hintUsed', { hint: this.hint });
        return true;
    }

    getRemainingLetters() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        return alphabet.filter(letter => !this.guessedLetters.includes(letter));
    }

    getWordProgress() {
        return this.word.split('').map(letter => ({
            letter,
            revealed: this.guessedLetters.includes(letter)
        }));
    }

    getGameState() {
        return {
            word: this.word,
            hint: this.hint,
            category: this.category,
            difficulty: this.difficulty,
            guessedLetters: [...this.guessedLetters],
            wrongGuesses: this.wrongGuesses,
            maxWrongGuesses: this.maxWrongGuesses,
            score: this.score,
            hintUsed: this.hintUsed,
            isGameOver: this.isGameOverFlag,
            hasWon: this.hasWon(),
            wordProgress: this.getWordProgress(),
            remainingLetters: this.getRemainingLetters()
        };
    }
}

export default Game;