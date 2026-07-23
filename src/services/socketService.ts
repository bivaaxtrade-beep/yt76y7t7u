import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../lib/auth-server.ts';
import { history_real, history_demo, currentCandles_real, currentCandles_demo, markets_real, markets_demo, systemActive } from './marketService.ts';
import { get, run, query } from '../db/mysql-db.ts';
import { mapUserForFrontend } from '../lib/user-utils.ts';

function getTimeSeconds(tf: string): number {
  if (!tf || typeof tf !== 'string') return 5;
  const parts = tf.split(" ");
  const val = parseInt(parts[0]);
  const unit = parts[1];
  if (!unit) return 5;
  if (unit.startsWith("second")) return val;
  if (unit.startsWith("minute")) return val * 60;
  if (unit.startsWith("hour")) return val * 3600;
  if (unit.startsWith("day")) return val * 86400;
  return 5;
}

let io: Server;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    // Join market specific rooms
    socket.on('subscribe_market', (pair: string, type: string) => {
      socket.join(`market_${pair}_${type}`);
      socket.join(type); // 'real' or 'demo'
    });

    socket.on('unsubscribe_market', (pair: string, type: string) => {
      socket.leave(`market_${pair}_${type}`);
    });

    // User-specific room for private updates (balance, trade results)
    socket.on('authenticate', (token: string) => {
      try {
        const decoded = verifyToken(token) as any;
        if (decoded) {
          socket.data.userId = decoded.uid;
          socket.join(`user_${decoded.uid}`);
          if (decoded.is_admin || decoded.role === 'admin' || decoded.role === 'support' || decoded.role === 'supervisor') {
            socket.join('agents_room');
          }
          console.log(`User/Agent ${decoded.uid} authenticated on socket ${socket.id}`);
        }
      } catch (err) {
        console.error('Socket authentication failed:', err);
      }
    });

    // Support Chat Rooms & Real-time Events
    socket.on('join_ticket', (ticketId: string) => {
      if (ticketId) {
        socket.join(`ticket_${ticketId}`);
      }
    });

    socket.on('leave_ticket', (ticketId: string) => {
      if (ticketId) {
        socket.leave(`ticket_${ticketId}`);
      }
    });

    socket.on('typing', ({ ticketId, senderType, isTyping }) => {
      if (ticketId) {
        socket.to(`ticket_${ticketId}`).emit('typing', { senderType, isTyping });
      }
    });

    socket.on('message_status', async ({ ticketId, messageId, status }) => {
      if (ticketId && messageId) {
        if (status === 'seen') {
          try {
            await run('UPDATE ticket_messages SET is_read = 1 WHERE id = ?', [messageId]);
          } catch (err) {}
        }
        socket.to(`ticket_${ticketId}`).emit('message_status', { messageId, status });
      }
    });

    socket.on('request_initial_data', async (params: { asset: string, accountType: 'real' | 'demo', timeframe?: string, userId?: string }) => {
      const { asset, accountType, userId, timeframe } = params;
      
      // 1. Handle Room Subscriptions
      // Leave all previous market rooms to prevent data leakage and excessive bandwidth
      Array.from(socket.rooms).forEach(room => {
        if (room.startsWith('market_') || room === 'real' || room === 'demo') {
          socket.leave(room);
        }
      });
      
      // Join the new market room and the account type room
      socket.join(`market_${asset}_${accountType}`);
      socket.join(accountType);
      
      const tf = timeframe || "1 minute";
      const history = accountType === 'real' ? history_real : history_demo;
      const currentCandles = accountType === 'real' ? currentCandles_real : currentCandles_demo;
      const pool = accountType === 'real' ? markets_real : markets_demo;

      const allCandles = (history[asset] && history[asset][tf]) ? history[asset][tf] : [];
      const candles = allCandles;
      const currentCandle = (currentCandles[asset] && currentCandles[asset][tf]) ? {
        time: currentCandles[asset][tf].openTime,
        open: currentCandles[asset][tf].open,
        high: currentCandles[asset][tf].high,
        low: currentCandles[asset][tf].low,
        close: currentCandles[asset][tf].close,
        volume: currentCandles[asset][tf].volume
      } : null;

      socket.emit('initial_market_data', {
        markets: pool,
        systemActive,
        history: {
          [asset]: candles
        },
        currentCandles: {
          [asset]: currentCandle
        },
        activities: [],
        serverTime: Date.now()
      });

      // If userId provided and authenticated, send profile update
      if (userId || socket.data.userId) {
        const uid = userId || socket.data.userId;
        const user = await get('SELECT * FROM users WHERE uid = ?', [uid]);
        if (user) {
          socket.emit('user_profile_update', mapUserForFrontend(user));
        }
      }
    });

    socket.on('request_past_candles', async (params: { asset: string, accountType: 'real' | 'demo', timeframe: string, beforeTime: number, limit?: number }) => {
      const { asset, accountType, timeframe, beforeTime, limit = 1000 } = params;
      try {
        const rows = await query(`
          SELECT openTime as time, open, high, low, close, volume, openTime, closeTime
          FROM historical_candles
          WHERE market = ? AND type = ? AND timeframe = ? AND openTime < ?
          ORDER BY openTime DESC
          LIMIT ?
        `, [asset, accountType, timeframe, beforeTime, limit]);

        const formattedRows = rows.map((r: any) => ({
          time: r.time,
          open: parseFloat(r.open) || 0,
          high: parseFloat(r.high) || 0,
          low: parseFloat(r.low) || 0,
          close: parseFloat(r.close) || 0,
          volume: parseFloat(r.volume) || 0,
          openTime: r.openTime,
          closeTime: r.closeTime
        })).reverse();

        socket.emit('past_candles_response', {
          asset,
          timeframe,
          candles: formattedRows
        });
      } catch (err) {
        console.error('Failed to fetch past candles:', err);
        socket.emit('past_candles_response', {
          asset,
          timeframe,
          candles: [],
          error: 'Failed to fetch historical candles'
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}
