import { EventEmitter } from '../utils/helpers.js';
import { Utils } from '../utils/helpers.js';

export class MultiplayerManager extends EventEmitter {
    constructor() {
        super();
        this.currentRoom = null;
        this.playerData = null;
        this.isConnected = false;
        this.rooms = [];
        this.mockRooms = []; // For demo purposes without backend
        this.initializeMockRooms();
    }

    // Initialize mock rooms for demo purposes
    initializeMockRooms() {
        this.mockRooms = [
            {
                id: 'room1',
                name: 'Fun Room',
                code: 'ABC123',
                maxPlayers: 4,
                currentPlayers: 2,
                players: [
                    { id: 'player1', username: 'Alice', isReady: true },
                    { id: 'player2', username: 'Bob', isReady: false }
                ],
                status: 'waiting',
                difficulty: 'medium',
                category: 'random',
                isPrivate: false,
                createdBy: 'player1',
                createdAt: new Date().toISOString()
            },
            {
                id: 'room2',
                name: 'Challenge Room',
                code: 'XYZ789',
                maxPlayers: 3,
                currentPlayers: 1,
                players: [
                    { id: 'player3', username: 'Charlie', isReady: false }
                ],
                status: 'waiting',
                difficulty: 'hard',
                category: 'animals',
                isPrivate: false,
                createdBy: 'player3',
                createdAt: new Date().toISOString()
            }
        ];
    }

    // Connect to the multiplayer service
    async connect() {
        try {
            // In a real implementation, this would connect to Supabase
            // For now, we'll simulate a connection
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.isConnected = true;
            this.emit('connected');
            return true;
        } catch (error) {
            console.error('Error connecting to multiplayer service:', error);
            this.emit('error', error);
            return false;
        }
    }

    // Disconnect from the multiplayer service
    disconnect() {
        this.isConnected = false;
        this.currentRoom = null;
        this.emit('disconnected');
    }

