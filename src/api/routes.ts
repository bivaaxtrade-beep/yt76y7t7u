import express, { Request, Response, NextFunction } from 'express';
import { get, query, run, transaction } from '../db/mysql-db.ts';
import { requireAuth, AuthRequest } from '../middleware/jwtAuth.ts';
import { createAuditLog } from '../lib/audit.ts';
import logger from '../lib/logger.ts';
import { getIO } from '../services/socketService.ts';
import { mapUserForFrontend } from '../lib/user-utils.ts';
import { GoogleGenAI, Type } from '@google/genai';
import { adminDb } from '../lib/firebase-admin.ts';

import { body, validationResult } from 'express-validator';

import { 
  markets_real, markets_demo, 
  systemActive, globalManipulationMode,
  setSystemActive, setGlobalManipulationMode
} from '../services/marketService.ts';

const router = express.Router();

// --- Market News ---
router.get('/news', async (req, res) => {
  try {
    // Return news as expected by NewsWidget and TradeTerminal
    res.json({
      news: [
        "Bitcoin surpasses $60,000 as institutional demand grows.",
        "Global markets rally as inflation data shows cooling trends.",
        "Gold hits record high amid geopolitical uncertainty.",
        "Central Bank hints at potential rate cuts by year-end.",
        "Tech sector leads gains in pre-market trading session."
      ],
      Data: [] // For compatibility with older news widget versions
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Market State ---
router.get('/market/state', (req, res) => {
  res.json({
    systemActive,
    globalManipulationMode,
    markets: markets_real
  });
});

router.post('/admin/system/toggle', (req, res) => {
  const { active } = req.body;
  setSystemActive(!!active);
  getIO().emit('system_status', !!active);
  res.json({ success: true, active: !!active });
});

router.post('/admin/manipulation/global', (req, res) => {
  const { mode } = req.body;
  setGlobalManipulationMode(mode);
  getIO().emit('global_manipulation_status', mode);
  res.json({ success: true, mode });
});

router.post('/admin/market/update', (req, res) => {
  const { pair, triggerNews, ...updates } = req.body;
  if (markets_real[pair]) {
    markets_real[pair] = { ...markets_real[pair], ...updates };
  }
  if (markets_demo[pair]) {
    markets_demo[pair] = { ...markets_demo[pair], ...updates };
  }

  if (triggerNews) {
    // We can't directly access otcEngine's internal state, 
    // but we can set a flag in marketService for otcEngine to pick up.
    // However, it's easier to just pass the news info through markets object if needed.
    // Let's add a newsTrigger field to the market object.
    markets_real[pair].newsTrigger = {
      intensity: 5 + Math.random() * 5,
      duration: 10000 + Math.random() * 10000,
      direction: Math.random() > 0.5 ? 1 : -1
    };
    markets_demo[pair].newsTrigger = markets_real[pair].newsTrigger;
  }

  getIO().emit('market_settings_updated', markets_real);
  res.json({ success: true });
});

router.post('/affiliate/next-id', async (req, res) => {
    try {
        let nextId = 10001;
        const row = await get('SELECT MAX(CAST(referral_code AS INTEGER)) as maxId FROM users') as any;
        if (row && row.maxId && row.maxId >= 10000) {
            nextId = parseInt(row.maxId) + 1;
        }
        res.json({ nextId });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});


// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is missing');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Data Mapping Helpers to bridge CamelCase and snake_case
function mapTrade(t: any) {
  if (!t) return null;
  return {
    ...t,
    id: t.id,
    userId: t.user_id,
    user_id: t.user_id,
    marketId: t.market_id,
    market_id: t.market_id,
    amount: parseFloat(t.amount || 0),
    direction: t.direction,
    type: t.type || t.direction,
    entryPrice: parseFloat(t.entry_price || 0),
    entry_price: t.entry_price,
    exitPrice: t.exit_price ? parseFloat(t.exit_price) : null,
    exit_price: t.exit_price,
    duration: t.duration,
    timeLeft: t.time_left,
    time_left: t.time_left,
    expiryTime: t.expiry_time,
    expiry_time: t.expiry_time,
    expirationTime: t.expiration_time,
    expiration_time: t.expiration_time,
    isDemo: !!t.is_demo,
    is_demo: !!t.is_demo,
    accountType: t.account_type || (t.is_demo ? 'demo' : 'real'),
    account_type: t.account_type || (t.is_demo ? 'demo' : 'real'),
    status: t.status,
    payoutAmount: t.payout_amount ? parseFloat(t.payout_amount) : null,
    payout_amount: t.payout_amount,
    payout: t.payout,
    settledAt: t.settled_at,
    settled_at: t.settled_at,
    createdAt: t.created_at,
    created_at: t.created_at,
    updatedAt: t.updated_at,
    updated_at: t.updated_at,
  };
}

function mapTicket(t: any) {
  if (!t) return null;
  return {
    ...t,
    id: t.id,
    userId: t.user_id,
    user_id: t.user_id,
    userName: t.user_name || 'User',
    userEmail: t.user_email || 'trader@bivox.com',
    subject: t.subject,
    category: t.category || 'General',
    message: t.message,
    lastMessage: t.last_message,
    last_message: t.last_message,
    status: t.status || 'open',
    priority: t.priority || 'medium',
    assignedAgentId: t.assigned_agent_id,
    assignedAgentName: t.assigned_agent_name,
    assignedAgentEmail: t.assigned_agent_email,
    channel: t.channel || 'chat',
    rating: t.rating,
    ratingFeedback: t.rating_feedback,
    isAiHandled: t.is_ai_handled !== undefined ? Boolean(t.is_ai_handled) : true,
    closedAt: t.closed_at,
    firstResponseAt: t.first_response_at,
    resolvedAt: t.resolved_at,
    updatedAt: t.updated_at,
    updated_at: t.updated_at,
    createdAt: t.created_at,
    created_at: t.created_at,
  };
}

function mapMessage(m: any) {
  if (!m) return null;
  let parsedAttachments = [];
  try {
    if (m.attachments) {
      parsedAttachments = typeof m.attachments === 'string' ? JSON.parse(m.attachments) : m.attachments;
    }
  } catch (e) {
    parsedAttachments = [];
  }

  return {
    ...m,
    id: m.id,
    ticketId: m.ticket_id,
    ticket_id: m.ticket_id,
    userId: m.user_id,
    user_id: m.user_id,
    senderType: m.sender_type || (m.isAdmin || m.is_admin ? 'agent' : 'user'),
    senderName: m.sender_name || (m.isAdmin || m.is_admin ? 'Support Agent' : 'User'),
    text: m.message,
    message: m.message,
    attachments: parsedAttachments,
    isInternalNote: Boolean(m.is_internal_note),
    isRead: Boolean(m.is_read),
    status: m.is_read ? 'seen' : 'delivered',
    isAdmin: Boolean(m.isAdmin || m.is_admin),
    createdAt: m.created_at,
    created_at: m.created_at,
  };
}

// Helper function to resolve IP address to country
async function getCountryFromIp(ip: string): Promise<{ countryName: string; countryCode: string }> {
  // Safe defaults for localhost or private IPs
  if (
    !ip ||
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.3')
  ) {
    return { countryName: 'Bangladesh', countryCode: 'BD' };
  }

  try {
    // Attempt 1: ip-api.com
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    if (response.ok) {
      const data = await response.json() as any;
      if (data && data.status === 'success') {
        return { countryName: data.country, countryCode: data.countryCode };
      }
    }
  } catch (err) {
    logger.error(`getCountryFromIp error (ip-api): ${err}`);
  }

  try {
    // Attempt 2: ipapi.co
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (response.ok) {
      const data = await response.json() as any;
      if (data && !data.error) {
        return { countryName: data.country_name, countryCode: data.country_code };
      }
    }
  } catch (err) {
    logger.error(`getCountryFromIp error (ipapi): ${err}`);
  }

  return { countryName: 'Bangladesh', countryCode: 'BD' };
}

// IP Lookup endpoint (proxied for safety and to avoid mixed content warnings)
router.get('/ip-info', async (req, res) => {
  let ip = req.ip || '';
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const parts = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
    ip = parts[0].trim();
  }

  const { countryName, countryCode } = await getCountryFromIp(ip);
  res.json({
    ip,
    country_code: countryCode,
    country_name: countryName
  });
});

// --- REST Endpoint Implementations ---

// 1. User Sync (called on app load / terminal boot)
router.post('/user/sync', async (req, res) => {
  const { uid, email, displayName, photoURL } = req.body;
  if (!uid) return res.status(400).json({ error: 'uid is required' });

  try {
    let ip = req.ip || '';
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      const parts = (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',');
      ip = parts[0].trim();
    }

    let user = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;
    if (!user) {
      const { countryName } = await getCountryFromIp(ip);
      const affiliateId = Math.random().toString(36).substring(2, 8).toUpperCase();
      await run(
        `INSERT OR IGNORE INTO users (uid, email, display_name, photo_url, referral_code, real_balance, demo_balance, country) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uid, email || '', displayName || '', photoURL || '', affiliateId, '0.00', '10000.00', countryName]
      );
      user = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;
    } else {
      let needsUpdate = false;
      const updates: string[] = [];
      const params: any[] = [];
      
      if (!user.display_name && displayName) {
        updates.push('display_name = ?');
        params.push(displayName);
        needsUpdate = true;
      }
      if (!user.photo_url && photoURL) {
        updates.push('photo_url = ?');
        params.push(photoURL);
        needsUpdate = true;
      }
      if (!user.country) {
        const { countryName } = await getCountryFromIp(ip);
        updates.push('country = ?');
        params.push(countryName);
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        params.push(uid);
        await run(`UPDATE users SET ${updates.join(', ')} WHERE uid = ?`, params);
        user = await get('SELECT * FROM users WHERE uid = ?', [uid]) as any;
      }
    }

    res.json({ success: true, data: mapUserForFrontend(user) });
  } catch (err: any) {
    logger.error(`User sync failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 2. Check 2FA Configuration
router.get('/user/check-2fa', async (req, res) => {
  const { uid } = req.query;
  if (!uid) return res.status(400).json({ error: 'uid is required' });

  try {
    const user = await get('SELECT tfa_enabled, tfa_mode, tfa_secret FROM users WHERE uid = ?', [uid]) as any;
    if (!user) {
      return res.json({ tfaEnabled: false });
    }
    res.json({
      tfaEnabled: !!user.tfa_enabled,
      tfaMode: user.tfa_mode || 'app',
      tfaSecret: user.tfa_secret || null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Profile (PATCH users)
router.patch('/users/:id', requireAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  if (req.user!.uid !== id && !req.user!.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const updates: string[] = [];
    const params: any[] = [];

    const fieldMap: { [key: string]: string } = {
      displayName: 'display_name',
      photoURL: 'photo_url',
      currency: 'currency',
      tfaEnabled: 'tfa_enabled',
      tfaMode: 'tfa_mode',
      tfaSecret: 'tfa_secret',
      phone: 'phone',
      kycStatus: 'kyc_status',
      realBalance: 'real_balance',
      demoBalance: 'demo_balance',
      balance: 'real_balance',
    };

    for (const [key, value] of Object.entries(req.body)) {
      const dbField = fieldMap[key];
      if (dbField) {
        if (typeof value === 'object' && value !== null && (value as any).increment !== undefined) {
          updates.push(`${dbField} = ${dbField} + ?`);
          params.push((value as any).increment);
        } else if (typeof value === 'boolean') {
          updates.push(`${dbField} = ?`);
          params.push(value ? 1 : 0);
        } else {
          updates.push(`${dbField} = ?`);
          params.push(value);
        }
      }
    }

    if (updates.length > 0) {
      params.push(id);
      await run(`UPDATE users SET ${updates.join(', ')} WHERE uid = ?`, params);
    }

    const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [id]);
    res.json(mapUserForFrontend(updatedUser));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Fetch User Trades
router.get('/user-trades', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  
  try {
    const trades = await query(
      'SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC LIMIT 100',
      [userId]
    );
    res.json({ success: true, trades: trades.map(mapTrade) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Fetch User Tickets
router.get('/user-tickets', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  try {
    const userTickets = await query(
      'SELECT * FROM tickets WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100',
      [userId]
    );
    res.json({ success: true, tickets: userTickets.map(mapTicket) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Market Movers Widget (FMP API) ---
router.get('/market-movers', async (req, res) => {
  const mockMovers = [
    { symbol: 'AAPL', name: 'Apple Inc.', change: 2.45, price: 189.45, volatility: 0.15 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', change: -5.12, price: 238.12, volatility: 0.45 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', change: 3.89, price: 475.20, volatility: 0.35 },
    { symbol: 'AMZN', name: 'Amazon.com', change: 1.12, price: 145.10, volatility: 0.12 },
    { symbol: 'META', name: 'Meta Platforms', change: -2.15, price: 320.15, volatility: 0.25 }
  ];

  try {
    const apiKey = process.env.FMP_API_KEY;
    if (!apiKey) {
      return res.json(mockMovers);
    }

    // Fetch daily active stocks as a proxy for high volatility movers
    const response = await fetch(`https://financialmodelingprep.com/api/v3/stock_market/actives?apikey=${apiKey}`);
    if (!response.ok) {
      logger.warn(`FMP API request failed with status ${response.status}. Falling back to mock data.`);
      return res.json(mockMovers);
    }

    const data = await response.json() as any[];
    // Take top 5
    const movers = data.slice(0, 5).map(stock => ({
      symbol: stock.symbol,
      name: stock.name || stock.symbol,
      change: parseFloat(stock.changesPercentage || 0),
      price: parseFloat(stock.price || 0),
      // We can use a simple volatility proxy: absolute percentage change
      volatility: Math.abs(parseFloat(stock.changesPercentage || 0))
    }));

    // Sort by "volatility" (absolute change) descending
    movers.sort((a, b) => b.volatility - a.volatility);

    res.json(movers);
  } catch (err: any) {
    logger.error(`Market Movers fetch failed: ${err.message}. Falling back to mock data.`);
    res.json(mockMovers);
  }
});

// Added missing endpoints
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await query('SELECT * FROM tickets ORDER BY created_at DESC LIMIT 100');
        res.json(tickets.map(mapTicket));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/promoMaterials', async (req, res) => {
    res.json([]);
});

router.get('/affiliate_campaigns', async (req, res) => {
    res.json([]);
});

router.get('/affiliate_commissions', async (req, res) => {
    res.json([]);
});

router.get('/affiliate_payouts', async (req, res) => {
    res.json([]);
});

router.get('/affiliate_postbacks', async (req, res) => {
    res.json([]);
});

// Support Tickets List
router.get('/tickets', async (req, res) => {
    try {
        const { status, category, search, assignedAgentId, userId } = req.query as any;
        let sql = 'SELECT * FROM tickets WHERE 1=1';
        const params: any[] = [];

        if (status && status !== 'all') {
          sql += ' AND status = ?';
          params.push(status);
        }
        if (category && category !== 'all') {
          sql += ' AND category = ?';
          params.push(category);
        }
        if (assignedAgentId) {
          sql += ' AND assigned_agent_id = ?';
          params.push(assignedAgentId);
        }
        if (userId) {
          sql += ' AND user_id = ?';
          params.push(userId);
        }
        if (search) {
          sql += ' AND (subject LIKE ? OR message LIKE ? OR user_email LIKE ? OR user_name LIKE ? OR id LIKE ?)';
          const term = `%${search}%`;
          params.push(term, term, term, term, term);
        }

        sql += ' ORDER BY updated_at DESC LIMIT 200';

        const tickets = await query(sql, params);
        res.json(tickets.map(mapTicket));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/support/tickets', async (req, res) => {
    try {
        const { status, category, search, assignedAgentId, userId } = req.query as any;
        let sql = 'SELECT * FROM tickets WHERE 1=1';
        const params: any[] = [];

        if (status && status !== 'all') {
          sql += ' AND status = ?';
          params.push(status);
        }
        if (category && category !== 'all') {
          sql += ' AND category = ?';
          params.push(category);
        }
        if (assignedAgentId) {
          sql += ' AND assigned_agent_id = ?';
          params.push(assignedAgentId);
        }
        if (userId) {
          sql += ' AND user_id = ?';
          params.push(userId);
        }
        if (search) {
          sql += ' AND (subject LIKE ? OR message LIKE ? OR user_email LIKE ? OR user_name LIKE ? OR id LIKE ?)';
          const term = `%${search}%`;
          params.push(term, term, term, term, term);
        }

        sql += ' ORDER BY updated_at DESC LIMIT 200';

        const tickets = await query(sql, params);
        res.json({ success: true, tickets: tickets.map(mapTicket) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Support Chat/Ticket Messages Loader
router.get('/tickets/:ticketId/messages', async (req, res) => {
  const { ticketId } = req.params;
  const role = (req.query.role as string) || 'user';
  const isAgent = role === 'agent' || role === 'admin' || role === 'support';

  try {
    let sql = 'SELECT * FROM ticket_messages WHERE ticket_id = ?';
    if (!isAgent) {
      sql += ' AND (is_internal_note IS NULL OR is_internal_note = 0)';
    }
    sql += ' ORDER BY created_at ASC';

    const messages = await query(sql, [ticketId]);
    res.json(messages.map(mapMessage));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Update Ticket
router.post('/tickets', async (req, res) => {
  const { ticketId, ticketData } = req.body;
  if (!ticketId) return res.status(400).json({ error: 'ticketId is required' });

  try {
    const existing = await get('SELECT id FROM tickets WHERE id = ?', [ticketId]);
    if (existing) {
      const updates: string[] = [];
      const params: any[] = [];
      
      const fieldMap: { [key: string]: string } = {
        lastMessage: 'last_message',
        status: 'status',
        priority: 'priority',
        category: 'category',
        assignedAgentId: 'assigned_agent_id',
        assignedAgentName: 'assigned_agent_name',
        assignedAgentEmail: 'assigned_agent_email',
        updatedAt: 'updated_at',
      };

      for (const [key, value] of Object.entries(ticketData)) {
        const dbField = fieldMap[key];
        if (dbField && value !== undefined) {
          updates.push(`${dbField} = ?`);
          params.push(value);
        }
      }

      if (updates.length > 0) {
        params.push(ticketId);
        await run(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`, params);
      }
    } else {
      const userId = ticketData.userId || 'guest';
      const userName = ticketData.userName || 'Trader';
      const userEmail = ticketData.userEmail || 'user@bivox.com';
      const subject = ticketData.subject || 'Support Query';
      const category = ticketData.category || 'General';
      const message = ticketData.message || '';
      const lastMessage = ticketData.lastMessage || message;
      const status = ticketData.status || 'open';
      const priority = ticketData.priority || 'medium';
      const createdAt = ticketData.createdAt || Date.now();
      const updatedAt = ticketData.updatedAt || Date.now();
      
      await run(
        `INSERT INTO tickets (id, user_id, user_name, user_email, subject, category, message, last_message, status, priority, updated_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ticketId, userId, userName, userEmail, subject, category, message, lastMessage, status, priority, updatedAt, createdAt]
      );
    }

    const updated = await get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    const mappedTicket = mapTicket(updated);
    try {
      const io = getIO();
      io.to(`user_${mappedTicket.userId}`).emit('ticket_updated', mappedTicket);
      io.to('agents_room').emit('ticket_updated', mappedTicket);
      io.to(`ticket_${ticketId}`).emit('ticket_updated', mappedTicket);
    } catch (e) {}
    res.json({ success: true, ticket: mappedTicket });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add Message to Support Chat
router.post('/tickets/messages', async (req, res) => {
  const { ticketId, messageId, messageData } = req.body;
  if (!ticketId || !messageId) {
    return res.status(400).json({ error: 'ticketId and messageId are required' });
  }

  try {
    const userId = messageData.senderId || 'unknown';
    const senderType = messageData.senderType || (messageData.senderId === 'support' || messageData.isAdmin ? 'agent' : 'user');
    const senderName = messageData.senderName || (senderType === 'agent' ? 'Support Agent' : senderType === 'bot' ? 'Bivox AI Assistant' : 'User');
    const text = messageData.text || messageData.message || '';
    const attachments = messageData.attachments ? JSON.stringify(messageData.attachments) : null;
    const isInternalNote = messageData.isInternalNote ? 1 : 0;
    const isAdmin = senderType === 'agent' || senderType === 'bot' || messageData.isAdmin ? 1 : 0;
    const createdAt = messageData.createdAt || Date.now();

    await run(
      `INSERT INTO ticket_messages (id, ticket_id, user_id, sender_type, sender_name, message, attachments, is_internal_note, is_admin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [messageId, ticketId, userId, senderType, senderName, text, attachments, isInternalNote, isAdmin, createdAt]
    );

    // Update main ticket last_message & updated_at if not internal note
    if (!isInternalNote) {
      const ticket = await get('SELECT first_response_at, status FROM tickets WHERE id = ?', [ticketId]) as any;
      let extraCols = '';
      const extraParams: any[] = [];

      if (senderType === 'agent' && ticket && !ticket.first_response_at) {
        extraCols += ', first_response_at = ?';
        extraParams.push(createdAt);
      }
      if (senderType === 'agent' && ticket?.status === 'open') {
        extraCols += ", status = 'in_progress'";
      }

      await run(
        `UPDATE tickets SET last_message = ?, updated_at = ? ${extraCols} WHERE id = ?`,
        [text, createdAt, ...extraParams, ticketId]
      );
    }

    const inserted = await get('SELECT * FROM ticket_messages WHERE id = ?', [messageId]);
    const mappedMsg = mapMessage(inserted);

    try {
      const io = getIO();
      io.to(`ticket_${ticketId}`).emit('support_message', mappedMsg);
      const ticketRow = await get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
      if (ticketRow) {
        const mappedT = mapTicket(ticketRow);
        io.to(`user_${mappedT.userId}`).emit('ticket_updated', mappedT);
        io.to('agents_room').emit('ticket_updated', mappedT);
      }
    } catch (e) {
      console.warn('Socket emit warning:', e);
    }

    res.json({ success: true, message: mappedMsg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Ticket Status / Assignment
router.patch('/support/tickets/:ticketId/status', async (req, res) => {
  const { ticketId } = req.params;
  const { status, priority, category, assignedAgentId, assignedAgentName, assignedAgentEmail } = req.body;

  try {
    const updates: string[] = ['updated_at = ?'];
    const params: any[] = [Date.now()];

    if (status) {
      updates.push('status = ?');
      params.push(status);
      if (status === 'resolved') {
        updates.push('resolved_at = ?');
        params.push(Date.now());
      } else if (status === 'closed') {
        updates.push('closed_at = ?');
        params.push(Date.now());
      }
    }
    if (priority) {
      updates.push('priority = ?');
      params.push(priority);
    }
    if (category) {
      updates.push('category = ?');
      params.push(category);
    }
    if (assignedAgentId !== undefined) {
      updates.push('assigned_agent_id = ?');
      params.push(assignedAgentId);
    }
    if (assignedAgentName !== undefined) {
      updates.push('assigned_agent_name = ?');
      params.push(assignedAgentName);
    }
    if (assignedAgentEmail !== undefined) {
      updates.push('assigned_agent_email = ?');
      params.push(assignedAgentEmail);
    }

    params.push(ticketId);
    await run(`UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`, params);

    // Insert system message in chat
    if (status) {
      const msgId = `SYS-${Date.now()}`;
      await run(
        `INSERT INTO ticket_messages (id, ticket_id, user_id, sender_type, sender_name, message, is_admin, created_at)
         VALUES (?, ?, 'system', 'system', 'System', ?, 1, ?)`,
        [msgId, ticketId, `Ticket status changed to: ${status.toUpperCase()}`, Date.now()]
      );
    }

    const updated = await get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    res.json({ success: true, ticket: mapTicket(updated) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// CSAT Rating
router.post('/support/tickets/:ticketId/rate', async (req, res) => {
  const { ticketId } = req.params;
  const { rating, feedback } = req.body;

  try {
    await run(
      `UPDATE tickets SET rating = ?, rating_feedback = ?, updated_at = ? WHERE id = ?`,
      [rating, feedback || '', Date.now(), ticketId]
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Gemini AI Chat Handler Endpoint
router.post('/support/ai-chat', async (req, res) => {
  const { message, category, userId, history } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  try {
    const client = getGeminiClient();
    const systemInstruction = `You are "Bivox AI Support Specialist", an intelligent 24/7 AI assistant for Bivox Trade, a premier international OTC binary options trading platform.
    Key Platform Info:
    - Minimum Deposit: $10 / 1000 BDT (processed via bKash, Nagad, Rocket, Binance Pay, Crypto, VISA/Mastercard).
    - Minimum Withdrawal: $10 (processed in 1 to 24 hours).
    - KYC Verification: Required for live withdrawals. Users upload NID / Passport / Driving License + Selfie in Profile -> Verification. Approval takes < 30 mins.
    - Demo Account: Every user receives a free $10,000 renewable practice demo account.
    - Payout Rates: Up to 98% on binary options assets (Forex, Crypto IDX, Commodities).
    - Affiliate / Referral: Up to 80% revenue share.

    Instructions:
    1. Provide helpful, precise, polite, and reassuring answers.
    2. If the user explicitly asks to speak with a human support agent, or if the issue involves lost funds, payment failure disputes, locked accounts, or fraud complaints, explicitly state that you are handing them over to a live human support specialist.
    3. Return your response in concise JSON format:
       {
         "reply": "your text response",
         "requiresHandoff": true/false,
         "suggestedCategory": "Deposit" | "Withdrawal" | "Trading" | "Verification (KYC)" | "Referral" | "Technical Issue" | "Account",
         "suggestedPriority": "low" | "medium" | "high" | "urgent"
       }`;

    const promptText = `User Query: "${message}"\nSelected Category: ${category || 'General'}`;
    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    let jsonRes: any = {};
    try {
      jsonRes = JSON.parse(text);
    } catch (e) {
      jsonRes = {
        reply: text || "Thank you for contacting Bivox Support. How else can I assist you?",
        requiresHandoff: message.toLowerCase().includes('agent') || message.toLowerCase().includes('human'),
        suggestedCategory: category || 'General',
        suggestedPriority: 'medium'
      };
    }

    res.json(jsonRes);
  } catch (err: any) {
    logger.warn(`AI chat fallback: ${err.message}`);
    const lower = message.toLowerCase();
    const isHandoff = lower.includes('human') || lower.includes('agent') || lower.includes('dispute') || lower.includes('urgent');
    res.json({
      reply: isHandoff 
        ? "I am handing your request over to our senior human support agent queue. An agent will connect with you shortly!" 
        : "Welcome to Bivox Support! How can I help you with deposits, withdrawals, trading, or account verification today?",
      requiresHandoff: isHandoff,
      suggestedCategory: category || 'General',
      suggestedPriority: isHandoff ? 'high' : 'medium'
    });
  }
});

// Legacy Support Bot Endpoint
router.post('/support/reply', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  try {
    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
      config: {
        systemInstruction: "You are the Support Assistant for Bivaax Trade, a professional OTC binary options trading platform. Keep your answers brief, professional, helpful, and concise.",
      }
    });

    const reply = response.text || "Thank you for contacting support. An agent will be with you shortly.";
    res.json({ reply });
  } catch (err: any) {
    logger.error(`Gemini support reply failed: ${err.message}`);
    res.json({ 
      reply: "Thank you for contacting Bivaax support. Our human representative has been notified of your request and will follow up with you as soon as possible." 
    });
  }
});

// User 360° Support Context Endpoint for Agents
router.get('/support/user-context/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await get('SELECT * FROM users WHERE uid = ? OR id = ?', [userId, userId]) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const uid = user.uid;

    // Fetch transactions (deposits & withdrawals)
    const deposits = await query(
      "SELECT * FROM transactions WHERE user_id = ? AND type = 'deposit' ORDER BY created_at DESC LIMIT 5",
      [uid]
    );
    const withdrawals = await query(
      "SELECT * FROM transactions WHERE user_id = ? AND type = 'withdrawal' ORDER BY created_at DESC LIMIT 5",
      [uid]
    );

    // Fetch trades
    const recentTrades = await query(
      'SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [uid]
    );
    const tradeStats = await get(
      'SELECT COUNT(*) as total, SUM(CASE WHEN status = "win" THEN 1 ELSE 0 END) as wins, SUM(amount) as volume FROM trades WHERE user_id = ?',
      [uid]
    ) as any;

    const totalTrades = tradeStats?.total || 0;
    const winTrades = tradeStats?.wins || 0;
    const winRate = totalTrades > 0 ? Math.round((winTrades / totalTrades) * 100) : 0;
    const totalVolume = parseFloat(tradeStats?.volume || 0);

    res.json({
      profile: {
        uid: user.uid,
        email: user.email,
        displayName: user.display_name || 'Trader',
        phone: user.phone || 'N/A',
        country: user.country || 'International',
        kycStatus: user.kyc_status || 'unverified',
        realBalance: parseFloat(user.real_balance || 0),
        demoBalance: parseFloat(user.demo_balance || 10000),
        createdAt: user.created_at,
        status: user.status || 'Standard',
      },
      deposits,
      withdrawals,
      trades: {
        recent: recentTrades,
        winRate,
        totalTrades,
        totalVolume,
      },
      referral: {
        referralCount: user.referral_count || 0,
        affiliateBalance: parseFloat(user.affiliate_balance || 0),
        totalEarnings: parseFloat(user.total_affiliate_earnings || 0),
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Canned Responses Endpoints
router.get('/support/canned-responses', async (req, res) => {
  try {
    const responses = await query('SELECT * FROM support_canned_responses ORDER BY created_at DESC');
    res.json(responses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/support/canned-responses', async (req, res) => {
  const { shortcut, title, category, content, createdBy } = req.body;
  if (!shortcut || !title || !content) {
    return res.status(400).json({ error: 'shortcut, title, and content are required' });
  }

  try {
    const id = `CR-${Date.now()}`;
    await run(
      `INSERT INTO support_canned_responses (id, shortcut, title, category, content, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, shortcut, title, category || 'General', content, createdBy || 'admin', Date.now()]
    );
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Support Analytics Endpoint
router.get('/support/analytics', async (req, res) => {
  try {
    const totals = await get(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_cnt,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_prog_cnt,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_cnt,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_cnt,
        AVG(rating) as avg_rating
      FROM tickets
    `) as any;

    const categories = await query(`
      SELECT category, COUNT(*) as count FROM tickets GROUP BY category
    `);

    const catBreakdown: any = {};
    categories.forEach((c: any) => {
      catBreakdown[c.category || 'General'] = c.count;
    });

    res.json({
      totalTickets: totals?.total || 0,
      openTickets: totals?.open_cnt || 0,
      inProgressTickets: totals?.in_prog_cnt || 0,
      resolvedTickets: totals?.resolved_cnt || 0,
      closedTickets: totals?.closed_cnt || 0,
      avgFirstResponseMinutes: 2.5,
      avgResolutionHours: 1.2,
      csatAverage: totals?.avg_rating ? parseFloat(totals.avg_rating.toFixed(1)) : 4.8,
      handoffRatePercent: 18,
      categoryBreakdown: catBreakdown,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

import { processCopyTrading } from '../services/copyTradingService.ts';
import { createDeposit } from '../services/gopayService.ts';

// 10. Trade Placement (Compatibility with frontend)
router.post('/trade', async (req, res) => {
  const { pair, amount, direction, accountType, userId, trade } = req.body;
  if (!userId || !pair || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const isDemo = accountType === 'demo';

  try {
    await transaction(async (conn) => {
      // 1. Check user balance
      const user = await get('SELECT real_balance, demo_balance FROM users WHERE uid = ?', [userId], conn) as any;
      if (!user) throw new Error('User not found');

      const balanceField = isDemo ? 'demo_balance' : 'real_balance';
      const currentBalance = parseFloat(user[balanceField]);
      const tradeAmount = parseFloat(amount);

      if (currentBalance < tradeAmount) {
        throw new Error('Insufficient balance');
      }

      // 2. Deduct balance
      const newBalance = (currentBalance - tradeAmount).toFixed(2);
      await run(`UPDATE users SET ${balanceField} = ? WHERE uid = ?`, [newBalance, userId], conn);

      // 3. Insert trade
      const entryPrice = trade?.entryPrice || 0;
      const duration = trade?.timeLeft || 60;
      const expiryTime = Math.floor((Date.now() + duration * 1000) / 1000);

      await run(
        `INSERT INTO trades (user_id, market_id, amount, direction, entry_price, duration, expiry_time, is_demo, status, account_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, pair, amount.toString(), direction, entryPrice.toString(), duration, expiryTime, isDemo ? 1 : 0, 'open', accountType || (isDemo ? 'demo' : 'real')],
        conn
      );

      // 4. Create Audit Log if not demo
      if (!isDemo) {
        await createAuditLog(userId, 'trade_place', 'trade', null, { pair, amount, direction, entryPrice });
      }

      // 5. Notify user of balance update via Socket.IO
      const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [userId], conn) as any;
      getIO().to(`user_${userId}`).emit('user_profile_update', mapUserForFrontend(updatedUser));
      
      // 6. Trigger Copy Trading
      processCopyTrading(userId, {
        marketId: pair,
        direction,
        duration,
        entryPrice,
        isDemo
      }).catch(err => logger.error('Copy trading trigger failed:', err));
    });

    const insertedTrade = await get('SELECT * FROM trades WHERE user_id = ? ORDER BY id DESC LIMIT 1', [userId]);
    res.json({ success: true, trade: mapTrade(insertedTrade) });
  } catch (err: any) {
    logger.error(`Trade placement failed: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
});

router.post('/trade/settle-secure', async (req, res) => {
  // This is a placeholder for frontend's manual settlement requests if any.
  // Actual settlement happens in marketEngine/tradeService.
  res.json({ success: true, message: 'Settlement processed' });
});

router.get('/masterTraders', async (req, res) => {
  try {
    const traders = await query('SELECT * FROM master_traders');
    if (!traders || traders.length === 0) {
      // Return dummy master traders for compatibility
      return res.json([
        { id: 'm1', displayName: 'ProTrader_Alpha', name: 'ProTrader_Alpha', winRate: 84.5, profit: 12450.0, followers: 1240 },
        { id: 'm2', displayName: 'Binomo_Legend', name: 'Binomo_Legend', winRate: 79.2, profit: 8920.0, followers: 850 },
        { id: 'm3', displayName: 'Crypto_Wizard', name: 'Crypto_Wizard', winRate: 91.0, profit: 15600.0, followers: 2100 }
      ]);
    }
    res.json(traders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load master traders' });
  }
});

router.post('/masterTraders', async (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `m_${Date.now()}`;
    await run(
      `INSERT INTO master_traders (id, name, country, win_rate, profit, followers) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.name || '', data.country || '', data.winRate || 0, data.totalProfit || 0, data.copiersCount || 0]
    );
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create master trader' });
  }
});

router.get('/users/:uid/activeCopies', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.uid !== req.params.uid && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const copies = await query('SELECT * FROM active_copies WHERE user_id = ? ORDER BY started_at DESC', [req.params.uid]);
    res.json(copies || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load active copies' });
  }
});

router.post('/users/:uid/activeCopies', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.uid !== req.params.uid && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const data = req.body;
    const id = data.id || `copy_${Date.now()}`;
    
    await run(
      `INSERT INTO active_copies 
      (id, user_id, master_id, master_name, country, amount, max_trade_amount, trades_limit, stop_loss, take_profit, started_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, req.params.uid, data.masterId, data.masterName, data.country || '',
        data.amount || 0, data.maxTradeAmount || 10, data.tradesLimit || 0, data.stopLoss || 0, data.takeProfit || 0, Date.now()
      ]
    );
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create active copy' });
  }
});

router.patch('/masterTraders/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const data = req.body;
    if (data.copiersCount) {
      // Handle increment
      if (typeof data.copiersCount === 'object' && data.copiersCount.increment !== undefined) {
         await run('UPDATE master_traders SET followers = followers + ? WHERE id = ?', [data.copiersCount.increment, req.params.id]);
      } else if (typeof data.copiersCount === 'number') {
         await run('UPDATE master_traders SET followers = followers + ? WHERE id = ?', [data.copiersCount, req.params.id]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update master trader' });
  }
});

import { fetchLeaderboards } from '../services/leaderboardService.ts';

router.get('/leaderboard', async (req, res) => {
  try {
    const data = await fetchLeaderboards();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

router.delete('/users/:uid/activeCopies/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (req.user?.uid !== req.params.uid && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await run('DELETE FROM active_copies WHERE id = ? AND user_id = ?', [req.params.id, req.params.uid]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete active copy' });
  }
});

router.post('/copy-trade/start', requireAuth, async (req: AuthRequest, res) => {
  res.json({ success: true, message: 'Copy trading started' });
});

// Validation middleware
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// --- Wallet & Profile ---

router.get('/user/profile', requireAuth, async (req: AuthRequest, res) => {
  const user = await get('SELECT * FROM users WHERE uid = ?', [req.user!.uid]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(mapUserForFrontend(user));
});

router.get('/wallet/balance', requireAuth, async (req: AuthRequest, res) => {
  const user = await get('SELECT * FROM users WHERE uid = ?', [req.user!.uid]) as any;
  res.json(mapUserForFrontend(user));
});

// --- Trades ---

router.get('/trades/history', requireAuth, async (req: AuthRequest, res) => {
  const { isDemo, limit = 50 } = req.query;
  const history = await query(
    `SELECT * FROM trades WHERE user_id = ? AND is_demo = ? ORDER BY created_at DESC LIMIT ?`,
    [req.user!.uid, isDemo === 'true' ? 1 : 0, Number(limit)]
  );
  res.json(history);
});

router.post('/trades/place', 
  requireAuth,
  body('marketId').isString().notEmpty(),
  body('amount').isNumeric().toFloat(),
  body('direction').isIn(['up', 'down']),
  body('duration').isInt({ min: 1 }),
  body('entryPrice').isNumeric().toFloat(),
  body('isDemo').isBoolean(),
  validate,
  async (req: AuthRequest, res) => {
    const { marketId, amount, direction, duration, entryPrice, isDemo } = req.body;
  const uid = req.user!.uid;

  try {
    await transaction(async (conn) => {
      // 1. Check balance with lock
      const user = await get('SELECT real_balance, demo_balance FROM users WHERE uid = ?', [uid], conn) as any;
      const balanceField = isDemo ? 'demo_balance' : 'real_balance';
      const currentBalance = parseFloat(user[balanceField]);
      const tradeAmount = parseFloat(amount);

      if (currentBalance < tradeAmount) {
        throw new Error('Insufficient balance');
      }

      // 2. Deduct balance
      const newBalance = (currentBalance - tradeAmount).toFixed(2);
      await run(`UPDATE users SET ${balanceField} = ? WHERE uid = ?`, [newBalance, uid], conn);

      // 3. Insert trade
      const expiryTime = Math.floor((Date.now() + duration * 1000) / 1000);
      await run(
        `INSERT INTO trades (user_id, market_id, amount, direction, entry_price, duration, expiry_time, is_demo, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uid, marketId, amount.toString(), direction, entryPrice.toString(), duration, expiryTime, isDemo ? 1 : 0, 'open'],
        conn
      );

      if (!isDemo) {
        await createAuditLog(uid, 'trade_place', 'trade', null, { marketId, amount, direction, entryPrice });
      }

      // Notify balance update
      const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [uid], conn) as any;
      getIO().to(`user_${uid}`).emit('user_profile_update', mapUserForFrontend(updatedUser));

      // Trigger Copy Trading
      processCopyTrading(uid, {
        marketId,
        direction,
        duration,
        entryPrice,
        isDemo
      }).catch(err => logger.error('Copy trading trigger failed:', err));
    });

    const trade = await get('SELECT * FROM trades WHERE user_id = ? ORDER BY id DESC LIMIT 1', [uid]);
    res.json(trade);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Transactions (Deposit/Withdraw) ---

router.post('/wallet/deposit', 
  requireAuth,
  body('amount').isNumeric().toFloat(),
  body('method').isString().notEmpty(),
  body('txHash').optional().isString(),
  validate,
  async (req: AuthRequest, res) => {
    const { amount, method, txHash } = req.body;
  const uid = req.user!.uid;

  await run(
    `INSERT INTO transactions (user_id, type, amount, status, method, tx_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [uid, 'deposit', amount.toString(), 'pending', method, txHash]
  );

  await createAuditLog(uid, 'deposit_request', 'transaction', null, { amount, method, txHash }, req.ip);
  logger.info(`Deposit request from ${uid}: ${amount}`);

  res.json({ success: true, message: 'Deposit request submitted' });
});

router.post('/wallet/withdraw', 
  requireAuth,
  body('amount').isNumeric().toFloat(),
  body('method').isString().notEmpty(),
  body('details').isObject(),
  validate,
  async (req: AuthRequest, res) => {
    const { amount, method, details } = req.body;
  const uid = req.user!.uid;

  try {
    await transaction(async (conn) => {
      const user = await get('SELECT real_balance FROM users WHERE uid = ?', [uid], conn) as any;
      if (parseFloat(user.real_balance) < parseFloat(amount)) {
        throw new Error('Insufficient balance');
      }

      // Deduct balance immediately for withdrawal
      const newBalance = (parseFloat(user.real_balance) - parseFloat(amount)).toFixed(2);
      await run(`UPDATE users SET real_balance = ? WHERE uid = ?`, [newBalance, uid], conn);

      await run(
        `INSERT INTO transactions (user_id, type, amount, status, method, details)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [uid, 'withdrawal', amount.toString(), 'pending', method, JSON.stringify(details)]
      );
      
      await createAuditLog(uid, 'withdraw_request', 'transaction', null, { amount, method }, req.ip);
    });

    logger.info(`Withdrawal request from ${uid}: ${amount}`);
    res.json({ success: true, message: 'Withdrawal request submitted' });

  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/wallet/transactions', requireAuth, async (req: AuthRequest, res) => {
  const history = await query(
    `SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [req.user!.uid]
  );
  res.json(history);
});

// GoPay Payment Routes
router.post('/payment/collect', requireAuth, async (req: AuthRequest, res) => {
  const { amount, payType } = req.body;
  const uid = req.user!.uid;
  const orderId = `DEP_${Date.now()}_${uid}`;

  try {
      const response = await createDeposit(amount, orderId, payType);
      res.json({ success: true, url: response.data.data.url });
  } catch (err: any) {
      logger.error(`GoPay collect failed: ${err.message}`);
      res.status(500).json({ error: err.message });
  }
});

router.post('/payment/webhook', async (req, res) => {
    // Note: Signature verification should be added here for production security
    const { status, out_trade_no, money } = req.body;
    
    if (status == 1) { // Assuming status 1 is success based on typical gateway patterns
        const uid = out_trade_no.split('_')[2];
        await run(`UPDATE transactions SET status = 'completed' WHERE user_id = ? AND amount = ? AND status = 'pending'`, [uid, money]);
        
        // Update balance
        await run('UPDATE users SET real_balance = real_balance + ? WHERE uid = ?', [money, uid]);
    }
    
    res.status(200).send('success');
});

// Admin Panel - Add Generic Collection Handler
router.post('/depositMethods', requireAuth, async (req: AuthRequest, res) => {
    try {
        const docRef = await adminDb.collection('depositMethods').add(req.body);
        res.json({ id: docRef.id });
    } catch (e: any) {
        logger.error(`Error adding depositMethod: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

// Generic handler for proxy addDoc calls
router.post('/:collection', requireAuth, async (req: AuthRequest, res) => {
    const { collection } = req.params;
    try {
        const docRef = await adminDb.collection(collection).add(req.body);
        res.json({ id: docRef.id });
    } catch (e: any) {
        logger.error(`Error adding to ${collection}: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
});

router.get('/admin/config/fmp-key', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    const doc = await adminDb.collection('app_config').doc('settings').get();
    const data = doc.exists ? doc.data() : {};
    res.json({ fmpApiKey: data?.fmpApiKey || process.env.FMP_API_KEY || '' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/config/fmp-key', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  try {
    const { fmpApiKey } = req.body;
    await adminDb.collection('app_config').doc('settings').set({ fmpApiKey }, { merge: true });
    // Also update process.env for the current session
    process.env.FMP_API_KEY = fmpApiKey;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/users', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const users = await query('SELECT * FROM users ORDER BY created_at DESC');
  res.json(users);
});

router.get('/admin/transactions', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const txs = await query('SELECT t.*, u.email FROM transactions t JOIN users u ON t.user_id = u.uid ORDER BY t.created_at DESC');
  res.json(txs);
});

router.get('/admin/trades', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const trades = await query('SELECT t.*, u.email FROM trades t JOIN users u ON t.user_id = u.uid ORDER BY t.created_at DESC');
  res.json(trades);
});

router.post('/admin/transactions/approve', requireAuth, async (req: AuthRequest, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin only' });
  const { id } = req.body;

  try {
    await transaction(async (conn) => {
      const tx = await get('SELECT * FROM transactions WHERE id = ?', [id], conn) as any;
      if (!tx || tx.status !== 'pending') throw new Error('Invalid transaction');

      if (tx.type === 'deposit') {
        const user = await get('SELECT * FROM users WHERE uid = ?', [tx.user_id], conn) as any;
        const newBalance = (parseFloat(user.real_balance) + parseFloat(tx.amount)).toFixed(2);
        await run('UPDATE users SET real_balance = ? WHERE uid = ?', [newBalance, tx.user_id], conn);

        // Affiliate Commission (e.g., 10%)
        if (user.referred_by_uid) {
          const commission = (parseFloat(tx.amount) * 0.10).toFixed(2);
          await run(
            'UPDATE users SET affiliate_balance = affiliate_balance + ?, total_affiliate_earnings = total_affiliate_earnings + ? WHERE uid = ?',
            [commission, commission, user.referred_by_uid],
            conn
          );
          await createAuditLog(user.referred_by_uid, 'affiliate_commission', 'user', tx.user_id, { amount: tx.amount, commission });
        }
      }

      await run('UPDATE transactions SET status = ?, updated_at = datetime(\'now\') WHERE id = ?', ['completed', id], conn);

      // Notify user of balance update
      const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [tx.user_id], conn) as any;
      getIO().to(`user_${tx.user_id}`).emit('user_profile_update', mapUserForFrontend(updatedUser));
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Aliases for compatibility
router.get('/users', requireAuth, async (req: AuthRequest, res) => {
  const user = await get('SELECT * FROM users WHERE uid = ?', [req.user!.uid]);
  res.json([mapUserForFrontend(user)]);
});

router.get('/trades', requireAuth, async (req: AuthRequest, res) => {
  const trades = await query('SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC', [req.user!.uid]);
  res.json(trades);
});

router.get('/transactions', requireAuth, async (req: AuthRequest, res) => {
  const txs = await query('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC', [req.user!.uid]);
  res.json(txs);
});

// --- Settings & Config ---
router.get('/app_config/settings', async (req, res) => {
  res.json({
    maintenanceMode: false,
    minDeposit: 10,
    minWithdraw: 15,
    payoutRates: { default: 82, crypto: 85, stocks: 75 }
  });
});

// --- News & Newsletter ---
router.post('/newsletter', async (req, res) => {
  res.json({ success: true });
});

// --- KYC Identity Verification Routes ---

// 1. Scan and verify KYC document via Gemini AI
router.post('/kyc/scan', requireAuth, async (req: AuthRequest, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  try {
    const ai = getGeminiClient();
    
    // Clean base64 string
    let base64Data = image;
    let mimeType = 'image/jpeg';
    if (image.includes(';base64,')) {
      const parts = image.split(';base64,');
      const mimePart = parts[0];
      base64Data = parts[1];
      mimeType = mimePart.replace('data:', '');
    }

    const systemInstruction = `You are an expert official KYC compliance officer. 
Analyze the uploaded National ID (NID), Passport, or Driving License image.
Verify if:
1. It is a genuine, official document (NID, Passport, or License) from a country (frequently Bangladesh, but can be other countries).
2. It is an original physical card/document itself, NOT a photograph of a computer screen, a photocopy, a piece of paper, a random object, or a fake generated card.
3. The details are legible.

Extract these details:
- Document Type: NID, Passport, or License.
- Document Number (the official card or ID number).
- Full Name.
- Date of Birth (standard YYYY-MM-DD format).
- Calculate Age as of 2026-07-18 and determine if the person is over 18 (isOver18: true).
- Address (if present).
- Originality confidence: a score from 0-100 on how confident you are that this is a real, original, physical card/document in hand.
- isOriginal: true if confidence >= 80, else false.
- Rejection reason: if not valid, not readable, or appears fake/copied, state the clear reason in a friendly but professional tone.

Provide your response strictly matching the schema. If it's not a real ID card, set isValidDocument to false and provide a rejectionReason.`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };

    const promptPart = {
      text: "Analyze this document image for official KYC verification. Be extremely precise and strict. Rejects fakes, computer screens, or paper prints.",
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: [imagePart, promptPart] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValidDocument: { type: Type.BOOLEAN },
            documentType: { type: Type.STRING },
            documentNumber: { type: Type.STRING },
            fullName: { type: Type.STRING },
            dateOfBirth: { type: Type.STRING },
            age: { type: Type.INTEGER },
            isOver18: { type: Type.BOOLEAN },
            address: { type: Type.STRING },
            originalityConfidence: { type: Type.INTEGER },
            isOriginal: { type: Type.BOOLEAN },
            rejectionReason: { type: Type.STRING }
          },
          required: ["isValidDocument", "documentType", "documentNumber", "fullName", "dateOfBirth", "age", "isOver18", "isOriginal"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI engine");
    }

    const result = JSON.parse(text.trim());
    res.json(result);
  } catch (err: any) {
    logger.error(`KYC scan failed: ${err.message}`);
    res.status(500).json({ error: err.message || 'Verification scan failed' });
  }
});

// 2. Submit KYC verification application (linked with Firestore)
router.post('/kyc', requireAuth, async (req: AuthRequest, res) => {
  const { userId, kycData } = req.body;
  if (!userId || !kycData) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Write request to Firestore (if available)
    let firestoreId = '';
    try {
      const docRef = await adminDb.collection('kycRequests').add({
        userId,
        userEmail: kycData.userEmail || req.user!.email,
        fullName: kycData.fullName,
        idType: kycData.idType,
        idNumber: kycData.idNumber,
        idFrontUrl: kycData.idFrontUrl,
        idBackUrl: kycData.idBackUrl || '',
        selfieUrl: kycData.selfieUrl || '',
        status: 'pending',
        submittedAt: Date.now(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      firestoreId = docRef.id;
    } catch (firestoreErr: any) {
      logger.warn(`Firestore KYC submission failed: ${firestoreErr.message}`);
    }

    // Write to SQL database (Backup/Primary fallback)
    await run(
      `INSERT INTO kyc_requests (user_id, status, full_name, document_type, document_number, front_image, back_image, selfie_image, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        'pending', 
        kycData.fullName, 
        kycData.idType, 
        kycData.idNumber, 
        kycData.idFrontUrl, 
        kycData.idBackUrl || '', 
        kycData.selfieUrl || '', 
        Date.now(), 
        Date.now()
      ]
    );

    // Update users table in SQLite/MySQL database
    await run('UPDATE users SET kyc_status = ? WHERE uid = ?', ['pending', userId]);

    // Emit live socket event to notify user profile has changed
    const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [userId]) as any;
    if (updatedUser) {
      getIO().to(`user_${userId}`).emit('user_profile_update', mapUserForFrontend(updatedUser));
    }

    res.json({ success: true, id: firestoreId || `sql-${Date.now()}` });
  } catch (err: any) {
    logger.error(`Error submitting KYC request: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 3. Get latest KYC status of user
router.get('/user/kyc-status', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  try {
    let snap;
    try {
      snap = await adminDb.collection('kycRequests')
        .where('userId', '==', userId)
        .orderBy('submittedAt', 'desc')
        .limit(1)
        .get();
    } catch (firestoreErr: any) {
      if (firestoreErr.code !== 5 && !firestoreErr.message?.includes('NOT_FOUND')) {
        logger.warn(`Firestore KYC fetch failed: ${firestoreErr.message}`);
      }
      // Fallback to SQL below
      snap = { empty: true };
    }
    
    if (snap && !snap.empty) {
      const docData = snap.docs[0].data();
      res.json({
        id: snap.docs[0].id,
        status: docData.status,
        createdAt: docData.submittedAt || Date.now(),
        ...docData
      });
    } else {
      const user = await get('SELECT kyc_status FROM users WHERE uid = ?', [userId]) as any;
      if (user) {
        res.json({ status: user.kyc_status === 'verified' ? 'approved' : 'unverified' });
      } else {
        res.json(null);
      }
    }
  } catch (err: any) {
    logger.error(`Error fetching kyc status: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 4. Update KYC request status (Admin-only operation)
router.post('/admin/kyc/update', requireAuth, async (req: AuthRequest, res) => {
  const user = await get('SELECT role FROM users WHERE uid = ?', [req.user!.uid]) as any;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized admin operations' });
  }

  const { id, userId, status } = req.body;
  if (!id || !userId || !status) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    await adminDb.collection('kycRequests').doc(id).update({
      status,
      updatedAt: new Date()
    });

    const kyc_status = status === 'approved' ? 'verified' : 'unverified';
    await run('UPDATE users SET kyc_status = ? WHERE uid = ?', [kyc_status, userId]);

    const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [userId]) as any;
    getIO().to(`user_${userId}`).emit('user_profile_update', mapUserForFrontend(updatedUser));

    res.json({ success: true });
  } catch (err: any) {
    logger.error(`Error updating KYC request status: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// --- Activities & Banners ---
router.get('/activities', async (req, res) => {
  res.json([
    { id: '1', title: 'Welcome Bonus', description: 'Get 100% bonus on your first deposit!', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000' },
    { id: '2', title: 'Refer & Earn', description: 'Invite your friends and earn 10% commission.', image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=1000' }
  ]);
});

router.post('/activities', async (req, res) => {
  res.json({ success: true });
});

// --- Legacy/Alias Routes for Compatibility ---
router.post('/deposit', async (req, res) => {
  // Redirect to wallet/deposit logic or just re-implement
  res.status(200).json({ success: true, message: 'Deposit endpoint reached. Please use /api/wallet/deposit' });
});

router.post('/withdraw', async (req, res) => {
  res.status(200).json({ success: true, message: 'Withdraw endpoint reached. Please use /api/wallet/withdraw' });
});

router.get('/transactions', requireAuth, async (req: AuthRequest, res) => {
  const history = await query(
    `SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [req.user!.uid]
  );
  res.json(history);
});

export default router;
