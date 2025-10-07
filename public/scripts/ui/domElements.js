import { Utils } from '../utils/helpers.js';

export class UIController {
    constructor() {
        this.elements = {};
        this.initialized = false;
    }

    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.initialized = true;
    }

    cacheElements() {
        // cache all the DOM elements we'll need
        this.elements = {
            // Pages
            pages: {
                landing: document.getElementById('landing-page'),
                singlePlayerSetup: document.getElementById('single-player-setup'),
                multiplayerSetup: document.getElementById('multiplayer-setup'),
                gameScreen: document.getElementById('game-screen'),
                roomWaiting: document.getElementById('room-waiting'),
                gameResults: document.getElementById('game-results')
            },
            
            // Landing page
            landing: {
                totalGames: document.getElementById('total-games'),
                winRate: document.getElementById('win-rate'),
                currentStreak: document.getElementById('current-streak')
            },
            
            // Single player setup
            singlePlayerSetup: {
                username: document.getElementById('username'),
                difficulty: document.getElementById('difficulty'),
                category: document.getElementById('category'),
                startButton: document.getElementById('start-single-player'),
                backButton: document.getElementById('back-to-landing')
            },
            
            // Game screen
            game: {
                category: document.getElementById('game-category'),
                difficulty: document.getElementById('game-difficulty'),
                score: document.getElementById('game-score'),
                timer: document.getElementById('timer-value'),
                lives: document.getElementById('lives-display'),
                wordDisplay: document.getElementById('word-display'),
                hint: document.getElementById('hint'),
                keyboard: document.getElementById('keyboard'),
                hintButton: document.getElementById('hint-btn'),
                quitButton: document.getElementById('quit-btn')
            },
            
            // Multiplayer setup
            multiplayerSetup: {
                createRoomBtn: document.getElementById('create-room-btn'),
                joinRoomBtn: document.getElementById('join-room-btn'),
                createRoomForm: document.getElementById('create-room-form'),
                joinRoomForm: document.getElementById('join-room-form'),
                roomName: document.getElementById('room-name'),
                maxPlayers: document.getElementById('max-players'),
                roomDifficulty: document.getElementById('room-difficulty'),
                privateRoom: document.getElementById('private-room'),
                roomCode: document.getElementById('room-code'),
                createRoomSubmit: document.getElementById('create-room-submit'),
                joinRoomSubmit: document.getElementById('join-room-submit'),
                cancelCreateRoom: document.getElementById('cancel-create-room'),
                cancelJoinRoom: document.getElementById('cancel-join-room'),
                backButton: document.getElementById('back-to-landing-multiplayer')
            },
            
            // Room waiting
            roomWaiting: {
                roomNameDisplay: document.getElementById('room-name-display'),
                roomCodeDisplay: document.getElementById('room-code-display'),
                playersCount: document.getElementById('players-count'),
                playersContainer: document.getElementById('players-container'),
                readyButton: document.getElementById('ready-btn'),
                leaveRoomButton: document.getElementById('leave-room-btn'),
                chatMessages: document.getElementById('chat-messages'),
                chatInput: document.getElementById('chat-input'),
                sendChatButton: document.getElementById('send-chat-btn')
            },
            
            // Game results
            results: {
                title: document.getElementById('result-title'),
                word: document.getElementById('result-word'),
                message: document.getElementById('result-message'),
                baseScore: document.getElementById('base-score'),
                timeBonus: document.getElementById('time-bonus'),
                difficultyMultiplier: document.getElementById('difficulty-multiplier'),
                totalScore: document.getElementById('total-score'),
                playAgainButton: document.getElementById('play-again-btn'),
                mainMenuButton: document.getElementById('main-menu-btn')
            },
            
            // Header
            header: {
                themeToggle: document.getElementById('theme-toggle'),
                soundToggle: document.getElementById('sound-toggle')
            },
            
            // Loading screen
            loading: {
                loadingScreen: document.getElementById('loading-screen'),
                app: document.getElementById('app')
            }
        };
    }

    setupEventListeners() {
        // Additional event listeners that need to be set up
        if (this.elements.header.themeToggle) {
            this.elements.header.themeToggle.addEventListener('click', () => {
                this.emit('themeToggle');
            });
        }
        
        if (this.elements.header.soundToggle) {
            this.elements.header.soundToggle.addEventListener('click', () => {
                this.emit('soundToggle');
            });
        }
    }

    showPage(pageName) {
        // Hide all pages
        Object.values(this.elements.pages).forEach(page => {
            if (page) page.classList.remove('active');
        });
        
        // Show selected page
        const page = this.elements.pages[pageName];
        if (page) {
            page.classList.add('active');
            this.emit('pageChanged', pageName);
        }
    }

    updateStats(playerData) {
        if (!this.elements.landing.totalGames) return;
        
        const totalGames = playerData.totalGames || 0;
        const gamesWon = playerData.gamesWon || 0;
        const winRate = totalGames > 0 ? Math.round((gamesWon / totalGames) * 100) : 0;
        const currentStreak = playerData.currentStreak || 0;
        
        this.elements.landing.totalGames.textContent = totalGames;
        this.elements.landing.winRate.textContent = `${winRate}%`;
        this.elements.landing.currentStreak.textContent = currentStreak;
    }

    updateGameInfo(category, difficulty, score) {
        if (this.elements.game.category) {
            this.elements.game.category.textContent = Utils.capitalize(category);
        }
        
        if (this.elements.game.difficulty) {
            this.elements.game.difficulty.textContent = Utils.capitalize(difficulty);
        }
        
        if (this.elements.game.score) {
            this.elements.game.score.textContent = score;
        }
    }

    updateTimer(seconds) {
        if (this.elements.game.timer) {
            this.elements.game.timer.textContent = Utils.formatTime(seconds);
        }
    }

    updateLives(remaining, total) {
        if (!this.elements.game.lives) return;
        
        this.elements.game.lives.innerHTML = '';
        
        for (let i = 0; i < total; i++) {
            const lifeDot = document.createElement('div');
            lifeDot.className = 'life-dot';
            
            if (i >= remaining) {
                lifeDot.classList.add('lost');
            }
            
            this.elements.game.lives.appendChild(lifeDot);
        }
    }

    updateWordDisplay(word, guessedLetters) {
        if (!this.elements.game.wordDisplay) return;
        
        this.elements.game.wordDisplay.innerHTML = '';
        
        word.split('').forEach(letter => {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            
            if (guessedLetters.includes(letter)) {
                letterBox.textContent = letter;
                letterBox.classList.add('revealed');
            } else {
                letterBox.textContent = '';
            }
            
            this.elements.game.wordDisplay.appendChild(letterBox);
        });
    }

    showHint(hint) {
        if (this.elements.game.hint) {
            this.elements.game.hint.textContent = `Hint: ${hint}`;
            this.elements.game.hint.classList.remove('hidden');
        }
    }

    hideHint() {
        if (this.elements.game.hint) {
            this.elements.game.hint.classList.add('hidden');
        }
    }

    updateKeyboard(guessedLetters, word) {
        if (!this.elements.game.keyboard) return;
        
        const keys = this.elements.game.keyboard.querySelectorAll('.key');
        
        keys.forEach(key => {
            const letter = key.dataset.letter;
            
            if (guessedLetters.includes(letter)) {
                key.classList.add('disabled');
                
                if (word.includes(letter)) {
                    key.classList.add('correct');
                } else {
                    key.classList.add('incorrect');
                }
            } else {
                key.classList.remove('disabled', 'correct', 'incorrect');
            }
        });
    }

    createKeyboard() {
        if (!this.elements.game.keyboard) return;
        
        this.elements.game.keyboard.innerHTML = '';
        
        const keyboardLayout = [
            'QWERTYUIOP',
            'ASDFGHJKL',
            'ZXCVBNM'
        ];
        
        keyboardLayout.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            
            row.split('').forEach(letter => {
                const key = document.createElement('button');
                key.className = 'key';
                key.textContent = letter;
                key.dataset.letter = letter;
                
                key.addEventListener('click', () => {
                    this.emit('keyPress', letter);
                });
                
                rowElement.appendChild(key);
            });
            
            this.elements.game.keyboard.appendChild(rowElement);
        });
    }

    updateRoomInfo(room) {
        if (!this.elements.roomWaiting.roomNameDisplay) return;
        
        this.elements.roomWaiting.roomNameDisplay.textContent = room.name;
        this.elements.roomWaiting.roomCodeDisplay.textContent = room.code;
        this.elements.roomWaiting.playersCount.textContent = `${room.players.length}/${room.maxPlayers}`;
    }

    updatePlayersList(players) {
        if (!this.elements.roomWaiting.playersContainer) return;
        
        this.elements.roomWaiting.playersContainer.innerHTML = '';
        
        players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            playerCard.innerHTML = `
                <div class="player-name">${player.username}</div>
                <div class="player-status ${player.isReady ? 'ready' : ''}">${player.isReady ? 'Ready' : 'Waiting'}</div>
            `;
            
            this.elements.roomWaiting.playersContainer.appendChild(playerCard);
        });
    }

    addChatMessage(sender, message, type = 'user') {
        if (!this.elements.roomWaiting.chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        if (type === 'system') {
            messageElement.innerHTML = `<span class="system-message">${message}</span>`;
        } else {
            messageElement.innerHTML = `<span class="sender">${sender}:</span> ${message}`;
        }
        
        this.elements.roomWaiting.chatMessages.appendChild(messageElement);
        this.elements.roomWaiting.chatMessages.scrollTop = this.elements.roomWaiting.chatMessages.scrollHeight;
    }

    getChatInput() {
        return this.elements.roomWaiting.chatInput ? this.elements.roomWaiting.chatInput.value.trim() : '';
    }

    clearChatInput() {
        if (this.elements.roomWaiting.chatInput) {
            this.elements.roomWaiting.chatInput.value = '';
        }
    }

    updateResults(result) {
        if (!this.elements.results.title) return;
        
        this.elements.results.title.textContent = result.won ? 'Congratulations! You Won!' : 'Game Over!';
        this.elements.results.word.textContent = `The word was: ${result.word}`;
        this.elements.results.message.textContent = result.won ? 
            'Great job! You guessed the word correctly.' : 
            'Better luck next time!';
        
        this.elements.results.baseScore.textContent = result.baseScore;
        this.elements.results.timeBonus.textContent = result.timeBonus;
        this.elements.results.difficultyMultiplier.textContent = `${result.difficultyMultiplier}x`;
        this.elements.results.totalScore.textContent = result.score;
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    setSoundEnabled(enabled) {
        const soundIcon = document.querySelector('.sound-icon');
        if (soundIcon) {
            soundIcon.textContent = enabled ? '🔊' : '🔇';
        }
    }

    showLoading() {
        if (this.elements.loading.loadingScreen) {
            this.elements.loading.loadingScreen.classList.remove('hidden');
        }
        
        if (this.elements.loading.app) {
            this.elements.loading.app.classList.add('hidden');
        }
    }

    hideLoading() {
        if (this.elements.loading.loadingScreen) {
            this.elements.loading.loadingScreen.classList.add('hidden');
        }
        
        if (this.elements.loading.app) {
            this.elements.loading.app.classList.remove('hidden');
        }
    }

    showError(message) {
        // Simple error display for now
        alert(message);
        console.error(message);
    }

    showConfirmation(message, callback) {
        if (confirm(message)) {
            callback();
        }
    }

    // Simple event emitter implementation
    emit(event, data) {
        if (this.events && this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    on(event, callback) {
        if (!this.events) {
            this.events = {};
        }
        
        if (!this.events[event]) {
            this.events[event] = [];
        }
        
        this.events[event].push(callback);
    }

    off(event, callback) {
        if (!this.events || !this.events[event]) return;
        
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
}

export default UIController;