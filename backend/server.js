import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import roomRoutes from './routes/roomRoutes.js';
import { setupSocketHandlers } from './socket/gameSocket.js';
import { initDatabase, pool } from './database/database.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  /\.vercel\.app$/,
  /github\.io$/,
];

const corsOptions = {
  origin: (origin, callback) => {
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
      console.warn(`[CORS] Request origin blocked by CORS policy: ${origin}`);
      callback(new Error(`CORS policy error: Origin ${origin} is not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 30000,
  pingInterval: 25000,
});

setupSocketHandlers(io);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Tic-Tac-Toe Full-Stack Backend',
  });
});

app.use('/api/rooms', roomRoutes);
app.use(errorHandler);

const gracefulShutdown = () => {
  console.log('\n🛑 Received termination signal. Closing server and connections gracefully...');
  server.close(async () => {
    console.log('👋 Express server closed.');
    if (pool && typeof pool.end === 'function') {
      try {
        await pool.end();
        console.log('🗄️ Database pool closed.');
      } catch (err) {
        console.error('Error closing database pool:', err);
      }
    }
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

server.listen(PORT, async () => {
  console.log(`🚀 Tic-Tac-Toe Server running on port ${PORT}`);
  console.log(`📡 Socket.IO initialized and listening for connections`);
  await initDatabase();
});

export { app, server, io };
