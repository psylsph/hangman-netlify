# Database Schema for Hangman Game

This document outlines the database schema needed for the hangman game using Supabase (PostgreSQL).

## Tables

### 1. players

Stores user profiles and game statistics.

```sql
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Game statistics
  total_games INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  games_lost INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  
  -- Preferences
  theme VARCHAR(20) DEFAULT 'light',
  sound_enabled BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX idx_players_username ON players(username);
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_last_active ON players(last_active);
```

### 2. rooms

Stores game room information for multiplayer sessions.

```sql
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  is_private BOOLEAN DEFAULT false,
  max_players INTEGER DEFAULT 4,
  current_players INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'waiting', -- waiting, playing, finished
  
  -- Game settings
  game_mode VARCHAR(20) DEFAULT 'multiplayer', -- multiplayer, ai
  difficulty VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
  category VARCHAR(50),
  max_wrong_guesses INTEGER DEFAULT 6,
  
  -- Metadata
  created_by UUID REFERENCES players(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_created_by ON rooms(created_by);
```

### 3. room_players

Tracks players in each room.

```sql
CREATE TABLE room_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_ready BOOLEAN DEFAULT false,
  is_spectator BOOLEAN DEFAULT false,
  
  UNIQUE(room_id, player_id)
);

-- Indexes
CREATE INDEX idx_room_players_room_id ON room_players(room_id);
CREATE INDEX idx_room_players_player_id ON room_players(player_id);
```

### 4. game_sessions

Stores active and completed game sessions.

```sql
CREATE TABLE game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  word VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  difficulty VARCHAR(20),
  
  -- Game state
  guessed_letters TEXT[] DEFAULT '{}',
  wrong_guesses INTEGER DEFAULT 0,
  max_wrong_guesses INTEGER DEFAULT 6,
  status VARCHAR(20) DEFAULT 'active', -- active, won, lost
  
  -- Turn management
  current_turn UUID REFERENCES players(id),
  turn_order UUID[] DEFAULT '{}',
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  time_limit_seconds INTEGER DEFAULT 120,
  
  -- Results
  winner_id UUID REFERENCES players(id),
  final_scores JSONB DEFAULT '{}' -- {player_id: score}
);

-- Indexes
CREATE INDEX idx_game_sessions_room_id ON game_sessions(room_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_current_turn ON game_sessions(current_turn);
```

### 5. player_moves

Tracks individual player moves in games.

```sql
CREATE TABLE player_moves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  game_session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  letter CHAR(1),
  is_correct BOOLEAN,
  move_number INTEGER,
  made_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_player_moves_game_session_id ON player_moves(game_session_id);
CREATE INDEX idx_player_moves_player_id ON player_moves(player_id);
```

### 6. word_categories

Stores word lists by category and difficulty.

```sql
CREATE TABLE word_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_word_categories_name ON word_categories(name);
```

### 7. words

Stores individual words with metadata.

```sql
CREATE TABLE words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word VARCHAR(100) UNIQUE NOT NULL,
  category_id UUID REFERENCES word_categories(id),
  difficulty VARCHAR(20) NOT NULL, -- easy, medium, hard
  hint TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_words_category_id ON words(category_id);
CREATE INDEX idx_words_difficulty ON words(difficulty);
CREATE INDEX idx_words_word ON words(word);
```

### 8. achievements

Defines available achievements.

```sql
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  category VARCHAR(50), -- wins, streaks, speed, etc.
  requirement_type VARCHAR(50), -- games_won, streak, etc.
  requirement_value INTEGER,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_achievements_category ON achievements(category);
```

### 9. player_achievements

Tracks unlocked achievements for each player.

```sql
CREATE TABLE player_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(player_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_player_achievements_player_id ON player_achievements(player_id);
CREATE INDEX idx_player_achievements_achievement_id ON player_achievements(achievement_id);
```

### 10. chat_messages

Stores chat messages in game rooms.

```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- text, emote, system
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Players can only see/update their own profile
CREATE POLICY "Users can view own profile" ON players
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON players
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can view public rooms, but only creators can update
CREATE POLICY "Anyone can view rooms" ON rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update room" ON rooms
  FOR UPDATE USING (auth.uid() = created_by);

-- Room players policies
CREATE POLICY "Anyone can view room players" ON room_players
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join rooms" ON room_players
  FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can leave rooms" ON room_players
  FOR DELETE USING (auth.uid() = player_id);

-- Game sessions policies
CREATE POLICY "Room participants can view game sessions" ON game_sessions
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM room_players WHERE player_id = auth.uid()
    )
  );

-- Chat messages policies
CREATE POLICY "Room participants can view chat" ON chat_messages
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM room_players WHERE player_id = auth.uid()
    )
  );

CREATE POLICY "Room participants can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    player_id = auth.uid() AND
    room_id IN (
      SELECT room_id FROM room_players WHERE player_id = auth.uid()
    )
  );
```

