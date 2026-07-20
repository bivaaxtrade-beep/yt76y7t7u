import { sqliteTable, integer, text, numeric, blob, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  password: text('password'),
  realBalance: numeric('real_balance').default('0.00'),
  demoBalance: numeric('demo_balance').default('10000.00'),
  currency: text('currency').default('USD'),
  tfaEnabled: integer('tfa_enabled', { mode: 'boolean' }).default(false),
  tfaMode: text('tfa_mode').default('app'),
  tfaSecret: text('tfa_secret'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  phone: text('phone'),
  country: text('country'),
  status: text('status').default('Standard'),
  kycStatus: text('kyc_status').default('unverified'),
  referredByUid: text('referred_by_uid'),
  referralCode: text('referral_code'),
  affiliateBalance: numeric('affiliate_balance').default('0.00'),
  totalAffiliateEarnings: numeric('total_affiliate_earnings').default('0.00'),
  referralCount: integer('referral_count').default(0),
  customAffiliateShare: integer('custom_affiliate_share'),
  withdrawalOtp: text('withdrawal_otp'),
  withdrawalOtpExpiresAt: integer('withdrawal_otp_expires_at', { mode: 'number' }),
  totalLiveVolume: numeric('total_live_volume').default('0.00'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const trades = sqliteTable('trades', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  firebaseId: text('firebase_id'),
  userId: text('user_id').notNull(),
  marketId: text('market_id').notNull(),
  asset: text('asset'),
  amount: numeric('amount').notNull(),
  direction: text('direction').notNull(),
  type: text('type'),
  entryPrice: numeric('entry_price').notNull(),
  exitPrice: numeric('exit_price'),
  duration: integer('duration').notNull(),
  timeLeft: integer('time_left'),
  expiryTime: integer('expiry_time', { mode: 'number' }).notNull(),
  expirationTime: text('expiration_time'),
  isDemo: integer('is_demo', { mode: 'boolean' }).default(true),
  accountType: text('account_type').default('demo'),
  tournamentId: text('tournament_id'),
  status: text('status').default('open'),
  payoutAmount: numeric('payout_amount'),
  payout: text('payout'),
  settledAt: integer('settled_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  amount: numeric('amount').notNull(),
  currency: text('currency').default('USD'),
  status: text('status').default('pending'),
  method: text('method').default('direct'),
  txHash: text('tx_hash'),
  details: text('details'), 
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id'),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const loginHistory = sqliteTable('login_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  status: text('status').default('success'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const kycRequests = sqliteTable('kyc_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  status: text('status').default('pending'),
  fullName: text('full_name'),
  documentType: text('document_type'),
  documentNumber: text('document_number'),
  frontImage: text('front_image'),
  backImage: text('back_image'),
  selfieImage: text('selfie_image'),
  rejectionReason: text('rejection_reason'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const tickets = sqliteTable('tickets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  lastMessage: text('last_message'),
  status: text('status').default('open'),
  priority: text('priority').default('medium'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

export const ticketMessages = sqliteTable('ticket_messages', {
  id: text('id').primaryKey(),
  ticketId: text('ticket_id').notNull(),
  userId: text('user_id').notNull(),
  message: text('message').notNull(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  trades: many(trades),
  transactions: many(transactions),
  kycRequests: many(kycRequests),
  tickets: many(tickets),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(users, {
    fields: [trades.userId],
    references: [users.uid],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.uid],
  }),
}));

export const kycRequestsRelations = relations(kycRequests, ({ one }) => ({
  user: one(users, {
    fields: [kycRequests.userId],
    references: [users.uid],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.uid],
  }),
  messages: many(ticketMessages),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
}));

export const candles = sqliteTable('candles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pair: text('pair').notNull(),
  type: text('type').notNull(), // 'real' or 'demo'
  time: integer('time').notNull(), // timestamp in seconds
  open: numeric('open').notNull(),
  high: numeric('high').notNull(),
  low: numeric('low').notNull(),
  close: numeric('close').notNull(),
  volume: numeric('volume').notNull(),
}, (table) => ({
  pairTypeTimeIdx: uniqueIndex('pair_type_time_idx').on(table.pair, table.type, table.time),
}));


