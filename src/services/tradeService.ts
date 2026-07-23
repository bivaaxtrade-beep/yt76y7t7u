import { get, query, run, transaction } from '../db/mysql-db.ts';
import { markets_real, markets_demo } from './marketService.ts';
import { getIO } from './socketService.ts';
import { createAuditLog } from '../lib/audit.ts';
import logger from '../lib/logger.ts';
import { mapUserForFrontend } from '../lib/user-utils.ts';
import { updateLeaderboardStats, broadcastLeaderboards } from './leaderboardService.ts';

let isSettling = false;

// Global cache for trade exposure: pair_type -> net exposure (positive means UP trades dominate, negative means DOWN trades dominate)
export const tradeExposureCache = new Map<string, number>();

export async function updateTradeExposureCache() {
  try {
    const openTrades = await query(`
      SELECT market_id, is_demo, direction, SUM(amount) as total 
      FROM trades 
      WHERE status = 'open' 
      GROUP BY market_id, is_demo, direction
    `) as any[];

    tradeExposureCache.clear();
    
    for (const row of openTrades) {
      const type = row.is_demo ? 'demo' : 'real';
      const key = `${row.market_id}_${type}`;
      const amount = parseFloat(row.total);
      
      let current = tradeExposureCache.get(key) || 0;
      if (row.direction === 'up') {
        current += amount;
      } else {
        current -= amount;
      }
      tradeExposureCache.set(key, current);
    }
  } catch (err) {
    logger.error('Failed to update trade exposure cache:', err);
  }
}

export async function settleExpiredTrades() {
  if (isSettling) return;
  isSettling = true;
  let broadcastNeeded = false;
  try {
    const now = Math.floor(Date.now() / 1000);
    const expiredTrades = await query(
      'SELECT id, is_demo FROM trades WHERE status = ? AND expiry_time <= ?',
      ['open', now]
    ) as any[];

    for (const trade of expiredTrades) {
      await settleTrade(trade.id);
      if (!trade.is_demo) {
        broadcastNeeded = true;
      }
    }
    
    if (broadcastNeeded) {
      broadcastLeaderboards().catch(err => console.error('Broadcast leaderboard error:', err));
    }
  } catch (err) {
    logger.error('Failed to settle expired trades:', err);
  } finally {
    isSettling = false;
  }
}

export async function settleTrade(tradeId: number, currentMarketPrice?: number) {
  try {
    const result = await transaction(async (conn) => {
      // Lock the trade record
      const trade = await get('SELECT * FROM trades WHERE id = ?', [tradeId], conn) as any;
      if (!trade || trade.status !== 'open') return null;

      const isDemo = !!trade.is_demo;
      const marketsPool = isDemo ? markets_demo : markets_real;
      const m = marketsPool[trade.market_id];
      
      const exitPrice = currentMarketPrice !== undefined ? currentMarketPrice : (m ? m.price : parseFloat(trade.entry_price));
      const entryPrice = parseFloat(trade.entry_price);

      const diff = exitPrice - entryPrice;
      const epsilon = 0.0000000001;
      let isWin = false;
      let isDraw = Math.abs(diff) < epsilon;

      if (!isDraw) {
        if (trade.direction === 'up') {
          isWin = exitPrice > entryPrice;
        } else {
          isWin = exitPrice < entryPrice;
        }
      }

      let newStatus = 'lost';
      let payoutAmount = 0;
      const tradeAmount = parseFloat(trade.amount);

      if (isWin) {
        newStatus = 'won';
        const payoutPercent = m ? (m.payout || 82) : 80;
        payoutAmount = tradeAmount + (tradeAmount * (payoutPercent / 100));
      } else if (isDraw) {
        newStatus = 'draw';
        payoutAmount = tradeAmount;
      }

      // Update trade
      await run(
        'UPDATE trades SET status = ?, exit_price = ?, payout_amount = ?, settled_at = ? WHERE id = ?',
        [newStatus, exitPrice.toString(), payoutAmount.toString(), Math.floor(Date.now() / 1000), tradeId],
        conn
      );

      // Update user balance if payout > 0
      if (payoutAmount > 0) {
        const balanceField = isDemo ? 'demo_balance' : 'real_balance';
        // Lock user record
        const user = await get('SELECT ' + balanceField + ' FROM users WHERE uid = ?', [trade.user_id], conn) as any;
        const currentBalance = parseFloat(user[balanceField]);
        const newBalance = (currentBalance + payoutAmount).toFixed(2);
        await run(`UPDATE users SET ${balanceField} = ? WHERE uid = ?`, [newBalance, trade.user_id], conn);
        
        if (!isDemo) {
          await createAuditLog(trade.user_id, 'trade_payout', 'trade', tradeId.toString(), { payoutAmount, newBalance });
        }
      }

      if (!isDemo) {
        const profit = payoutAmount - tradeAmount;
        await updateLeaderboardStats(trade.user_id, newStatus as any, profit, tradeAmount, conn);
      }

      return { 
        id: tradeId, 
        status: newStatus, 
        exitPrice, 
        payoutAmount, 
        userId: trade.user_id,
        isDemo
      };
    });

    if (result) {
      const io = getIO();
      // Notify user via socket
      io.to(`user_${result.userId}`).emit('trade_settled', result);
      // Also notify balance update
      const user = await get('SELECT * FROM users WHERE uid = ?', [result.userId]) as any;
      io.to(`user_${result.userId}`).emit('user_profile_update', mapUserForFrontend(user));
    }

    return result;
  } catch (err) {
    console.error('Settlement error:', err);
    return null;
  }
}

