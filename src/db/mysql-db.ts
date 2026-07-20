import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

import logger from '../lib/logger.ts';
const dbPath = path.join(process.cwd(), 'database.sqlite');
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
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  last_message TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  updated_at INTEGER,
  created_at INTEGER
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  created_at INTEGER
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
