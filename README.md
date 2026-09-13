# 🎮 Tic-Tac-Toe - Full-Stack Real-Time Web Application

A modern, production-ready, full-stack Tic-Tac-Toe web application featuring an **iOS Liquid Glass Theme**, **Singleplayer against AI** (Easy, Medium, and unbeatable Hard Minimax), **Real-Time Multiplayer** powered by **Socket.IO**, 6-digit room codes, **QR-code room joining and camera scanning**, 5-round competitive matches, score tracking, rematch agreements, and **PostgreSQL (Supabase)** database persistence.

---

## 🚀 Try Demo

Experience the full interactive game live in your browser:

[![Live Demo](https://img.shields.io/badge/🎮%20Try%20Live%20Demo-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://tictactoegamearena.netlify.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/PurohitBhagyesh/tic-tac-toe)

🌐 **Live Demo URL**: **[https://tictactoegamearena.netlify.app/](https://tictactoegamearena.netlify.app/)**

- 🤖 **Singleplayer Mode**: Play against Easy, Medium, or unbeatable Hard Minimax AI with customizable turn timers.
- 👥 **Multiplayer Arena**: Create or join 6-digit rooms with live camera QR scanning and sub-100ms real-time moves.
- 🏆 **5-Round Matches & Outcome Screens**: Complete with celebration trophies, live score tracking, and 1-click Rematch agreements.

---

## 📸 Screenshots & UI Showcase

| Home Screen | Singleplayer Arena |
| :---: | :---: |
| ![Home Screen](screenshots/home_screen.png) | ![Singleplayer Game](screenshots/singleplayer_game.png) |

| Victory Outcome Modal | Multiplayer Lobby & Rooms |
| :---: | :---: |
| ![Victory Modal](screenshots/victory_outcome_modal.png) | ![Multiplayer Selection](screenshots/multiplayer_menu.png) |

---

## 🌟 Key Features

1. **iOS Liquid Glass Aesthetic**:
   - Apple SF Pro typography, dynamic squircle acrylic tiles, specular edge highlights, and live floating liquid ambient orbs.
   - Clean iOS segmented controls for AI difficulty (`Easy` \| `Medium` \| `Hard`) and Turn Timer (`60s` \| `30s` \| `Off`).
   - Grouped settings card with sliding toggle switches.
2. **Dedicated Finish & Outcome Screen Modal**:
   - Displays animated trophy / badges on round completion (Win 🏆, Defeat 💀, Draw 🤝, Timeout ⏳, Forfeit 🏳️).
   - Live Scoreboard Card (`Player X` vs `AI O`, `Draws`, Win Rate).
   - 1-Click **"PLAY AGAIN"** button to immediately restart rounds cleanly, plus **"View Board"** to review winning combinations.
3. **Singleplayer AI Modes**:
   - **Easy**: Random empty cell selection.
   - **Medium**: Blocks wins, seizes immediate winning moves, center/corners heuristics.
   - **Hard**: Unbeatable optimal Minimax algorithm with recursive depth evaluation.
4. **Real-Time Multiplayer with Socket.IO**:
   - Instant move synchronization between devices with sub-100ms latency.
   - Authoritative server validation to prevent illegal moves, double moves, and turn spoofing.
5. **Room System & 6-Digit Codes**:
   - Cryptographically random, unique 6-digit room codes (e.g. `482731`).
6. **QR Code Sharing & Camera Scanner**:
   - Host generates instant QR code containing join URL.
   - Opponents can scan with their phone camera using the integrated scanner or join directly via share link.
7. **Lobby & Ready System**:
   - Real-time synchronization of player names, symbols (X / O), and ready states.
   - Match starts when both players are ready and host initiates.
8. **5-Round Competitive Matches & Turn Timers**:
   - Structured 5-round matches with live scoreboards (`Player 1: 3` vs `Player 2: 2`).
   - Turn Timers: Customizable in Singleplayer; Mandatory 2-minute limit per turn in Multiplayer.
   - Alternating starting turns each round.
9. **Rematch & Forfeit System**:
   - Mutual rematch agreement system (restarts match only when both players accept).
   - "Give Up" forfeit modal and timeout loss detection.
   - Three-dot game options menu with interactive Game Rules modal.
10. **PostgreSQL / Supabase Integration**:
    - Automatic database table creation (`rooms`, `players`, `matches`, `rounds`).
    - Foreign keys, parameterized SQL queries, and connection pooling with `pg`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, CSS Design System, Socket.IO Client, Lucide Icons, QR Code SVG, HTML5 QR Scanner, Canvas Confetti |
| **Backend** | Node.js, Express.js, Socket.IO, CORS, Dotenv, UUID |
| **Database** | PostgreSQL (Supabase / Neon / Local PostgreSQL) |
| **Deployment** | Netlify (Frontend), Render / Railway (Backend), Supabase (Database) |

---

## 🏗️ Architecture & Communication Flow

```
                     USERS
               /               \
        Player 1 (Host)    Player 2 (Joiner)
              │                    │
              ▼                    ▼
     Netlify React App     Netlify React App
              │                    │
              └──────────┬─────────┘
                         │ REST API & Real-Time WebSockets
                         ▼
               Render Node.js Backend
                 Express + Socket.IO
                         │
                         │ Authoritative Move Validation
                         │ Parameterized SQL
                         ▼
                Supabase PostgreSQL
           (rooms, players, matches, rounds)
```

---

## 📂 Project Structure

```
tic-tac-toe/
├── database/
│   └── schema.sql                  # PostgreSQL table schemas and indexes
├── backend/
│   ├── database/
│   │   └── database.js             # pg Connection Pool & auto schema init
│   ├── services/
│   │   ├── roomService.js          # Room lifecycle, 6-digit codes, player tracking
│   │   └── gameService.js          # Authoritative game logic, 5 rounds, win & draw checks
│   ├── controllers/
│   │   └── roomController.js       # REST endpoint controllers
│   ├── routes/
│   │   └── roomRoutes.js           # REST API routes
│   ├── socket/
│   │   └── gameSocket.js           # Socket.IO event handlers
│   ├── middleware/
│   │   └── errorHandler.js         # Centralized error handler
│   ├── server.js                   # Express + Socket.IO server entrypoint
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.jsx          # Reusable styled button
│   │   │   ├── ConfirmModal.jsx    # Glassmorphic modal (Give up / Leave)
│   │   │   ├── GameBoard.jsx       # 3x3 interactive board with win line highlight
│   │   │   ├── Header.jsx          # Header with logo & ThreeDotMenu
│   │   │   ├── PlayerCard.jsx      # Player badge, score, turn glow & ready pill
│   │   │   ├── PlayerStatus.jsx    # Game commentary & turn indicator
│   │   │   ├── QRCodeDisplay.jsx   # QR code generation & link sharing
│   │   │   ├── QRScannerModal.jsx  # Live camera QR scanner
│   │   │   ├── RoomCode.jsx        # 6-digit code display with copy
│   │   │   └── ThreeDotMenu.jsx    # Menu with Rules, Give up, Leave
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Welcome screen & mode selection
│   │   │   ├── SinglePlayer.jsx    # AI game setup & 1v1 AI gameplay
│   │   │   ├── Multiplayer.jsx     # Choose Create Room or Join Room
│   │   │   ├── CreateRoom.jsx      # Host room, 6-digit code & QR display
│   │   │   ├── JoinRoom.jsx        # Enter code or scan QR
│   │   │   ├── Lobby.jsx           # 2-player ready check screen
│   │   │   ├── Game.jsx            # 5-round real-time multiplayer screen
│   │   │   └── Result.jsx          # Final match result & Rematch sync
│   │   ├── services/
│   │   │   ├── api.js              # Centralized REST client
│   │   │   └── socket.js           # Socket.IO client singleton & event emitters
│   │   ├── utils/
│   │   │   ├── gameLogic.js        # Easy, Medium, Hard Minimax AI & win checkers
│   │   │   └── storage.js          # LocalStorage preferences helper
│   │   ├── App.jsx                 # React Router routing
│   │   ├── main.jsx                # React root DOM mount
│   │   └── index.css               # Gaming design system & responsive layout
│   ├── netlify.toml                # Netlify SPA redirect rules
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** v18 or higher (`node -v`)
- **npm** v9 or higher (`npm -v`)
- **PostgreSQL Database** (e.g. free cloud database on [Supabase](https://supabase.com) or local PostgreSQL)

---

### Step 1: Clone and Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT].supabase.co:5432/postgres
CLIENT_URL=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```
> Server runs on `http://localhost:5000` and initializes PostgreSQL tables automatically.

---

### Step 2: Setup and Run Frontend

In a separate terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:
```bash
npm run dev
```
> Open your browser at `http://localhost:5173`.

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

1. Create a free project on [Supabase](https://supabase.com).
2. Go to **Project Settings** → **Database** → copy the **Connection string (URI)**.
3. Paste the connection string into `backend/.env` as `DATABASE_URL`.
4. The server will automatically execute the table migrations on startup. You can also run `database/schema.sql` directly in the Supabase SQL Editor.

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend and service health check |
| `POST` | `/api/rooms` | Create a new room with host player name |
| `GET` | `/api/rooms/:code` | Retrieve current room state and player list |
| `POST` | `/api/rooms/:code/join` | Join room as Player 2 |
| `POST` | `/api/rooms/:code/ready` | Toggle ready status |
| `POST` | `/api/rooms/:code/rematch` | Submit rematch request |
| `DELETE` | `/api/rooms/:code` | Leave and clean up room |

---

## 📡 Socket.IO Real-Time Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `room:join` | Client ➔ Server | `{ roomCode, playerId }` | Joins room socket channel |
| `room:playerJoined` | Server ➔ Room | `{ room, playerId, message }` | Broadcasts when Player 2 connects |
| `room:ready` | Client ➔ Server | `{ roomCode, playerId, ready }` | Updates ready status |
| `game:start` | Server ➔ Room | `{ room, message }` | Auto-triggered when both players are ready |
| `game:move` | Client ➔ Server | `{ roomCode, playerId, cellIndex }` | Sends requested move (authoritative) |
| `game:update` | Server ➔ Room | `{ room, lastMove }` | Broadcasts updated board and turn |
| `game:roundEnd` | Server ➔ Room | `{ room, roundWinner, scores }` | Broadcasts round winner & updated scores |
| `game:nextRound` | Client ➔ Server | `{ roomCode }` | Advances to the next round in 5-round match |
| `game:matchEnd` | Server ➔ Room | `{ room, matchWinner, scores }` | Broadcasts final winner after 5 rounds |
| `game:giveUp` | Client ➔ Server | `{ roomCode, playerId }` | Forfeits match to opponent |
| `game:rematch` | Client ➔ Server | `{ roomCode, playerId }` | Votes for rematch |
| `room:leave` | Client ➔ Server | `{ roomCode, playerId }` | Leaves room and notifies remaining player |

---

## 🚢 Deployment Guide

### 1. Database: Supabase
- Create a project on [Supabase](https://supabase.com).
- Copy the PostgreSQL URI from database settings.

### 2. Backend: Render
- Create a new **Web Service** on [Render](https://render.com).
- Connect your repository and set Root Directory to `backend`.
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- Add Environment Variables:
  - `PORT`: `5000` (or leave default Render port)
  - `DATABASE_URL`: `postgresql://...` (your Supabase connection URI)
  - `CLIENT_URL`: `https://your-app.netlify.app` (your Netlify frontend domain)

### 3. Frontend: Netlify
- Create a new site on [Netlify](https://netlify.com) from your Git repository.
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- Add Environment Variable:
  - `VITE_API_URL`: `https://your-backend.onrender.com` (your deployed Render URL)

---

## 👨‍💻 Developer & Author

**Bhagyesh Purohit**
- **GitHub**: [@PurohitBhagyesh](https://github.com/PurohitBhagyesh)
- **Repository**: [https://github.com/PurohitBhagyesh/tic-tac-toe](https://github.com/PurohitBhagyesh/tic-tac-toe)
- **Live Demo**: [https://tictactoegamearena.netlify.app/](https://tictactoegamearena.netlify.app/)

---

## 📄 License
MIT License. Built with 💙 by Bhagyesh Purohit for full-stack gaming demonstrations and competitions.