    // Create a new room
    async createRoom(roomOptions) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }

            const room = {
                id: Utils.generateId(),
                name: roomOptions.name,
                code: Utils.generateRoomCode(),
                maxPlayers: roomOptions.maxPlayers,
                currentPlayers: 1,
                players: [
                    { ...this.playerData, isReady: false }
                ],
                status: 'waiting',
                difficulty: roomOptions.difficulty,
                category: roomOptions.category || 'random',
                isPrivate: roomOptions.isPrivate || false,
                createdBy: this.playerData.id,
                createdAt: new Date().toISOString()
            };

            // In a real implementation, this would save to Supabase
            this.mockRooms.push(room);
            this.currentRoom = room;

            this.emit('roomCreated', room);
            return room;
        } catch (error) {
            console.error('Error creating room:', error);
            this.emit('error', error);
            throw error;
        }
    }

    // Join a room by ID
    async joinRoom(roomId, playerData) {
        try {
            if (!this.isConnected) {
                await this.connect();
            }

            this.playerData = playerData;

            // Find the room
            const room = this.mockRooms.find(r => r.id === roomId);
            if (!room) {
                throw new Error('Room not found');
            }

            // Check if room is full
            if (room.currentPlayers >= room.maxPlayers) {
                throw new Error('Room is full');
            }

            // Add player to room
            room.players.push({ ...this.playerData, isReady: false });
            room.currentPlayers++;

            this.currentRoom = room;

            this.emit('roomJoined', room);
            return room;
        } catch (error) {
            console.error('Error joining room:', error);
            this.emit('error', error);
            throw error;
        }
    }

    // Find a room by code
    async findRoomByCode(roomCode) {
        try {
            const room = this.mockRooms.find(r => r.code === roomCode);
            return room || null;
        } catch (error) {
            console.error('Error finding room:', error);
            this.emit('error', error);
            return null;
        }
    }

    // Leave the current room
    leaveRoom() {
        if (!this.currentRoom) return;

        // Remove player from room
        const playerIndex = this.currentRoom.players.findIndex(p => p.id === this.playerData.id);
        if (playerIndex !== -1) {
            this.currentRoom.players.splice(playerIndex, 1);
            this.currentRoom.currentPlayers--;
        }

        // Remove room if empty
        if (this.currentRoom.currentPlayers === 0) {
            const roomIndex = this.mockRooms.findIndex(r => r.id === this.currentRoom.id);
            if (roomIndex !== -1) {
                this.mockRooms.splice(roomIndex, 1);
            }
        }

        this.emit('roomLeft', this.currentRoom);
        this.currentRoom = null;
    }

    // Toggle ready status
    toggleReady() {
        if (!this.currentRoom) return;

        const player = this.currentRoom.players.find(p => p.id === this.playerData.id);
        if (player) {
            player.isReady = !player.isReady;
            this.emit('playerReady', player);

            // Check if all players are ready
            const allReady = this.currentRoom.players.every(p => p.isReady);
            if (allReady && this.currentRoom.currentPlayers >= 2) {
                this.startGame();
            }
        }
    }

    // Start the game
    startGame() {
        if (!this.currentRoom) return;

        this.currentRoom.status = 'playing';
        this.currentRoom.startedAt = new Date().toISOString();

        // In a real implementation, this would select a word and start the game
        const gameData = {
            roomId: this.currentRoom.id,
            word: 'HANGMAN', // Would be randomly selected
            hint: 'The name of this game',
            category: this.currentRoom.category,
            difficulty: this.currentRoom.difficulty,
            players: this.currentRoom.players,
            maxWrongGuesses: this.getMaxWrongGuesses(this.currentRoom.difficulty)
        };

        this.emit('gameStarted', gameData);
    }

    // Get max wrong guesses based on difficulty
    getMaxWrongGuesses(difficulty) {
        switch (difficulty) {
            case 'easy': return 8;
            case 'medium': return 6;
            case 'hard': return 4;
            default: return 6;
        }
    }

    // Send a guess to other players
    sendGuess(letter, correct) {
        if (!this.currentRoom) return;

        const guessData = {
            playerId: this.playerData.id,
            letter,
            correct,
            timestamp: new Date().toISOString()
        };

        this.emit('guessMade', guessData);
    }

    // Send a chat message
    sendChatMessage(message) {
        if (!this.currentRoom) return;

        const chatData = {
            playerId: this.playerData.id,
            playerUsername: this.playerData.username,
            message,
            timestamp: new Date().toISOString()
        };

        this.emit('chatMessage', chatData);
    }

    // Get available rooms
    getAvailableRooms() {
        return this.mockRooms.filter(room => 
            !room.isPrivate && 
            room.status === 'waiting' && 
            room.currentPlayers < room.maxPlayers
        );
    }

    // Get current room
    getCurrentRoom() {
        return this.currentRoom;
    }

    // Check if connected to multiplayer service
    isConnectedToService() {
        return this.isConnected;
    }

    // Play again in the current room
    playAgain() {
        if (!this.currentRoom) return;

        // Reset room status
        this.currentRoom.status = 'waiting';
        this.currentRoom.players.forEach(player => {
            player.isReady = false;
        });

        this.emit('playAgain', this.currentRoom);
    }

    // Get player data
    getPlayerData() {
        return this.playerData;
    }

    // Set player data
    setPlayerData(playerData) {
        this.playerData = playerData;
    }

    // Simulate receiving a guess from another player
    simulateGuess(playerId, letter, correct) {
        if (!this.currentRoom) return;

        const player = this.currentRoom.players.find(p => p.id === playerId);
        if (!player) return;

        const guessData = {
            playerId,
            playerUsername: player.username,
            letter,
            correct,
            timestamp: new Date().toISOString()
        };

        this.emit('guessReceived', guessData);
    }

    // Simulate receiving a chat message from another player
    simulateChatMessage(playerId, message) {
        if (!this.currentRoom) return;

        const player = this.currentRoom.players.find(p => p.id === playerId);
        if (!player) return;

        const chatData = {
            playerId,
            playerUsername: player.username,
            message,
            timestamp: new Date().toISOString()
        };

        this.emit('chatMessageReceived', chatData);
    }

    // Simulate a player joining the room
    simulatePlayerJoin(playerData) {
        if (!this.currentRoom) return;

        this.currentRoom.players.push(playerData);
        this.currentRoom.currentPlayers++;

        this.emit('playerJoined', playerData);
    }

    // Simulate a player leaving the room
    simulatePlayerLeave(playerId) {
        if (!this.currentRoom) return;

        const playerIndex = this.currentRoom.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
            const player = this.currentRoom.players[playerIndex];
            this.currentRoom.players.splice(playerIndex, 1);
            this.currentRoom.currentPlayers--;

            this.emit('playerLeft', player);
        }
    }

    // Simulate a player toggling ready status
    simulatePlayerReady(playerId) {
        if (!this.currentRoom) return;

        const player = this.currentRoom.players.find(p => p.id === playerId);
        if (player) {
            player.isReady = !player.isReady;
            this.emit('playerReady', player);

            // Check if all players are ready
            const allReady = this.currentRoom.players.every(p => p.isReady);
            if (allReady && this.currentRoom.currentPlayers >= 2) {
                this.startGame();
            }
        }
    }
}

export default MultiplayerManager;