## Functions and Triggers

```sql
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update room player count
CREATE OR REPLACE FUNCTION update_room_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE rooms SET current_players = current_players + 1 WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE rooms SET current_players = current_players - 1 WHERE id = OLD.room_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_room_player_count_trigger
  AFTER INSERT OR DELETE ON room_players
  FOR EACH ROW
  EXECUTE FUNCTION update_room_player_count();

-- Update player statistics
CREATE OR REPLACE FUNCTION update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'won' AND OLD.status = 'active' THEN
    UPDATE players SET 
      total_games = total_games + 1,
      games_won = games_won + 1,
      current_streak = current_streak + 1,
      best_streak = GREATEST(best_streak, current_streak + 1),
      total_score = total_score + COALESCE((final_scores->NEW.winner_id::text)::int, 0)
    WHERE id = NEW.winner_id;
    
    UPDATE players SET 
      total_games = total_games + 1,
      games_lost = games_lost + 1,
      current_streak = 0
    WHERE id != NEW.winner_id AND id IN (
      SELECT unnest(turn_order) FROM game_sessions WHERE id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_player_stats_trigger
  AFTER UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_player_stats();
```

## Initial Data

```sql
-- Insert word categories
INSERT INTO word_categories (name, description) VALUES
('Animals', 'Various animals from around the world'),
('Countries', 'Countries and territories'),
('Movies', 'Popular movies and TV shows'),
('Sports', 'Sports and athletic activities'),
('Food', 'Food and beverages'),
('Technology', 'Technology terms and brands'),
('Science', 'Scientific concepts and terms');

-- Insert sample words
INSERT INTO words (word, category_id, difficulty, hint) VALUES
('ELEPHANT', (SELECT id FROM word_categories WHERE name = 'Animals'), 'easy', 'Largest land animal'),
('PENGUIN', (SELECT id FROM word_categories WHERE name = 'Animals'), 'easy', 'Black and white bird that cannot fly'),
('BRAZIL', (SELECT id FROM word_categories WHERE name = 'Countries'), 'easy', 'Largest South American country'),
('JAPAN', (SELECT id FROM word_categories WHERE name = 'Countries'), 'easy', 'Island nation in East Asia'),
('TITANIC', (SELECT id FROM word_categories WHERE name = 'Movies'), 'easy', 'Famous ship movie'),
('AVATAR', (SELECT id FROM word_categories WHERE name = 'Movies'), 'easy', 'Blue alien movie'),
('SOCCER', (SELECT id FROM word_categories WHERE name = 'Sports'), 'easy', 'Most popular sport worldwide'),
('TENNIS', (SELECT id FROM word_categories WHERE name = 'Sports'), 'easy', 'Racket sport'),
('PIZZA', (SELECT id FROM word_categories WHERE name = 'Food'), 'easy', 'Italian dish with cheese'),
('SUSHI', (SELECT id FROM word_categories WHERE name = 'Food'), 'easy', 'Japanese rice dish'),
('INTERNET', (SELECT id FROM word_categories WHERE name = 'Technology'), 'medium', 'Global network'),
('ALGORITHM', (SELECT id FROM word_categories WHERE name = 'Technology'), 'hard', 'Step-by-step procedure'),
('PHOTOSYNTHESIS', (SELECT id FROM word_categories WHERE name = 'Science'), 'hard', 'Plant energy process');

-- Insert achievements
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points) VALUES
('First Win', 'Win your first game', '🏆', 'wins', 'games_won', 1, 10),
('Winning Streak', 'Win 3 games in a row', '🔥', 'streaks', 'streak', 3, 25),
('Speed Demon', 'Win a game in under 30 seconds', '⚡', 'speed', 'time', 30, 20),
('Perfect Game', 'Win without any wrong guesses', '💯', 'perfect', 'wrong_guesses', 0, 50),
('Social Butterfly', 'Play 10 multiplayer games', '👥', 'multiplayer', 'multiplayer_games', 10, 30),
('Category Master', 'Win a game in every category', '📚', 'categories', 'categories_won', 7, 40),
('Veteran', 'Play 50 games', '🎖️', 'total', 'total_games', 50, 35),
('Champion', 'Win 25 games', '👑', 'wins', 'games_won', 25, 60);
```

## Real-time Subscriptions

The following tables should have real-time subscriptions enabled:

1. `rooms` - For room updates and player joins/leaves
2. `game_sessions` - For game state changes
3. `chat_messages` - For real-time chat
4. `room_players` - For player status updates

To enable real-time in Supabase:

```sql
-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;