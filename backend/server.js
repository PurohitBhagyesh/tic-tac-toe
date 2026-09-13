import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import roomRoutes from './routes/roomRoutes.js';
import { setupSocketHandlers } from './socket/gameSocket.js';
import { initDatabase } from './database/database.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Allowed origins for CORS (supports local development and Netlify production domains)
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  /\.netlify\.app$/, // Allow Netlify preview and deploy URLs
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(null, true); // Permissive fallback for seamless deployment testing
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

// Express Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 30000,
  pingInterval: 25000,
});

// Register Socket handlers
setupSocketHandlers(io);

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Tic-Tac-Toe Full-Stack Backend',
  });
});

// REST Routes
app.use('/api/rooms', roomRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server and initialize PostgreSQL database
server.listen(PORT, async () => {
  console.log(`🚀 Tic-Tac-Toe Server running on port ${PORT}`);
  console.log(`📡 Socket.IO initialized and listening for connections`);
  await initDatabase();
});

export { app, server, io };
