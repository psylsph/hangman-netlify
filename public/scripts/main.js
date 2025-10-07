import { Game } from './game/gameLogic.js';
import { AIPlayer } from './game/aiPlayer.js';
import { MultiplayerManager } from './game/multiplayer.js';
import { UIController } from './ui/domElements.js';
import { AnimationController } from './ui/animations.js';
import { SoundController } from './ui/soundEffects.js';
import { StorageManager } from './utils/storage.js';
import { WordManager } from './utils/wordManager.js';

class HangmanApp {
    constructor() {
        this.game = null;
        this.aiPlayer = null;
        this.multiplayerManager = null;
        this.uiController = null;
        this.animationController = null;
        this.soundController = null;
        this.storageManager = null;
        this.wordManager = null;
        
        this.currentPage = 'landing-page';
        this.gameMode = null;
        this.playerData = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize managers
            this.storageManager = new StorageManager();
            this.wordManager = new WordManager();
            this.uiController = new UIController();
            this.animationController = new AnimationController();
            this.soundController = new SoundController();
            
            // Load player data
            this.playerData = this.storageManager.getPlayerData();
            
            // Initialize UI
            this.uiController.init();
            this.setupEventListeners();
            this.updateStatsDisplay();
            
            // Load theme preference
            this.loadThemePreference();
            
            // Load sound preference
            this.loadSoundPreference();
            
            // Hide loading screen and show app
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
                document.getElementById('app').classList.remove('hidden');
            }, 1500);
            
            console.log('Hangman Game initialized successfully');
        } catch (error) {
            console.error('Error initializing game:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('single-player-btn').addEventListener('click', () => {
            this.showPage('single-player-setup');
        });

        document.getElementById('multiplayer-btn').addEventListener('click', () => {
            this.showPage('multiplayer-setup');
        });

        document.getElementById('quick-match-btn').addEventListener('click', () => {
            this.startQuickMatch();
        });

        // Back buttons
        document.getElementById('back-to-landing').addEventListener('click', () => {
            this.showPage('landing-page');
        });

        document.getElementById('back-to-landing-multiplayer').addEventListener('click', () => {
            this.showPage('landing-page');
        });

        // Single player setup
        document.getElementById('start-single-player').addEventListener('click', () => {
            this.startSinglePlayerGame();
        });

        // Multiplayer setup
        document.getElementById('create-room-btn').addEventListener('click', () => {
            this.showCreateRoomForm();
        });

        document.getElementById('join-room-btn').addEventListener('click', () => {
            this.showJoinRoomForm();
        });

        document.getElementById('create-room-submit').addEventListener('click', () => {
            this.createRoom();
        });

        document.getElementById('join-room-submit').addEventListener('click', () => {
            this.joinRoom();
        });

        document.getElementById('cancel-create-room').addEventListener('click', () => {
            this.hideRoomForms();
        });

        document.getElementById('cancel-join-room').addEventListener('click', () => {
            this.hideRoomForms();
        });

        // Room actions
        document.getElementById('ready-btn').addEventListener('click', () => {
            this.toggleReady();
        });

        document.getElementById('leave-room-btn').addEventListener('click', () => {
            this.leaveRoom();
        });

        // Game actions
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.getHint();
        });

        document.getElementById('quit-btn').addEventListener('click', () => {
            this.quitGame();
        });

        // Results actions
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.playAgain();
        });

        document.getElementById('main-menu-btn').addEventListener('click', () => {
            this.showPage('landing-page');
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Sound toggle
        document.getElementById('sound-toggle').addEventListener('click', () => {
            this.toggleSound();
        });

        // Chat functionality
        document.getElementById('send-chat-btn').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        // Keyboard input for game
        document.addEventListener('keydown', (e) => {
            if (this.currentPage === 'game-screen' && this.game) {
                const letter = e.key.toUpperCase();
                if (/^[A-Z]$/.test(letter)) {
                    this.game.makeGuess(letter);
                }
            }
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        document.getElementById(pageId).classList.add('active');
        this.currentPage = pageId;

        // Play page transition sound
        this.soundController.playSound('pageTransition');
    }

    async startSinglePlayerGame() {
        try {
            const username = document.getElementById('username').value.trim();
            const difficulty = document.getElementById('difficulty').value;
            const category = document.getElementById('category').value;

            if (!username) {
                this.showError('Please enter a username');
                return;
            }

            // Update player data
            this.playerData.username = username;
            this.storageManager.savePlayerData(this.playerData);

            // Initialize game
            this.gameMode = 'single-player';
            this.game = new Game(difficulty, category);
            this.aiPlayer = new AIPlayer(difficulty);

            // Get word
            const wordData = await this.wordManager.getRandomWord(category, difficulty);
            this.game.startGame(wordData.word, wordData.hint, wordData.category);

            // Setup game UI
            this.setupGameUI();
            this.showPage('game-screen');

            console.log('Single player game started');
        } catch (error) {
            console.error('Error starting single player game:', error);
            this.showError('Failed to start game. Please try again.');
        }
    }

    startQuickMatch() {
        // For now, redirect to multiplayer setup
        // In a full implementation, this would use matchmaking
        this.showPage('multiplayer-setup');
        this.showJoinRoomForm();
    }

    showCreateRoomForm() {
        document.getElementById('create-room-form').classList.remove('hidden');
        document.getElementById('join-room-form').classList.add('hidden');
    }

    showJoinRoomForm() {
        document.getElementById('join-room-form').classList.remove('hidden');
        document.getElementById('create-room-form').classList.add('hidden');
    }

    hideRoomForms() {
        document.getElementById('create-room-form').classList.add('hidden');
        document.getElementById('join-room-form').classList.add('hidden');
    }

    async createRoom() {
        try {
            const roomName = document.getElementById('room-name').value.trim();
            const maxPlayers = parseInt(document.getElementById('max-players').value);
            const difficulty = document.getElementById('room-difficulty').value;
            const isPrivate = document.getElementById('private-room').checked;

            if (!roomName) {
                this.showError('Please enter a room name');
                return;
            }

            // Initialize multiplayer manager
            this.multiplayerManager = new MultiplayerManager();
            
            // Create room
            const room = await this.multiplayerManager.createRoom({
                name: roomName,
                maxPlayers,
                difficulty,
                isPrivate
            });

            // Join room
            await this.joinRoomById(room.id);

            console.log('Room created successfully');
        } catch (error) {
            console.error('Error creating room:', error);
            this.showError('Failed to create room. Please try again.');
        }
    }

    async joinRoom() {
        try {
            const roomCode = document.getElementById('room-code').value.trim();

            if (!roomCode) {
                this.showError('Please enter a room code');
                return;
            }

            // Initialize multiplayer manager
            this.multiplayerManager = new MultiplayerManager();
            
            // Find room by code
            const room = await this.multiplayerManager.findRoomByCode(roomCode);
            
            if (!room) {
                this.showError('Room not found');
                return;
            }

            // Join room
            await this.joinRoomById(room.id);

            console.log('Joined room successfully');
        } catch (error) {
            console.error('Error joining room:', error);
            this.showError('Failed to join room. Please try again.');
        }
    }

    async joinRoomById(roomId) {
        try {
            // Join room
            await this.multiplayerManager.joinRoom(roomId, this.playerData);
            
            // Setup room UI
            this.setupRoomUI();
            this.showPage('room-waiting');

            // Listen for room events
            this.setupRoomEventListeners();

            console.log('Joined room with ID:', roomId);
        } catch (error) {
            console.error('Error joining room by ID:', error);
            throw error;
        }
    }

    setupRoomUI() {
        const room = this.multiplayerManager.getCurrentRoom();
        
        // Update room display
        document.getElementById('room-name-display').textContent = room.name;
        document.getElementById('room-code-display').textContent = room.code;
        document.getElementById('players-count').textContent = `${room.players.length}/${room.maxPlayers}`;

        // Update players list
        this.updatePlayersList(room.players);
    }

    updatePlayersList(players) {
        const container = document.getElementById('players-container');
        container.innerHTML = '';

        players.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            
            playerCard.innerHTML = `
                <div class="player-name">${player.username}</div>
                <div class="player-status ${player.isReady ? 'ready' : ''}">${player.isReady ? 'Ready' : 'Waiting'}</div>
            `;
            
            container.appendChild(playerCard);
        });
    }

    setupRoomEventListeners() {
        this.multiplayerManager.on('playerJoined', (player) => {
            this.updatePlayersList(this.multiplayerManager.getCurrentRoom().players);
            this.addChatMessage('System', `${player.username} joined the room`, 'system');
        });

        this.multiplayerManager.on('playerLeft', (player) => {
            this.updatePlayersList(this.multiplayerManager.getCurrentRoom().players);
            this.addChatMessage('System', `${player.username} left the room`, 'system');
        });

        this.multiplayerManager.on('playerReady', (player) => {
            this.updatePlayersList(this.multiplayerManager.getCurrentRoom().players);
        });

        this.multiplayerManager.on('gameStarted', (gameData) => {
            this.startMultiplayerGame(gameData);
        });

        this.multiplayerManager.on('chatMessage', (message) => {
            this.addChatMessage(message.sender, message.text, 'user');
        });
    }

    addChatMessage(sender, text, type = 'user') {
        const messagesContainer = document.getElementById('chat-messages');
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        
        if (type === 'system') {
            messageElement.innerHTML = `<span class="system-message">${text}</span>`;
        } else {
            messageElement.innerHTML = `<span class="sender">${sender}:</span> ${text}`;
        }
        
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message && this.multiplayerManager) {
            this.multiplayerManager.sendChatMessage(message);
            input.value = '';
        }
    }

    toggleReady() {
        if (this.multiplayerManager) {
            this.multiplayerManager.toggleReady();
        }
    }

    leaveRoom() {
        if (this.multiplayerManager) {
            this.multiplayerManager.leaveRoom();
            this.multiplayerManager = null;
        }
        this.showPage('multiplayer-setup');
    }

    async startMultiplayerGame(gameData) {
        try {
            // Initialize game
            this.gameMode = 'multiplayer';
            this.game = new Game(gameData.difficulty, gameData.category);
            this.game.startGame(gameData.word, gameData.hint, gameData.category);

            // Setup game UI
            this.setupGameUI();
            this.showPage('game-screen');

            // Start game timer for multiplayer
            this.startGameTimer();

            // Setup multiplayer game events
            this.setupMultiplayerGameEvents();

            console.log('Multiplayer game started');
        } catch (error) {
            console.error('Error starting multiplayer game:', error);
            this.showError('Failed to start game. Please try again.');
        }
    }

    setupMultiplayerGameEvents() {
        this.multiplayerManager.on('guessMade', (data) => {
            this.game.processGuess(data.letter, data.correct);
        });

        this.multiplayerManager.on('gameEnded', (result) => {
            this.endGame(result);
        });
    }

    setupGameUI() {
        // Update game info
        document.getElementById('game-category').textContent = this.game.category;
        document.getElementById('game-difficulty').textContent = this.game.difficulty;
        document.getElementById('game-score').textContent = '0';

        // Show/hide timer based on game mode
        const timerElement = document.getElementById('game-timer');
        if (this.gameMode === 'single-player') {
            timerElement.style.display = 'none';
        } else {
            timerElement.style.display = 'flex';
        }

        // Setup word display
        this.updateWordDisplay();

        // Setup keyboard
        this.setupKeyboard();

        // Setup lives display
        this.updateLivesDisplay();

        // Setup game actions based on game mode
        const gameActions = document.querySelector('.game-actions');
        if (this.gameMode === 'single-player') {
            // Add AI Hint button for single-player mode
            if (!document.getElementById('ai-hint-btn')) {
                const aiHintBtn = document.createElement('button');
                aiHintBtn.id = 'ai-hint-btn';
                aiHintBtn.className = 'btn secondary';
                aiHintBtn.textContent = 'Ask AI for Hint';
                aiHintBtn.addEventListener('click', () => {
                    this.getAIHint();
                });
                gameActions.insertBefore(aiHintBtn, gameActions.firstChild);
            }
        } else {
            // Remove AI Hint button for multiplayer mode
            const aiHintBtn = document.getElementById('ai-hint-btn');
            if (aiHintBtn) {
                aiHintBtn.remove();
            }
        }

        // Setup game event listeners
        this.game.on('guessMade', (data) => {
            this.handleGuess(data);
        });

        this.game.on('gameEnded', (result) => {
            this.endGame(result);
        });
    }

    updateWordDisplay() {
        const wordDisplay = document.getElementById('word-display');
        wordDisplay.innerHTML = '';

        this.game.word.split('').forEach(letter => {
            const letterBox = document.createElement('div');
            letterBox.className = 'letter-box';
            
            if (this.game.guessedLetters.includes(letter)) {
                letterBox.textContent = letter;
                letterBox.classList.add('revealed');
            } else {
                letterBox.textContent = '';
            }
            
            wordDisplay.appendChild(letterBox);
        });
    }

    setupKeyboard() {
        const keyboard = document.getElementById('keyboard');
        keyboard.innerHTML = '';

        // Create keyboard layout
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
                
                if (this.game.guessedLetters.includes(letter)) {
                    key.classList.add('disabled');
                    if (this.game.word.includes(letter)) {
                        key.classList.add('correct');
                    } else {
                        key.classList.add('incorrect');
                    }
                }
                
                key.addEventListener('click', () => {
                    this.game.makeGuess(letter);
                });
                
                rowElement.appendChild(key);
            });
            
            keyboard.appendChild(rowElement);
        });
    }

    updateLivesDisplay() {
        const livesDisplay = document.getElementById('lives-display');
        livesDisplay.innerHTML = '';

        const maxLives = this.game.maxWrongGuesses;
        const remainingLives = maxLives - this.game.wrongGuesses;

        for (let i = 0; i < maxLives; i++) {
            const lifeDot = document.createElement('div');
            lifeDot.className = 'life-dot';
            
            if (i >= remainingLives) {
                lifeDot.classList.add('lost');
            }
            
            livesDisplay.appendChild(lifeDot);
        }
    }

    handleGuess(data) {
        const { letter, correct } = data;
        
        // Play sound
        this.soundController.playSound(correct ? 'correctGuess' : 'wrongGuess');
        
        // Update keyboard
        const key = document.querySelector(`.key[data-letter="${letter}"]`);
        if (key) {
            key.classList.add('disabled');
            key.classList.add(correct ? 'correct' : 'incorrect');
        }
        
        // Update word display
        this.updateWordDisplay();
        
        // Update lives display
        this.updateLivesDisplay();
        
        // Update hangman drawing
        if (!correct) {
            this.animationController.revealHangmanPart(this.game.wrongGuesses);
        }
        
        // Update score
        this.updateScore();
        
        // If multiplayer, send guess to other players
        if (this.gameMode === 'multiplayer' && this.multiplayerManager) {
            this.multiplayerManager.sendGuess(letter, correct);
        }
        
        // No automatic AI guessing in single-player mode
        // The player has full control
    }

    getAIHint() {
        if (this.aiPlayer && !this.game.isGameOver()) {
            const letter = this.aiPlayer.makeGuess(this.game);
            
            // Highlight the suggested letter on the keyboard
            const key = document.querySelector(`.key[data-letter="${letter}"]`);
            if (key && !key.classList.contains('disabled')) {
                key.classList.add('ai-suggestion');
                
                // Remove the highlight after 3 seconds
                setTimeout(() => {
                    key.classList.remove('ai-suggestion');
                }, 3000);
                
                // Play hint sound
                this.soundController.playSound('hint');
            }
        }
    }

    updateScore() {
        const score = this.game.calculateScore();
        document.getElementById('game-score').textContent = score;
    }

    startGameTimer() {
        this.startTime = Date.now();
        
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            document.getElementById('timer-value').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopGameTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    getHint() {
        if (this.game && this.game.hint && !this.game.hintUsed) {
            document.getElementById('hint').textContent = `Hint: ${this.game.hint}`;
            document.getElementById('hint').classList.remove('hidden');
            this.game.useHint();
            
            // Apply score penalty for using hint
            this.updateScore();
        }
    }

    quitGame() {
        if (confirm('Are you sure you want to quit the game?')) {
            this.stopGameTimer();
            
            if (this.multiplayerManager) {
                this.leaveRoom();
            } else {
                this.showPage('landing-page');
            }
            
            this.game = null;
            this.aiPlayer = null;
        }
    }

    endGame(result) {
        this.stopGameTimer();
        
        // Update results screen
        const won = result.won;
        const word = result.word;
        const score = result.score;
        
        document.getElementById('result-title').textContent = won ? 'Congratulations! You Won!' : 'Game Over!';
        document.getElementById('result-word').textContent = `The word was: ${word}`;
        document.getElementById('result-message').textContent = won ? 
            'Great job! You guessed the word correctly.' : 
            'Better luck next time!';
        
        // Update score breakdown
        document.getElementById('base-score').textContent = result.baseScore;
        document.getElementById('time-bonus').textContent = result.timeBonus;
        document.getElementById('difficulty-multiplier').textContent = `${result.difficultyMultiplier}x`;
        document.getElementById('total-score').textContent = score;
        
        // Update player stats
        this.playerData.totalGames++;
        if (won) {
            this.playerData.gamesWon++;
            this.playerData.currentStreak++;
            this.playerData.bestStreak = Math.max(this.playerData.bestStreak, this.playerData.currentStreak);
        } else {
            this.playerData.gamesLost++;
            this.playerData.currentStreak = 0;
        }
        
        this.storageManager.savePlayerData(this.playerData);
        this.updateStatsDisplay();
        
        // Show results
        this.showPage('game-results');
        
        // Play result sound
        this.soundController.playSound(won ? 'win' : 'lose');
    }

    playAgain() {
        if (this.gameMode === 'single-player') {
            this.startSinglePlayerGame();
        } else if (this.gameMode === 'multiplayer' && this.multiplayerManager) {
            this.multiplayerManager.playAgain();
        }
    }

    updateStatsDisplay() {
        const totalGames = this.playerData.totalGames || 0;
        const gamesWon = this.playerData.gamesWon || 0;
        const winRate = totalGames > 0 ? Math.round((gamesWon / totalGames) * 100) : 0;
        const currentStreak = this.playerData.currentStreak || 0;
        
        document.getElementById('total-games').textContent = totalGames;
        document.getElementById('win-rate').textContent = `${winRate}%`;
        document.getElementById('current-streak').textContent = currentStreak;
    }

    loadThemePreference() {
        const theme = this.storageManager.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        this.storageManager.setTheme(newTheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }

    loadSoundPreference() {
        const soundEnabled = this.storageManager.getSoundEnabled();
        this.soundController.setEnabled(soundEnabled);
        
        const soundIcon = document.querySelector('.sound-icon');
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    }

    toggleSound() {
        const currentSoundEnabled = this.soundController.getEnabled();
        const newSoundEnabled = !currentSoundEnabled;
        
        this.soundController.setEnabled(newSoundEnabled);
        this.storageManager.setSoundEnabled(newSoundEnabled);
        
        const soundIcon = document.querySelector('.sound-icon');
        soundIcon.textContent = newSoundEnabled ? '🔊' : '🔇';
        
        // Play test sound if enabling
        if (newSoundEnabled) {
            this.soundController.playSound('toggle');
        }
    }

    showError(message) {
        // Simple error display for now
        alert(message);
        console.error(message);
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new HangmanApp();
});