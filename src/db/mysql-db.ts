import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

import logger from '../lib/logger.ts';

const dataDir = process.env.DATA_DIR || process.cwd();
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and to prevent database corruption
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Ensure tables exist
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  password TEXT,
  real_balance NUMERIC DEFAULT '0.00',
  demo_balance NUMERIC DEFAULT '10000.00',
  currency TEXT DEFAULT 'USD',
  tfa_enabled INTEGER DEFAULT 0,
  tfa_mode TEXT DEFAULT 'app',
  tfa_secret TEXT,
  is_verified INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  phone TEXT,
  country TEXT,
  status TEXT DEFAULT 'Standard',
  kyc_status TEXT DEFAULT 'unverified',
  referred_by_uid TEXT,
  referral_code TEXT,
  affiliate_balance NUMERIC DEFAULT '0.00',
  total_affiliate_earnings NUMERIC DEFAULT '0.00',
  referral_count INTEGER DEFAULT 0,
  custom_affiliate_share INTEGER,
  withdrawal_otp TEXT,
  withdrawal_otp_expires_at INTEGER,
  total_live_volume NUMERIC DEFAULT '0.00',
  updated_at INTEGER,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS leaderboard_stats (
  user_id TEXT PRIMARY KEY,
  total_profit NUMERIC DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  won_trades INTEGER DEFAULT 0,
  lost_trades INTEGER DEFAULT 0,
  draw_trades INTEGER DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  roi NUMERIC DEFAULT 0,
  last_trade_at INTEGER
);

CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_id TEXT,
  user_id TEXT NOT NULL,
  market_id TEXT NOT NULL,
  asset TEXT,
  amount NUMERIC NOT NULL,
  direction TEXT NOT NULL,
  type TEXT,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  duration INTEGER NOT NULL,
  time_left INTEGER,
  expiry_time INTEGER NOT NULL,
  expiration_time TEXT,
  is_demo INTEGER DEFAULT 1,
  account_type TEXT DEFAULT 'demo',
  tournament_id TEXT,
  status TEXT DEFAULT 'open',
  payout_amount NUMERIC,
  payout TEXT,
  settled_at INTEGER,
  updated_at INTEGER,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  method TEXT DEFAULT 'direct',
  tx_hash TEXT,
  details TEXT,
  updated_at INTEGER,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS login_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'success',
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS kyc_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  full_name TEXT,
  document_type TEXT,
  document_number TEXT,
  front_image TEXT,
  back_image TEXT,
  selfie_image TEXT,
  rejection_reason TEXT,
  updated_at INTEGER,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_email TEXT,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  message TEXT NOT NULL,
  last_message TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  assigned_agent_id TEXT,
  assigned_agent_name TEXT,
  assigned_agent_email TEXT,
  channel TEXT DEFAULT 'chat',
  rating INTEGER,
  rating_feedback TEXT,
  is_ai_handled INTEGER DEFAULT 1,
  closed_at INTEGER,
  first_response_at INTEGER,
  resolved_at INTEGER,
  updated_at INTEGER,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  sender_type TEXT DEFAULT 'user',
  sender_name TEXT,
  message TEXT NOT NULL,
  attachments TEXT,
  is_internal_note INTEGER DEFAULT 0,
  is_read INTEGER DEFAULT 0,
  is_admin INTEGER DEFAULT 0,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS support_canned_responses (
  id TEXT PRIMARY KEY,
  shortcut TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  content TEXT NOT NULL,
  created_by TEXT,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS agent_profiles (
  user_id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'support_agent',
  is_online INTEGER DEFAULT 1,
  max_chats INTEGER DEFAULT 5,
  active_chats_count INTEGER DEFAULT 0,
  last_active_at INTEGER
);
CREATE TABLE IF NOT EXISTS active_copies (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  master_id TEXT NOT NULL,
  master_name TEXT,
  country TEXT,
  amount NUMERIC,
  max_trade_amount NUMERIC DEFAULT 10,
  trades_limit INTEGER,
  stop_loss NUMERIC,
  take_profit NUMERIC,
  current_profit NUMERIC DEFAULT 0,
  win_rate NUMERIC DEFAULT 0,
  copied_trades INTEGER DEFAULT 0,
  status TEXT DEFAULT "active",
  started_at INTEGER
);

CREATE TABLE IF NOT EXISTS master_traders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  win_rate NUMERIC,
  profit NUMERIC,
  followers INTEGER
);

CREATE TABLE IF NOT EXISTS candles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pair TEXT NOT NULL,
  type TEXT NOT NULL,
  time INTEGER NOT NULL,
  open NUMERIC NOT NULL,
  high NUMERIC NOT NULL,
  low NUMERIC NOT NULL,
  close NUMERIC NOT NULL,
  volume NUMERIC NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS pair_type_time_idx ON candles (pair, type, time);
`);

// Auto-migrate missing columns for support system
const addColIfMissing = (table: string, colDef: string) => {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
  } catch (e) {
    // Column likely exists
  }
};

addColIfMissing('tickets', 'user_name TEXT');
addColIfMissing('tickets', 'user_email TEXT');
addColIfMissing('tickets', "category TEXT DEFAULT 'General'");
addColIfMissing('tickets', 'assigned_agent_id TEXT');
addColIfMissing('tickets', 'assigned_agent_name TEXT');
addColIfMissing('tickets', 'assigned_agent_email TEXT');
addColIfMissing('tickets', "channel TEXT DEFAULT 'chat'");
addColIfMissing('tickets', 'rating INTEGER');
addColIfMissing('tickets', 'rating_feedback TEXT');
addColIfMissing('tickets', 'is_ai_handled INTEGER DEFAULT 1');
addColIfMissing('tickets', 'closed_at INTEGER');
addColIfMissing('tickets', 'first_response_at INTEGER');
addColIfMissing('tickets', 'resolved_at INTEGER');

addColIfMissing('ticket_messages', "sender_type TEXT DEFAULT 'user'");
addColIfMissing('ticket_messages', 'sender_name TEXT');
addColIfMissing('ticket_messages', 'attachments TEXT');
addColIfMissing('ticket_messages', 'is_internal_note INTEGER DEFAULT 0');
addColIfMissing('ticket_messages', 'is_read INTEGER DEFAULT 0');

// Helper to convert '?' placeholders (SQLite uses '?' so no change needed)
// However, we might need to handle some MySQL specific syntax if it exists.

export async function query(sql: string, params: any[] = [], conn?: any) {
  const statement = db.prepare(sql);
  return statement.all(...params);
}

export async function get(sql: string, params: any[] = [], conn?: any) {
  const statement = db.prepare(sql);
  return statement.get(...params);
}

export async function run(sql: string, params: any[] = [], conn?: any) {
  const statement = db.prepare(sql);
  return statement.run(...params);
}

export async function transaction<T>(fn: (connection: any) => Promise<T>): Promise<T> {
  const execute = db.transaction(async (callback: any) => {
    return await callback();
  });
  
  // Note: better-sqlite3 transactions are synchronous by default, 
  // but we provide an async-looking wrapper for compatibility.
  return await fn(db);
}

export default db;
