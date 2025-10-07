# Hangman Game Flow Diagrams

## User Journey Flow

```mermaid
graph TD
    A[Landing Page] --> B{Game Mode Selection}
    B -->|Single Player| C[Difficulty Selection]
    B -->|Multiplayer| D[Room Selection]
    B -->|Quick Match| E[Matchmaking]
    
    C --> F[Category Selection]
    F --> G[Start Single Player Game]
    
    D --> H{Join Room}
    H -->|Create Room| I[Room Configuration]
    H -->|Join Existing| J[Room Browser]
    I --> K[Waiting for Players]
    J --> K
    K --> L[Start Multiplayer Game]
    
    E --> M[Finding Match]
    M --> L
    
    G --> N[Gameplay Loop]
    L --> N
    
    N --> O{Game Over?}
    O -->|No| N
    O -->|Yes| P[Game Results]
    P --> Q[Play Again?]
    Q -->|Yes| B
    Q -->|No| A
```

## Multiplayer Game Flow

```mermaid
sequenceDiagram
    participant P1 as Player 1
    participant P2 as Player 2
    participant S as Supabase
    participant G as Game Logic
    
    P1->>S: Create Room
    S-->>P1: Room ID
    P1->>S: Join Room
    P2->>S: Join Room with ID
    S-->>P2: Room Joined
    S-->>P1: Player 2 Joined
    P1->>G: Start Game
    G->>S: Select Random Word
    S-->>P1: Game Started
    S-->>P2: Game Started
    
    loop Game Turns
        P1->>S: Guess Letter
        S->>G: Validate Guess
        G-->>S: Guess Result
        S-->>P1: Update UI
        S-->>P2: Update Opponent UI
        
        alt Game Not Over
            P2->>S: Guess Letter
            S->>G: Validate Guess
            G-->>S: Guess Result
            S-->>P2: Update UI
            S-->>P1: Update Opponent UI
        end
    end
    
    Game Over->>S: Update Scores
    S-->>P1: Show Results
    S-->>P2: Show Results
```

## AI Player Logic Flow

```mermaid
graph TD
    A[AI Turn Start] --> B{Difficulty Level}
    B -->|Easy| C[Random Letter Guess]
    B -->|Medium| D[Basic Frequency Analysis]
    B -->|Hard| E[Advanced Pattern Recognition]
    
    C --> F[Select Random UnGuessed Letter]
    D --> G[Calculate Letter Frequencies]
    E --> H[Analyze Word Patterns]
    
    G --> I[Select Most Likely Letter]
    H --> I
    
    F --> J[Make Guess]
    I --> J
    
    J --> K{Guess Correct?}
    K -->|Yes| L[Update AI Knowledge]
    K -->|No| M[Update Wrong Guesses]
    
    L --> N[AI Turn End]
    M --> N
```

## Game States Management

```mermaid
stateDiagram-v2
    [*] --> Landing
    Landing --> Menu: User Interaction
    Menu --> SinglePlayer: Select Single Player
    Menu --> Multiplayer: Select Multiplayer
    Menu --> QuickMatch: Select Quick Match
    
    SinglePlayer --> CategorySelection: Choose Difficulty
    CategorySelection --> Playing: Select Category
    
    Multiplayer --> RoomBrowser: Select Join Room
    Multiplayer --> CreateRoom: Select Create Room
    RoomBrowser --> WaitingRoom: Join Room
    CreateRoom --> WaitingRoom: Create Room
    WaitingRoom --> Playing: All Players Ready
    
    QuickMatch --> Matchmaking: Start Matching
    Matchmaking --> Playing: Match Found
    
    Playing --> GameOver: Game End
    GameOver --> Results: Show Results
    Results --> Menu: Play Again
    Results --> Landing: Exit Game
```

## Real-time Data Synchronization

```mermaid
graph LR
    subgraph "Client 1"
        A1[Game State]
        B1[UI Components]
    end
    
    subgraph "Client 2"
        A2[Game State]
        B2[UI Components]
    end
    
    subgraph "Client N"
        AN[Game State]
        BN[UI Components]
    end
    
    subgraph "Supabase Backend"
        S[Real-time Database]
        R[Room Management]
        G[Game Logic]
    end
    
    A1 --> S
    A2 --> S
    AN --> S
    
    S --> R
    R --> G
    G --> S
    
    S --> A1
    S --> A2
    S --> AN
    
    A1 --> B1
    A2 --> B2
    AN --> BN
```

## Component Architecture

```mermaid
graph TD
    A[App Component] --> B[Router]
    B --> C[Landing Page]
    B --> D[Menu]
    B --> E[Game]
    B --> F[Results]
    
    E --> G[Game Header]
    E --> H[Hangman Drawing]
    E --> I[Word Display]
    E --> J[Keyboard]
    E --> K[Player List]
    E --> L[Chat]
    
    G --> M[Timer]
    G --> N[Score]
    G --> O[Category]
    
    K --> P[Player Card]
    P --> Q[Avatar]
    P --> R[Name]
    P --> S[Status]
    
    L --> T[Message List]
    L --> U[Input Form]