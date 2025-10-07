# Hangman Game - Multiplayer with AI

A feature-rich hangman game built with modern web technologies, supporting both single-player (with AI opponent) and real-time multiplayer gameplay. Optimized for deployment on Netlify with Supabase for real-time features.

## Features

### Core Gameplay
- 🎮 Classic hangman game with modern UI
- 🤖 AI opponent with adjustable difficulty levels
- 👥 Real-time multiplayer support (2-4 players)
- 📱 Fully responsive design for all devices
- 🎨 Dark/Light theme toggle
- 🔊 Optional sound effects and animations

### Game Modes
- **Single Player**: Play against AI with three difficulty levels
- **Multiplayer**: Real-time gameplay with friends or random players
- **Quick Match**: Automatic matchmaking for instant games

### Content
- 📚 Multiple word categories (Animals, Countries, Movies, Sports, etc.)
- 🏆 Achievement system
- 📊 Global and friend leaderboards
- 💾 Persistent score tracking

### Social Features
- 💬 In-game chat
- 👥 Public and private game rooms
- 👤 Player profiles with statistics
- 🎮 Spectator mode

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (Real-time Database, Authentication)
- **Deployment**: Netlify (Static Hosting)
- **Build Tool**: Parcel
- **Real-time**: WebSockets via Supabase

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Git for version control
- Supabase account (for multiplayer features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/hangman-netlify.git
   cd hangman-netlify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:1234`

## Project Structure

```
hangman-netlify/
├── public/
│   ├── index.html              # Main HTML file
│   ├── styles/                 # CSS files
│   │   └── main.css
│   ├── scripts/                # JavaScript modules
│   │   ├── main.js            # Application entry point
│   │   ├── game/              # Game logic
│   │   │   ├── gameLogic.js
│   │   │   ├── aiPlayer.js
│   │   │   └── multiplayer.js
│   │   ├── ui/                # UI components
│   │   │   ├── domElements.js
│   │   │   ├── animations.js
│   │   │   └── soundEffects.js
│   │   └── utils/             # Utility functions
│   │       ├── helpers.js
│   │       ├── storage.js
│   │       └── wordManager.js
│   ├── assets/                # Static assets
│   │   ├── images/
│   │   ├── sounds/
│   │   └── icons/
│   └── data/                  # Game data
│       └── wordCategories.json
├── netlify/
│   └── functions/             # Serverless functions (if needed)
├── docs/                      # Documentation
│   ├── architecture.md
│   ├── game-flow.md
│   └── implementation-plan.md
├── package.json
├── netlify.toml
└── README.md
```

## Game Rules

### Basic Rules
1. Players take turns guessing letters to reveal a hidden word
2. Correct guesses reveal all instances of that letter
3. Wrong guesses add parts to the hangman drawing
4. Game ends when the word is guessed (win) or hangman is complete (lose)

### Multiplayer Rules
1. Players take turns guessing letters
2. Each correct guess earns points
3. Game continues until word is guessed or all players make maximum wrong guesses
4. Winner is determined by points earned

### Scoring System
- **Base Points**: 100 for completing a word
- **Difficulty Multiplier**: Easy (1x), Medium (1.5x), Hard (2x)
- **Time Bonus**: Up to 50 extra points for quick completion
- **Streak Bonus**: Consecutive wins increase multiplier

## Deployment

### Deploy to Netlify

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**
   - Sign up/login to Netlify
   - Click "New site from Git"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`

3. **Set Environment Variables**
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add your Supabase URL and anon key

4. **Deploy**
   - Netlify will automatically deploy on push to main branch
   - Your site will be available at a random Netlify subdomain

### Custom Domain (Optional)
1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Update DNS records as instructed by Netlify

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Style
This project uses ESLint and Prettier for code formatting. Please ensure your code follows the established patterns.

### Testing
```bash
npm test          # Run all tests
npm run test:unit # Run unit tests only
npm run test:e2e  # Run end-to-end tests
```

## Supabase Setup

### Database Tables
1. **players** - User profiles and statistics
2. **rooms** - Game room information
3. **game_sessions** - Active game data
4. **word_categories** - Word lists by category
5. **achievements** - Achievement definitions
6. **player_achievements** - Unlocked achievements

### Setting up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the provided SQL schema in the Supabase SQL editor
3. Enable Row Level Security (RLS) for all tables
4. Configure authentication providers as needed
5. Copy your project URL and anon key to `.env.local`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/yourusername/hangman-netlify/issues)
3. Create a [new issue](https://github.com/yourusername/hangman-netlify/issues/new)

## Roadmap

- [ ] Mobile app version
- [ ] Tournament mode
- [ ] Custom word lists
- [ ] More AI personalities
- [ ] Voice chat for multiplayer
- [ ] Integration with social platforms

## Acknowledgments

- Supabase for the excellent real-time backend
- Netlify for seamless static hosting
- The open-source community for inspiration and tools