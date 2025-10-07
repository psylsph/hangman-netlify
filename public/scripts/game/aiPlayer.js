export class AIPlayer {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.guessedLetters = [];
        this.wordPattern = [];
        this.possibleWords = [];
        this.letterFrequency = {};
        this.vowels = ['A', 'E', 'I', 'O', 'U'];
        this.commonConsonants = ['R', 'S', 'T', 'L', 'N', 'C', 'D', 'G', 'H', 'M', 'P', 'B'];
        this.initializeLetterFrequency();
    }

    initializeLetterFrequency() {
        // Common letter frequency in English (approximate)
        const frequencyOrder = [
            'E', 'T', 'A', 'O', 'I', 'N', 'S', 'H', 'R', 'D', 'L', 'U',
            'C', 'M', 'W', 'F', 'G', 'Y', 'P', 'B', 'V', 'K', 'J', 'X', 'Q', 'Z'
        ];
        
        frequencyOrder.forEach((letter, index) => {
            this.letterFrequency[letter] = frequencyOrder.length - index;
        });
    }

    makeGuess(game) {
        // Update our knowledge of the game state
        this.updateGameState(game);
        
        let guess;
        
        switch (this.difficulty) {
            case 'easy':
                guess = this.makeEasyGuess();
                break;
            case 'medium':
                guess = this.makeMediumGuess();
                break;
            case 'hard':
                guess = this.makeHardGuess(game);
                break;
            default:
                guess = this.makeMediumGuess();
        }
        
        if (guess) {
            this.guessedLetters.push(guess);
            return guess;
        }
        
        // Fallback to random guess if something goes wrong
        return this.makeRandomGuess();
    }

    updateGameState(game) {
        // Update the word pattern based on current game state
        this.wordPattern = game.getWordProgress().map(item => item.revealed ? item.letter : '_');
        
        // Update guessed letters
        this.guessedLetters = [...game.guessedLetters];
    }

    makeEasyGuess() {
        // Easy AI: prioritizes common letters with some randomness
        
        // First, try to guess vowels if none have been guessed
        const unguessedVowels = this.vowels.filter(vowel => !this.guessedLetters.includes(vowel));
        
        if (unguessedVowels.length > 0 && Math.random() < 0.7) {
            return unguessedVowels[Math.floor(Math.random() * unguessedVowels.length)];
        }
        
        // Try common consonants
        const unguessedCommon = this.commonConsonants.filter(consonant => !this.guessedLetters.includes(consonant));
        
        if (unguessedCommon.length > 0 && Math.random() < 0.8) {
            return unguessedCommon[Math.floor(Math.random() * unguessedCommon.length)];
        }
        
        // Otherwise, make a random guess from frequency list
        return this.makeRandomGuess();
    }

    makeMediumGuess() {
        // Medium AI: uses letter frequency but with some strategic thinking
        
        // If we have some revealed letters, try to find patterns
        const revealedLetters = this.wordPattern.filter(letter => letter !== '_');
        
        if (revealedLetters.length > 0) {
            // Try letters that commonly appear with revealed letters
            const strategicGuess = this.makeStrategicGuess();
            if (strategicGuess) {
                return strategicGuess;
            }
        }
        
        // Use letter frequency for remaining letters
        return this.makeFrequencyGuess();
    }

    makeHardGuess(game) {
        // Hard AI: uses pattern recognition and strategic thinking
        
        // Analyze the word pattern
        const patternAnalysis = this.analyzeWordPattern();
        
        // If we have enough information, try to narrow down possibilities
        if (patternAnalysis.confidence > 0.6) {
            const bestGuess = this.findBestPatternGuess(patternAnalysis);
            if (bestGuess) {
                return bestGuess;
            }
        }
        
        // Use advanced frequency analysis
        return this.makeAdvancedFrequencyGuess();
    }

    makeStrategicGuess() {
        // Try letters that commonly appear with the revealed letters
        const revealedLetters = this.wordPattern.filter(letter => letter !== '_');
        
        // Common letter pairs and patterns
        const commonPairs = {
            'TH': 'T',
            'HE': 'H',
            'IN': 'I',
            'ER': 'E',
            'AN': 'A',
            'RE': 'R',
            'ED': 'E',
            'ND': 'N',
            'ON': 'O',
            'EN': 'E',
            'ES': 'E',
            'OF': 'O',
            'ST': 'S',
            'NT': 'N',
            'TO': 'T',
            'IT': 'I',
            'IE': 'I',
            'HI': 'H',
            'AS': 'A',
            'OU': 'O'
        };
        
        // Check for common patterns in the word
        for (let i = 0; i < this.wordPattern.length - 1; i++) {
            if (this.wordPattern[i] !== '_' && this.wordPattern[i + 1] === '_') {
                const currentLetter = this.wordPattern[i];
                
                // Find letters that commonly follow this letter
                for (const [pair, firstLetter] of Object.entries(commonPairs)) {
                    if (firstLetter === currentLetter && !this.guessedLetters.includes(pair[1])) {
                        return pair[1];
                    }
                }
            }
        }
        
        // Check for common patterns with underscores
        for (let i = 0; i < this.wordPattern.length - 1; i++) {
            if (this.wordPattern[i] === '_' && this.wordPattern[i + 1] !== '_') {
                const nextLetter = this.wordPattern[i + 1];
                
                // Find letters that commonly precede this letter
                for (const [pair, secondLetter] of Object.entries(commonPairs)) {
                    if (pair[1] === nextLetter && !this.guessedLetters.includes(pair[0])) {
                        return pair[0];
                    }
                }
            }
        }
        
        return null;
    }

    makeFrequencyGuess() {
        // Guess letters based on frequency
        const unguessedLetters = Object.keys(this.letterFrequency)
            .filter(letter => !this.guessedLetters.includes(letter))
            .sort((a, b) => this.letterFrequency[b] - this.letterFrequency[a]);
        
        if (unguessedLetters.length > 0) {
            return unguessedLetters[0];
        }
        
        return null;
    }

    makeAdvancedFrequencyGuess() {
        // Advanced frequency analysis based on word length and pattern
        
        // Adjust frequency based on word length
        const wordLength = this.wordPattern.length;
        let adjustedFrequency = { ...this.letterFrequency };
        
        // For short words, prioritize different letters
        if (wordLength <= 4) {
            adjustedFrequency['A'] += 10;
            adjustedFrequency['E'] += 8;
            adjustedFrequency['O'] += 6;
        }
        
        // For long words, prioritize different letters
        if (wordLength >= 8) {
            adjustedFrequency['S'] += 8;
            adjustedFrequency['T'] += 6;
            adjustedFrequency['R'] += 5;
            adjustedFrequency['E'] += 5;
        }
        
        // Sort by adjusted frequency
        const unguessedLetters = Object.keys(adjustedFrequency)
            .filter(letter => !this.guessedLetters.includes(letter))
            .sort((a, b) => adjustedFrequency[b] - adjustedFrequency[a]);
        
        if (unguessedLetters.length > 0) {
            return unguessedLetters[0];
        }
        
        return null;
    }

    analyzeWordPattern() {
        // Analyze the current word pattern to determine best guessing strategy
        const pattern = this.wordPattern.join('');
        const revealedCount = (pattern.match(/[A-Z]/g) || []).length;
        const totalCount = pattern.length;
        const percentageRevealed = revealedCount / totalCount;
        
        // Look for common patterns
        const hasDoubleLetters = /(.)\1/.test(pattern);
        const hasCommonEndings = /_E$|_S$|_D$|_Y$|_ING$/.test(pattern);
        const hasCommonBeginnings = /^A_|^THE_|^RE_|^PRE_/.test(pattern);
        
        let confidence = percentageRevealed;
        
        if (hasDoubleLetters) confidence += 0.1;
        if (hasCommonEndings) confidence += 0.15;
        if (hasCommonBeginnings) confidence += 0.15;
        
        return {
            pattern,
            revealedCount,
            totalCount,
            percentageRevealed,
            hasDoubleLetters,
            hasCommonEndings,
            hasCommonBeginnings,
            confidence
        };
    }

    findBestPatternGuess(patternAnalysis) {
        // Find the best guess based on pattern analysis
        
        // Check for common endings
        if (patternAnalysis.hasCommonEndings) {
            if (patternAnalysis.pattern.endsWith('_E') && !this.guessedLetters.includes('E')) {
                return 'E';
            }
            if (patternAnalysis.pattern.endsWith('_S') && !this.guessedLetters.includes('S')) {
                return 'S';
            }
            if (patternAnalysis.pattern.endsWith('_D') && !this.guessedLetters.includes('D')) {
                return 'D';
            }
            if (patternAnalysis.pattern.endsWith('_Y') && !this.guessedLetters.includes('Y')) {
                return 'Y';
            }
        }
        
        // Check for common beginnings
        if (patternAnalysis.hasCommonBeginnings) {
            if (patternAnalysis.pattern.startsWith('A_') && !this.guessedLetters.includes('A')) {
                return 'A';
            }
            if (patternAnalysis.pattern.startsWith('_THE_') && !this.guessedLetters.includes('H')) {
                return 'H';
            }
            if (patternAnalysis.pattern.startsWith('_RE_') && !this.guessedLetters.includes('R')) {
                return 'R';
            }
            if (patternAnalysis.pattern.startsWith('_PRE_') && !this.guessedLetters.includes('P')) {
                return 'P';
            }
        }
        
        // Check for double letters
        if (patternAnalysis.hasDoubleLetters) {
            for (let i = 0; i < patternAnalysis.pattern.length - 1; i++) {
                if (patternAnalysis.pattern[i] === '_' && patternAnalysis.pattern[i + 1] === '_') {
                    // Try common double letters
                    const commonDoubles = ['L', 'E', 'S', 'O', 'T', 'R', 'N', 'D'];
                    for (const letter of commonDoubles) {
                        if (!this.guessedLetters.includes(letter)) {
                            return letter;
                        }
                    }
                }
            }
        }
        
        return null;
    }

    makeRandomGuess() {
        // Make a completely random guess from remaining letters
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        const unguessedLetters = alphabet.filter(letter => !this.guessedLetters.includes(letter));
        
        if (unguessedLetters.length > 0) {
            return unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
        }
        
        return null;
    }

    reset() {
        this.guessedLetters = [];
        this.wordPattern = [];
        this.possibleWords = [];
    }
}

export default AIPlayer;