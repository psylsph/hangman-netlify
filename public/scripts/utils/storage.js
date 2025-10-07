export class StorageManager {
    constructor() {
        this.storagePrefix = 'hangman_';
        this.playerDataKey = `${this.storagePrefix}playerData`;
        this.settingsKey = `${this.storagePrefix}settings`;
        this.achievementsKey = `${this.storagePrefix}achievements`;
        this.statsKey = `${this.storagePrefix}stats`;
    }

    // Player data management
    getPlayerData() {
        try {
            const data = localStorage.getItem(this.playerDataKey);
            return data ? JSON.parse(data) : this.getDefaultPlayerData();
        } catch (error) {
            console.error('Error loading player data:', error);
            return this.getDefaultPlayerData();
        }
    }

    savePlayerData(playerData) {
        try {
            localStorage.setItem(this.playerDataKey, JSON.stringify(playerData));
            return true;
        } catch (error) {
            console.error('Error saving player data:', error);
            return false;
        }
    }

    getDefaultPlayerData() {
        return {
            id: this.generateId(),
            username: '',
            avatar: '',
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            
            // Game statistics
            totalGames: 0,
            gamesWon: 0,
            gamesLost: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalScore: 0,
            
            // Category statistics
            categoryStats: {
                animals: { played: 0, won: 0 },
                countries: { played: 0, won: 0 },
                movies: { played: 0, won: 0 },
                sports: { played: 0, won: 0 },
                food: { played: 0, won: 0 },
                technology: { played: 0, won: 0 },
                science: { played: 0, won: 0 }
            },
            
            // Difficulty statistics
            difficultyStats: {
                easy: { played: 0, won: 0 },
                medium: { played: 0, won: 0 },
                hard: { played: 0, won: 0 }
            },
            
            // Multiplayer statistics
            multiplayerStats: {
                gamesPlayed: 0,
                gamesWon: 0,
                roomsCreated: 0,
                roomsJoined: 0
            }
        };
    }

    updatePlayerStats(gameResult) {
        const playerData = this.getPlayerData();
        
        // Update general stats
        playerData.totalGames++;
        if (gameResult.won) {
            playerData.gamesWon++;
            playerData.currentStreak++;
            playerData.bestStreak = Math.max(playerData.bestStreak, playerData.currentStreak);
        } else {
            playerData.gamesLost++;
            playerData.currentStreak = 0;
        }
        
        playerData.totalScore += gameResult.score;
        playerData.lastActive = new Date().toISOString();
        
        // Update category stats
        if (gameResult.category && playerData.categoryStats[gameResult.category]) {
            playerData.categoryStats[gameResult.category].played++;
            if (gameResult.won) {
                playerData.categoryStats[gameResult.category].won++;
            }
        }
        
        // Update difficulty stats
        if (gameResult.difficulty && playerData.difficultyStats[gameResult.difficulty]) {
            playerData.difficultyStats[gameResult.difficulty].played++;
            if (gameResult.won) {
                playerData.difficultyStats[gameResult.difficulty].won++;
            }
        }
        
        // Update multiplayer stats if applicable
        if (gameResult.isMultiplayer) {
            playerData.multiplayerStats.gamesPlayed++;
            if (gameResult.won) {
                playerData.multiplayerStats.gamesWon++;
            }
        }
        
        this.savePlayerData(playerData);
        return playerData;
    }

    // Settings management
    getSettings() {
        try {
            const data = localStorage.getItem(this.settingsKey);
            return data ? JSON.parse(data) : this.getDefaultSettings();
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    getDefaultSettings() {
        return {
            theme: 'light',
            soundEnabled: true,
            musicEnabled: false,
            soundVolume: 0.7,
            musicVolume: 0.5,
            animationsEnabled: true,
            notificationsEnabled: true,
            autoJoinRoom: false,
            showHints: true,
            difficulty: 'medium',
            category: 'random',
            language: 'en'
        };
    }

    getTheme() {
        const settings = this.getSettings();
        return settings.theme || 'light';
    }

    setTheme(theme) {
        const settings = this.getSettings();
        settings.theme = theme;
        return this.saveSettings(settings);
    }

    getSoundEnabled() {
        const settings = this.getSettings();
        return settings.soundEnabled !== false;
    }

    setSoundEnabled(enabled) {
        const settings = this.getSettings();
        settings.soundEnabled = enabled;
        return this.saveSettings(settings);
    }

    getMusicEnabled() {
        const settings = this.getSettings();
        return settings.musicEnabled || false;
    }

    setMusicEnabled(enabled) {
        const settings = this.getSettings();
        settings.musicEnabled = enabled;
        return this.saveSettings(settings);
    }

    getSoundVolume() {
        const settings = this.getSettings();
        return settings.soundVolume !== undefined ? settings.soundVolume : 0.7;
    }

    setSoundVolume(volume) {
        const settings = this.getSettings();
        settings.soundVolume = Math.max(0, Math.min(1, volume));
        return this.saveSettings(settings);
    }

    getMusicVolume() {
        const settings = this.getSettings();
        return settings.musicVolume !== undefined ? settings.musicVolume : 0.5;
    }

    setMusicVolume(volume) {
        const settings = this.getSettings();
        settings.musicVolume = Math.max(0, Math.min(1, volume));
        return this.saveSettings(settings);
    }

    // Achievements management
    getAchievements() {
        try {
            const data = localStorage.getItem(this.achievementsKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading achievements:', error);
            return {};
        }
    }

    saveAchievements(achievements) {
        try {
            localStorage.setItem(this.achievementsKey, JSON.stringify(achievements));
            return true;
        } catch (error) {
            console.error('Error saving achievements:', error);
            return false;
        }
    }

    unlockAchievement(achievementId) {
        const achievements = this.getAchievements();
        if (!achievements[achievementId]) {
            achievements[achievementId] = {
                unlocked: true,
                unlockedAt: new Date().toISOString()
            };
            this.saveAchievements(achievements);
            return true;
        }
        return false;
    }

    // Game statistics
    getStats() {
        try {
            const data = localStorage.getItem(this.statsKey);
            return data ? JSON.parse(data) : this.getDefaultStats();
        } catch (error) {
            console.error('Error loading stats:', error);
            return this.getDefaultStats();
        }
    }

    saveStats(stats) {
        try {
            localStorage.setItem(this.statsKey, JSON.stringify(stats));
            return true;
        } catch (error) {
            console.error('Error saving stats:', error);
            return false;
        }
    }

    getDefaultStats() {
        return {
            totalPlayTime: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            averageGameTime: 0,
            bestTime: 0,
            worstTime: 0,
            totalScore: 0,
            highScore: 0,
            averageScore: 0,
            perfectGames: 0,
            hintsUsed: 0,
            categoryStats: {},
            difficultyStats: {},
            dailyStats: {},
            weeklyStats: {},
            monthlyStats: {}
        };
    }

    updateStats(gameResult) {
        const stats = this.getStats();
        
        // Update general stats
        stats.totalPlayTime += gameResult.timeTaken || 0;
        stats.gamesPlayed++;
        
        if (gameResult.won) {
            stats.gamesWon++;
        } else {
            stats.gamesLost++;
        }
        
        // Update time stats
        if (gameResult.timeTaken) {
            if (stats.bestTime === 0 || gameResult.timeTaken < stats.bestTime) {
                stats.bestTime = gameResult.timeTaken;
            }
            if (gameResult.timeTaken > stats.worstTime) {
                stats.worstTime = gameResult.timeTaken;
            }
            
            stats.averageGameTime = (stats.averageGameTime * (stats.gamesPlayed - 1) + gameResult.timeTaken) / stats.gamesPlayed;
        }
        
        // Update score stats
        if (gameResult.score) {
            stats.totalScore += gameResult.score;
            if (gameResult.score > stats.highScore) {
                stats.highScore = gameResult.score;
            }
            stats.averageScore = stats.totalScore / stats.gamesPlayed;
        }
        
        // Update perfect games
        if (gameResult.won && gameResult.wrongGuesses === 0) {
            stats.perfectGames++;
        }
        
        // Update hints used
        if (gameResult.hintUsed) {
            stats.hintsUsed++;
        }
        
        // Update category stats
        if (gameResult.category) {
            if (!stats.categoryStats[gameResult.category]) {
                stats.categoryStats[gameResult.category] = { played: 0, won: 0, totalTime: 0, totalScore: 0 };
            }
            stats.categoryStats[gameResult.category].played++;
            if (gameResult.won) {
                stats.categoryStats[gameResult.category].won++;
            }
            if (gameResult.timeTaken) {
                stats.categoryStats[gameResult.category].totalTime += gameResult.timeTaken;
            }
            if (gameResult.score) {
                stats.categoryStats[gameResult.category].totalScore += gameResult.score;
            }
        }
        
        // Update difficulty stats
        if (gameResult.difficulty) {
            if (!stats.difficultyStats[gameResult.difficulty]) {
                stats.difficultyStats[gameResult.difficulty] = { played: 0, won: 0, totalTime: 0, totalScore: 0 };
            }
            stats.difficultyStats[gameResult.difficulty].played++;
            if (gameResult.won) {
                stats.difficultyStats[gameResult.difficulty].won++;
            }
            if (gameResult.timeTaken) {
                stats.difficultyStats[gameResult.difficulty].totalTime += gameResult.timeTaken;
            }
            if (gameResult.score) {
                stats.difficultyStats[gameResult.difficulty].totalScore += gameResult.score;
            }
        }
        
        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        if (!stats.dailyStats[today]) {
            stats.dailyStats[today] = { gamesPlayed: 0, gamesWon: 0, totalTime: 0, totalScore: 0 };
        }
        stats.dailyStats[today].gamesPlayed++;
        if (gameResult.won) {
            stats.dailyStats[today].gamesWon++;
        }
        if (gameResult.timeTaken) {
            stats.dailyStats[today].totalTime += gameResult.timeTaken;
        }
        if (gameResult.score) {
            stats.dailyStats[today].totalScore += gameResult.score;
        }
        
        this.saveStats(stats);
        return stats;
    }

    // Utility methods
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    clearAllData() {
        try {
            localStorage.removeItem(this.playerDataKey);
            localStorage.removeItem(this.settingsKey);
            localStorage.removeItem(this.achievementsKey);
            localStorage.removeItem(this.statsKey);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    exportData() {
        try {
            const data = {
                playerData: this.getPlayerData(),
                settings: this.getSettings(),
                achievements: this.getAchievements(),
                stats: this.getStats(),
                exportedAt: new Date().toISOString()
            };
            return JSON.stringify(data);
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.playerData) {
                this.savePlayerData(data.playerData);
            }
            
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            if (data.achievements) {
                this.saveAchievements(data.achievements);
            }
            
            if (data.stats) {
                this.saveStats(data.stats);
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
}

export default StorageManager;