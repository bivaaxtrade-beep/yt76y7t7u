import { get, query, run, transaction } from '../db/mysql-db.ts';
import { getIO } from './socketService.ts';
import { mapUserForFrontend } from '../lib/user-utils.ts';
import { markets_real } from './marketService.ts';
import logger from '../lib/logger.ts';

/**
 * Process copy trading for a master trader's trade
 */
export async function processCopyTrading(masterId: string, tradeData: { marketId: string, direction: string, duration: number, entryPrice: number, isDemo: boolean }) {
  try {
    // 1. Find all active followers for this master
    const followers = await query("SELECT * FROM active_copies WHERE master_id = ? AND status = 'active'", [masterId]) as any[];
    
    for (const follower of followers) {
      try {
        await transaction(async (conn) => {
          // Check follower's trade limit
          if (follower.trades_limit > 0 && follower.copied_trades >= follower.trades_limit) {
            // Deactivate copy relationship
            await run("UPDATE active_copies SET status = 'inactive' WHERE id = ?", [follower.id], conn);
            return;
          }

          const userId = follower.user_id;
          const isDemo = tradeData.isDemo; // Usually followers copy the same account type or real
          const balanceField = isDemo ? 'demo_balance' : 'real_balance';
          
          // Get follower's balance
          const user = await get(`SELECT ${balanceField} FROM users WHERE uid = ?`, [userId], conn) as any;
          if (!user) return;

          const currentBalance = parseFloat(user[balanceField]);
          const tradeAmount = parseFloat(follower.max_trade_amount || '10');

          if (currentBalance < tradeAmount) {
            // Not enough balance, maybe notify?
            return;
          }

          // Deduct balance
          const newBalance = (currentBalance - tradeAmount).toFixed(2);
          await run(`UPDATE users SET ${balanceField} = ? WHERE uid = ?`, [newBalance, userId], conn);

          // Create trade
          const expiryTime = Math.floor((Date.now() + tradeData.duration * 1000) / 1000);
          await run(
            `INSERT INTO trades (user_id, market_id, amount, direction, entry_price, duration, expiry_time, is_demo, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, tradeData.marketId, tradeAmount.toString(), tradeData.direction, tradeData.entryPrice.toString(), tradeData.duration, expiryTime, isDemo ? 1 : 0, 'open'],
            conn
          );

          // Update copy stats
          await run('UPDATE active_copies SET copied_trades = copied_trades + 1 WHERE id = ?', [follower.id], conn);

          // Notify follower
          const updatedUser = await get('SELECT * FROM users WHERE uid = ?', [userId], conn) as any;
          getIO().to(`user_${userId}`).emit('user_profile_update', mapUserForFrontend(updatedUser));
          getIO().to(`user_${userId}`).emit('trade_placed', { success: true, message: `Copied trade from ${follower.master_name}` });
        });
      } catch (err) {
        logger.error(`Failed to process copy for user ${follower.user_id}:`, err);
      }
    }
  } catch (err) {
    logger.error(`Error in processCopyTrading for master ${masterId}:`, err);
  }
}

/**
 * Start simulation of mock master traders to make the platform feel alive
 */
export function startMasterSimulation() {
  setInterval(async () => {
    try {
      // 1. Get mock masters
      const mockMasters = await query('SELECT * FROM master_traders') as any[];
      if (!mockMasters || mockMasters.length === 0) return;

      // 2. Pick a random master to "trade"
      const master = mockMasters[Math.floor(Math.random() * mockMasters.length)];
      
      // 3. Random trade parameters
      const marketIds = Object.keys(markets_real);
      const marketId = marketIds[Math.floor(Math.random() * marketIds.length)];
      const direction = Math.random() > 0.5 ? 'up' : 'down';
      const duration = 60; // 1 minute
      const currentPrice = markets_real[marketId]?.price || 1.0;

      // 4. Process copying for this simulated trade
      // Simulation is always on 'real' account type to show balance changes if the user has followers
      await processCopyTrading(master.id, {
        marketId,
        direction,
        duration,
        entryPrice: currentPrice,
        isDemo: false
      });

    } catch (err) {
      logger.error('Master simulation error:', err);
    }
  }, 30000); // Every 30 seconds a random master trades
}

/**
 * Seed initial master traders if the table is empty
 */
export async function seedMasterTraders() {
  try {
    const existing = await query('SELECT COUNT(*) as count FROM master_traders') as any[];
    if (existing[0].count > 0) return;

    const traders = [
      { id: 'm1', name: 'CRISHTTRADER', country: '🇻🇪', win_rate: 88, profit: 45000, followers: 6 },
      { id: 'm2', name: 'OBOROTEN', country: '🇺🇦', win_rate: 81, profit: 86000, followers: 13 },
      { id: 'm3', name: 'GEOVANNY', country: '🇨🇴', win_rate: 74, profit: 12000, followers: 5 },
      { id: 'm4', name: 'ALEX FOREX', country: '🇬🇧', win_rate: 92, profit: 125000, followers: 38 },
      { id: 'm5', name: 'BINANCE WHALE', country: '🇸🇬', win_rate: 85, profit: 240000, followers: 71 },
      { id: 'm6', name: 'TRADEMINATOR', country: '🇧🇩', win_rate: 89, profit: 155000, followers: 42 }
    ];

    for (const t of traders) {
      await run(
        'INSERT INTO master_traders (id, name, country, win_rate, profit, followers) VALUES (?, ?, ?, ?, ?, ?)',
        [t.id, t.name, t.country, t.win_rate, t.profit, t.followers]
      );
    }
    logger.info('Master traders seeded successfully');
  } catch (err) {
    logger.error('Failed to seed master traders:', err);
  }
}
