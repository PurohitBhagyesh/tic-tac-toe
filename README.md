# 🎮 Tic-Tac-Toe — Full-Stack Real-Time Battle Arena

<div align="center">

[![Live Demo](https://img.shields.io/badge/Live%20Demo-tic--tac--toe--purohitbhagyesh.vercel.app-0070F3?style=for-the-badge&logo=vercel&logoColor=white)](https://tic-tac-toe-purohitbhagyesh.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/PurohitBhagyesh/tic-tac-toe)
[![Backend Status](https://img.shields.io/badge/Backend-Render%20Online-00C7B7?style=for-the-badge&logo=render&logoColor=white)](https://tic-tac-toe-xcsr.onrender.com/api/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B.svg?style=for-the-badge)](LICENSE)

<br/>

[![React 18](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.2.11-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.5-010101?style=flat-square&logo=socket.io&logoColor=white)](https://socket.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.19.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-Synthesizer-FF6F61?style=flat-square&logo=w3c&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

<br/>

**A state-of-the-art, responsive, full-stack Tic-Tac-Toe battle arena built with an iOS 18 Liquid Glass design system, sub-100ms real-time multiplayer over WebSockets, unbeatable recursive Minimax AI, live camera QR code scanner, 5-round tournament matches, procedural Web Audio synthesizer, and PostgreSQL data persistence.**

<br/>

[🕹️ Play Live Demo](https://tic-tac-toe-purohitbhagyesh.vercel.app) • [✨ Key Features](#-key-features) • [📸 UI Gallery](#-screenshots--ui-gallery) • [🛠️ Tech Stack](#️-technology-stack) • [🏗️ Architecture](#️-system-architecture--communication-flow) • [🚀 Quickstart](#-getting-started-locally) • [📡 API & WebSockets](#-rest-api-endpoints) • [🚢 Deployment](#-production-deployment-guide)

</div>

---

## 🌐 Live Deployment & Status

The application is deployed across global edge infrastructure for low-latency performance:

| Service | Platform | Endpoint / URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | **Vercel Edge** | [https://tic-tac-toe-purohitbhagyesh.vercel.app](https://tic-tac-toe-purohitbhagyesh.vercel.app) | ![Vercel](https://img.shields.io/badge/Deployed-0070F3?style=flat-square&logo=vercel&logoColor=white) |
| **Real-Time Backend** | **Render Cloud** | [https://tic-tac-toe-xcsr.onrender.com](https://tic-tac-toe-xcsr.onrender.com/api/health) | ![Render](https://img.shields.io/badge/Active-00C7B7?style=flat-square&logo=render&logoColor=white) |
| **Relational Database** | **Supabase (PostgreSQL)** | Managed Cloud PostgreSQL Cluster | ![Supabase](https://img.shields.io/badge/Connected-3ECF8E?style=flat-square&logo=supabase&logoColor=white) |

---

## 📸 Screenshots & UI Gallery

### 🌟 1. Landing & Singleplayer Match Experience

<table width="100%">
  <tr>
    <th width="50%" align="center">Welcome & Game Mode Selection</th>
    <th width="50%" align="center">Singleplayer Arena Configuration</th>
  </tr>
  <tr>
    <td align="center">
      <img src="screenshots/home_screen.png" alt="Home Screen" width="100%"/>
      <br/>
      <em>iOS Liquid Glass aesthetic with dynamic theme switcher</em>
    </td>
    <td align="center">
      <img src="screenshots/singleplayer_config.png" alt="Singleplayer Setup" width="100%"/>
      <br/>
      <em>AI difficulty & customizable turn timer setup</em>
    </td>
  </tr>
  <tr>
    <th width="50%" align="center">Live Arena vs Intelligent AI</th>
    <th width="50%" align="center">Victory Celebration Modal</th>
  </tr>
  <tr>
    <td align="center">
      <img src="screenshots/singleplayer_game.png" alt="Singleplayer Game" width="100%"/>
      <br/>
      <em>Active match with neon token glow & live countdown timers</em>
    </td>
    <td align="center">
      <img src="screenshots/victory_outcome_modal.png" alt="Victory Outcome Modal" width="100%"/>
      <br/>
      <em>Full-screen confetti explosion & animated winner badge</em>
    </td>
  </tr>
</table>

### ⚔️ 2. Real-Time Multiplayer Experience

<table width="100%">
  <tr>
    <th width="50%" align="center">2-Player Match Lobby & Ready Check</th>
    <th width="50%" align="center">5-Round Real-Time Multiplayer Battle</th>
  </tr>
  <tr>
    <td align="center">
      <img src="screenshots/multiplayer_lobby.png" alt="Multiplayer Lobby" width="100%"/>
      <br/>
      <em>Live player status cards and Ready check sync</em>
    </td>
    <td align="center">
      <img src="screenshots/multiplayer_game.png" alt="Multiplayer Game" width="100%"/>
      <br/>
      <em>Authoritative synchronized WebSocket match arena</em>
    </td>
  </tr>
  <tr>
    <th width="50%" align="center">Post-Match Tournament Finish Screen</th>
    <th width="50%" align="center">Dynamic Room Code & QR Code Generation</th>
  </tr>
  <tr>
    <td align="center">
      <img src="screenshots/finish_outcome_modal.png" alt="Finish Outcome Modal" width="100%"/>
      <br/>
      <em>Round-by-round point breakdown & mutual rematch sync</em>
    </td>
    <td align="center">
      <img src="screenshots/create_room.png" alt="Create Room" width="100%"/>
      <br/>
      <em>Instant 6-digit room code with dynamic SVG QR code</em>
    </td>
  </tr>
</table>

### 🔑 3. Room Hub & Game Settings

<table width="100%">
  <tr>
    <th width="50%" align="center">6-Digit Code Input & Live Camera Scanner</th>
    <th width="50%" align="center">Multiplayer Lobby Navigation Hub</th>
  </tr>
  <tr>
    <td align="center">
      <img src="screenshots/join_room.png" alt="Join Room" width="100%"/>
      <br/>
      <em>Direct numeric keypad input & camera scanner modal</em>
    </td>
    <td align="center">
      <img src="screenshots/multiplayer_menu.png" alt="Multiplayer Menu" width="100%"/>
      <br/>
      <em>Quick access to Host Room or Join Room</em>
    </td>
  </tr>
  <tr>
    <th colspan="2" align="center">Interactive Rules, Shortcuts & Audio Preferences</th>
  </tr>
  <tr>
    <td colspan="2" align="center">
      <img src="screenshots/game_rules_modal.png" alt="Game Rules Modal" width="70%"/>
      <br/>
      <em>Glassmorphic rules dialog, sound settings & developer attribution</em>
    </td>
  </tr>
</table>

---

## ✨ Key Features

### 💎 1. iOS 18 Liquid Glass Aesthetic & Dynamic Theme Engine
- **Apple SF Pro & Glassmorphic Elements**: Whitish-bluish translucent glass panels, specular edge reflections, multi-layer drop shadows, and backdrop blur (`backdrop-filter: blur(24px)`).
- **Ambient Glowing Liquid Orbs**: Floating animated gradient background orbs that bring the interface to life.
- **Dark & Light Mode Switcher**: Instant theme toggle with localStorage synchronization and theme-aware contrast adjustments.
- **Tactile iOS Segmented Controls**: Smooth pill sliders and toggle switches for difficulty selection and timer configuration.

### 🤖 2. Unbeatable AI Engine (Minimax Algorithm)
- **Easy Mode**: Casual gameplay with pseudo-random empty cell selection.
- **Medium Mode**: Strategic heuristic analysis that detects immediate winning lines and blocks opponent threats while prioritizing center and corners.
- **Hard Mode (Unbeatable Minimax)**: Full game tree minimax search with depth evaluation, guaranteeing mathematically optimal moves (the AI will never lose).
- **Configurable Turn Timers**: Choose between `30s`, `1 Min`, `2 Min`, or `Off` with live SVG progress rings and warning ticks.

### ⚡ 3. Sub-100ms Real-Time Multiplayer with Socket.IO
- **Bidirectional WebSocket Streaming**: Instant move reflection across devices with ultra-low latency.
- **Authoritative Server Validation**: Prevents invalid moves, race conditions, out-of-turn play, and double clicks.
- **Connection Health Monitor**: Visual connection status pill (`Live Connection` 🟢 vs `Reconnecting` 🟠).

### 📷 4. 6-Digit Room System & Live Camera QR Scanner
- **Clean 6-Digit Room Codes**: Easy-to-share alphanumeric room codes (e.g., `607141`).
- **Dynamic Vector QR Code Generator**: Renders crisp SVG QR codes instantly for mobile scanning.
- **Live Device Camera Barcode Scanner**: Built-in `html5-qrcode` scanner allows opponents to join instantly by scanning the host's screen.
- **1-Click Direct Share Link**: Automatically copies deep links (`/join/XXXXXX`) with auto-fill parameters.

### 🏆 5. 5-Round Competitive Matches & Tournament Scoring
- **Structured 5-Round Battle**: Tracks round-by-round points (`Player 1: 3` vs `Player 2: 2`) with alternating starters.
- **Full-Screen Canvas Confetti**: Dynamic particle bursts upon victory (`canvas-confetti`).
- **Rich Outcome Badges**: Distinct celebration cards for Victory (🏆), Defeat (💀), Draw (🤝), Timeout (⏳), and Forfeit (🏳️).
- **Mutual Rematch Synchronization**: Real-time ready check system that restarts the arena only when both players accept.

### 🎵 6. Zero-Asset Web Audio API Sound Synthesizer
- **Pure Procedural Audio Synthesis**: Generates all sound effects mathematically in real-time with zero external audio assets or network requests.
- **Tactile Sound Palette**:
  - `move_x`: High-frequency crisp electric chime.
  - `move_o`: Warm harmonic resonance tone.
  - `win`: Triumphant 4-note ascending arpeggio.
  - `draw`: Neutral resolving triad.
  - `tick`: Soft wooden countdown clock tick under 5 seconds.
  - `timeout`: Low warning buzzer.
  - `click / pop`: Subtle UI tactile interaction feedback.
- **Global Sound Mute**: Toggle sound effects on/off anytime from the menu.

### 🗄️ 7. PostgreSQL & Supabase Cloud Persistence
- **Automated Table Migrations**: Automatically provisions database tables (`rooms`, `players`, `matches`, `rounds`) upon server startup.
- **Connection Pooling**: Optimized PostgreSQL pooling using `pg` to manage concurrent match connections.

---

## 🛠️ Technology Stack

```mermaid
graph LR
    subgraph Frontend [Client Tier - React 18 & Vite]
        A[React 18 SPA] --> B[Vanilla CSS Design System]
        A --> C[Socket.IO Client]
        A --> D[Web Audio Synthesizer]
        A --> E[HTML5 QR Scanner]
    end

    subgraph Backend [Server Tier - Node.js & Express]
        F[Express.js REST API]
        G[Socket.IO WebSocket Server]
        H[Game & Room Services]
    end

    subgraph Database [Storage Tier - PostgreSQL]
        I[(Supabase Cloud DB)]
    end

    Frontend <==>|HTTP REST & WebSockets| Backend
    Backend <==>|Connection Pool / SQL| Database
```

| Layer | Technology | Details & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** (`18.3.1`) + **Vite 5** | High-performance component architecture, rapid HMR, and optimized bundle size |
| **Routing** | **React Router 6** (`6.23.1`) | Client-side routing with clean URL parameters and SPA fallback rewrites |
| **Design System** | **Vanilla CSS3** | Custom iOS Liquid Glass tokens, specular borders, backdrop filters, and CSS animations |
| **Iconography** | **Lucide React** (`0.378.0`) | Crisp vector icons for controls, themes, sound, and navigation |
| **Visual Effects** | **Canvas Confetti** (`1.9.3`) | Full-screen procedural particle physics celebrations |
| **QR Code Engine** | **qrcode.react** + **html5-qrcode** | Vector SVG QR code rendering & device camera barcode scanner |
| **Audio Engine** | **Web Audio API** | Real-time procedural sound synthesis with zero external files |
| **Real-Time Client** | **Socket.IO Client** (`4.7.5`) | Low-latency bi-directional WebSocket event bus |
| **Backend Framework** | **Node.js** + **Express.js** (`4.19.2`) | RESTful controllers, CORS handling, and room lifecycle management |
| **Real-Time Server** | **Socket.IO** (`4.7.5`) | Authoritative game state manager, event broadcaster, and room multiplexer |
| **Database** | **PostgreSQL** (**Supabase Cloud**) | Persistent relational storage for rooms, players, matches, and rounds |
| **Hosting & CI/CD** | **Vercel** + **Render** + **Supabase** | Edge CDN frontend on Vercel, Node.js WebSocket backend on Render, PostgreSQL on Supabase |

---

## 🏗️ System Architecture & Communication Flow

```
                             CLIENT (Vercel Frontend)
                    https://tic-tac-toe-purohitbhagyesh.vercel.app
                     ┌───────────────────┴───────────────────┐
                     │                                       │
            Player 1 (Host / X)                     Player 2 (Guest / O)
            • React 18 + Vite SPA                   • React 18 + Vite SPA
            • Web Audio Sound Synth                 • Web Audio Sound Synth
            • QR Code SVG Generator                 • HTML5 Camera Scanner
                     │                                       │
                     └───────────────────┬───────────────────┘
                                         │
                                         │ HTTP REST & WebSocket (Socket.IO)
                                         ▼
                             SERVER (Render Backend)
                         Node.js + Express + Socket.IO
                     ┌───────────────────────────────────────┐
                     │ • Room & Match Lifecycle Management   │
                     │ • Authoritative Move Validation       │
                     │ • 5-Round Scoring & Turn Rotation     │
                     │ • Minimax Singleplayer Algorithm      │
                     └───────────────────┬───────────────────┘
                                         │
                                         │ Parameterized SQL (`pg` Pool)
                                         ▼
                            DATABASE (Supabase Cloud)
                          Managed PostgreSQL Database
                     ┌───────────────────────────────────────┐
                     │ • `rooms` (code, status, round)       │
                     │ • `players` (name, symbol, score)     │
                     │ • `matches` (winner, total_rounds)    │
                     │ • `rounds` (board_state, winner)      │
                     └───────────────────────────────────────┘
```

---

## 📂 Project Structure

```
tic-tac-toe/
├── database/
│   └── schema.sql                  # PostgreSQL table schemas, constraints, and indexes
├── backend/
│   ├── database/
│   │   └── database.js             # pg Connection Pool & auto schema initialization
│   ├── services/
│   │   ├── roomService.js          # Room lifecycle, 6-digit codes, player tracking
│   │   └── gameService.js          # Authoritative game logic, 5-round scoring, win checks
│   ├── controllers/
│   │   └── roomController.js       # REST endpoint controllers
│   ├── routes/
│   │   └── roomRoutes.js           # REST API routes
│   ├── socket/
│   │   └── gameSocket.js           # Socket.IO real-time event handlers
│   ├── middleware/
│   │   └── errorHandler.js         # Centralized error handler
│   ├── server.js                   # Express + Socket.IO server entrypoint
│   ├── package.json                # Backend dependencies
│   └── .env.example                # Backend environment template
├── frontend/
│   ├── public/
│   │   └── favicon.svg             # Modern vector favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Button.jsx          # Reusable button with glowing & variant states
│   │   │   ├── ConfirmModal.jsx    # Confirmation modal (Give up / Leave Room)
│   │   │   ├── GameBoard.jsx       # 3x3 interactive board with win line highlight & animations
│   │   │   ├── Header.jsx          # Top navigation bar with logo & ThreeDotMenu
│   │   │   ├── PlayerCard.jsx      # Player badge, score counter & active turn glow
│   │   │   ├── PlayerStatus.jsx    # Real-time commentary & turn indicator
│   │   │   ├── QRCodeDisplay.jsx   # SVG QR code generation & link sharing
│   │   │   ├── QRScannerModal.jsx  # Live camera QR scanner with permission handling
│   │   │   ├── RoomCode.jsx        # 6-digit code display with 1-click clipboard copy
│   │   │   └── ThreeDotMenu.jsx    # Sliding sheet with Sound, Theme, Rules, Restart, Forfeit
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Welcome screen & mode selection
│   │   │   ├── SinglePlayer.jsx    # AI game setup, difficulty toggles, turn timers & arena
│   │   │   ├── Multiplayer.jsx     # Multiplayer hub (Create Room / Join Room)
│   │   │   ├── CreateRoom.jsx      # Host room, 6-digit code & dynamic QR display
│   │   │   ├── JoinRoom.jsx        # Enter code manually or scan with device camera
│   │   │   ├── Lobby.jsx           # 2-player ready check & host launch screen
│   │   │   ├── Game.jsx            # 5-round real-time multiplayer battle arena
│   │   │   └── Result.jsx          # Final tournament result, trophies & Rematch sync
│   │   ├── services/
│   │   │   ├── api.js              # Centralized REST API client
│   │   │   └── socket.js           # Socket.IO client singleton & event emitters
│   │   ├── utils/
│   │   │   ├── gameLogic.js        # Easy, Medium, Hard Minimax AI & winning line calculators
│   │   │   ├── sound.js            # Web Audio API synthesizer for sound effects
│   │   │   ├── theme.js            # Dark & Light theme manager with localStorage sync
│   │   │   └── storage.js          # LocalStorage helper for user preferences
│   │   ├── App.jsx                 # React Router routing configuration
│   │   ├── main.jsx                # React root DOM mount
│   │   └── index.css               # iOS Liquid Glass design system, CSS variables & animations
│   ├── package.json                # Frontend dependencies
│   └── .env.example                # Frontend environment template
├── screenshots/                    # High-resolution Retina screenshots of the UI
├── take_screenshots.mjs            # Automated headless screenshot generator script
├── vercel.json                     # Vercel SPA rewrite configuration
└── README.md                       # Comprehensive documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** v18.0.0 or higher (`node -v`)
- **npm** v9.0.0 or higher (`npm -v`)
- **PostgreSQL Database** (Free cloud instance on [Supabase](https://supabase.com) or local PostgreSQL)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/PurohitBhagyesh/tic-tac-toe.git
cd tic-tac-toe
```

---

### Step 2: Setup and Run Backend

1. Navigate to the `backend/` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   CLIENT_URL=http://localhost:5173
   ```

3. Start the backend development server:
   ```bash
   npm run dev
   ```
   > 🚀 The server will boot on `http://localhost:5000`, connect to PostgreSQL, and verify/create all required tables automatically.

---

### Step 3: Setup and Run Frontend

1. Open a new terminal window, navigate to the `frontend/` directory, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

The backend auto-initializes the PostgreSQL schema on startup. You can also inspect or run `database/schema.sql` directly:

```sql
-- 1. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(6) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'playing', 'finished')),
    current_round INT DEFAULT 1,
    max_rounds INT DEFAULT 5,
    turn_player_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Players Table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(1) CHECK (symbol IN ('X', 'O')),
    is_host BOOLEAN DEFAULT FALSE,
    is_ready BOOLEAN DEFAULT FALSE,
    score INT DEFAULT 0,
    socket_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id REFERENCES rooms(id) ON DELETE CASCADE,
    winner_id UUID REFERENCES players(id) ON DELETE SET NULL,
    total_rounds INT DEFAULT 5,
    final_score_p1 INT DEFAULT 0,
    final_score_p2 INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Rounds Table
CREATE TABLE IF NOT EXISTS rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    winner_id UUID REFERENCES players(id) ON DELETE SET NULL,
    board_state JSONB DEFAULT '["", "", "", "", "", "", "", "", ""]',
    is_draw BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description | Request Body | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status check | — | `{ status: "online", timestamp: "..." }` |
| `POST` | `/api/rooms` | Create a new 6-digit room | `{ playerName: "Alice" }` | `{ success: true, room: {...}, player: {...} }` |
| `GET` | `/api/rooms/:code` | Get current room state & players | — | `{ success: true, room: {...} }` |
| `POST` | `/api/rooms/:code/join` | Join room as Player 2 (O) | `{ playerName: "Bob" }` | `{ success: true, room: {...}, player: {...} }` |
| `POST` | `/api/rooms/:code/ready` | Toggle ready status | `{ playerId: "...", ready: true }` | `{ success: true, room: {...} }` |
| `POST` | `/api/rooms/:code/rematch` | Submit rematch request | `{ playerId: "..." }` | `{ success: true, room: {...} }` |
| `DELETE` | `/api/rooms/:code` | Leave room and clean up state | `{ playerId: "..." }` | `{ success: true, message: "Left room" }` |

---

## 📡 Socket.IO Real-Time Events Matrix

| Event Name | Direction | Payload Structure | Action & Description |
| :--- | :--- | :--- | :--- |
| `room:join` | Client ➔ Server | `{ roomCode, playerId }` | Connects player socket to the room channel |
| `room:playerJoined` | Server ➔ Room | `{ room, playerId, message }` | Notifies lobby that Player 2 has entered |
| `room:ready` | Client ➔ Server | `{ roomCode, playerId, ready }` | Updates player ready state in the lobby |
| `game:start` | Server ➔ Room | `{ room, message }` | Triggered when host starts match with both players ready |
| `game:move` | Client ➔ Server | `{ roomCode, playerId, cellIndex }` | Submits requested move for authoritative server check |
| `game:update` | Server ➔ Room | `{ room, lastMove, roundStatus }` | Broadcasts board update, active turn, and timer reset |
| `game:roundEnd` | Server ➔ Room | `{ room, roundWinner, scores, winPattern }` | Broadcasts round outcome and updated scores |
| `game:nextRound` | Client ➔ Server | `{ roomCode }` | Advances to the next round in a 5-round match |
| `game:matchEnd` | Server ➔ Room | `{ room, matchWinner, scores }` | Broadcasts final tournament champion after round 5 |
| `game:giveUp` | Client ➔ Server | `{ roomCode, playerId }` | Forfeits match to opponent immediately |
| `game:rematch` | Client ➔ Server | `{ roomCode, playerId }` | Registers rematch vote (triggers restart when both accept) |
| `room:leave` | Client ➔ Server | `{ roomCode, playerId }` | Gracefully disconnects and notifies remaining player |

---

## 🚢 Production Deployment Guide

### 1. Database Deployment (Supabase)
1. Sign up at [supabase.com](https://supabase.com) and create a free project.
2. Go to **Project Settings** → **Database** → copy the **Connection URI**.
3. Use this URI for `DATABASE_URL` in your backend deployment.

### 2. Backend Deployment (Render)
1. Create a new **Web Service** on [render.com](https://render.com).
2. Connect your GitHub repository `https://github.com/PurohitBhagyesh/tic-tac-toe`.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `DATABASE_URL`: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`
   - `CLIENT_URL`: `https://tic-tac-toe-purohitbhagyesh.vercel.app`

### 3. Frontend Deployment (Vercel)
1. Import repository on [vercel.com](https://vercel.com/new).
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or `frontend` if deploying without root `vercel.json`)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://tic-tac-toe-xcsr.onrender.com`
4. Click **Deploy**!
5. Your live app is live at: **[https://tic-tac-toe-purohitbhagyesh.vercel.app](https://tic-tac-toe-purohitbhagyesh.vercel.app)**

---

## 👨‍💻 Developer & Author

<div align="center">

**Bhagyesh Purohit**

[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/PurohitBhagyesh)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Play%20Now-0070F3?style=for-the-badge&logo=vercel&logoColor=white)](https://tic-tac-toe-purohitbhagyesh.vercel.app)

*Crafted with passion for interactive web engineering, competitive real-time algorithms, and modern iOS aesthetics.*

</div>

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
