import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool = null;
let isConnected = false;

// Determine SSL config based on DATABASE_URL
const getPoolConfig = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

  return {
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
};

export const getPool = () => {
  if (!pool) {
    const config = getPoolConfig();
    if (config) {
      pool = new Pool(config);
      pool.on('error', (err) => {
        console.error('Unexpected PostgreSQL client error:', err.message);
      });
    }
  }
  return pool;
};

// Parameterized query helper
export const query = async (text, params = []) => {
  const activePool = getPool();
  if (!activePool) {
    console.warn('[Database] DATABASE_URL not set. Running in-memory cache mode.');
    return { rows: [] };
  }

  const client = await activePool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (error) {
    console.error(`[Database Error] Query: "${text}" | Error: ${error.message}`);
    throw error;
  } finally {
    client.release();
  }
};

// Auto-initialize schema if needed
export const initDatabase = async () => {
  const activePool = getPool();
  if (!activePool) {
    console.log('[Database] No DATABASE_URL provided. Please set DATABASE_URL in .env to persist matches to PostgreSQL/Supabase.');
    return;
  }

  try {
    console.log('[Database] Connecting to PostgreSQL database...');
    // Enable uuid-ossp
    await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create rooms
    await query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        room_code VARCHAR(6) UNIQUE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'waiting',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(room_code);
    `);

    // Create players
    await query(`
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        symbol VARCHAR(1) NOT NULL CHECK (symbol IN ('X', 'O')),
        ready BOOLEAN NOT NULL DEFAULT FALSE,
        connected BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
    `);

    // Create matches
    await query(`
      CREATE TABLE IF NOT EXISTS matches (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        player1_score INT NOT NULL DEFAULT 0,
        player2_score INT NOT NULL DEFAULT 0,
        current_round INT NOT NULL DEFAULT 1,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_matches_room_id ON matches(room_id);
    `);

    // Create rounds
    await query(`
      CREATE TABLE IF NOT EXISTS rounds (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
        round_number INT NOT NULL,
        winner VARCHAR(10),
        board_state TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_rounds_match_id ON rounds(match_id);
    `);

    isConnected = true;
    console.log('✅ [Database] PostgreSQL connected and schema verified successfully.');
  } catch (error) {
    console.error('⚠️ [Database] Failed to initialize PostgreSQL tables:', error.message);
    console.error('Check your DATABASE_URL in backend/.env');
  }
};

export const isDbConnected = () => isConnected;
