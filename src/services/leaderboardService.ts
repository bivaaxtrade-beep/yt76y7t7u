import { get, query, run } from '../db/mysql-db.ts';
import { getIO } from './socketService.ts';

export const updateLeaderboardStats = async (userId: string, tradeStatus: 'won' | 'lost' | 'draw', profit: number, volume: number, conn?: any) => {
  try {
    const stat = await get('SELECT * FROM leaderboard_stats WHERE user_id = ?', [userId], conn) as any;
    const now = Date.now();
    
    if (!stat) {
      const isWin = tradeStatus === 'won';
      const currentStreak = isWin ? 1 : (tradeStatus === 'lost' ? -1 : 0);
      const won = isWin ? 1 : 0;
      const lost = tradeStatus === 'lost' ? 1 : 0;
      const draw = tradeStatus === 'draw' ? 1 : 0;
      const roi = volume > 0 ? (profit / volume) * 100 : 0;

      await run(`
        INSERT INTO leaderboard_stats (
          user_id, total_profit, total_trades, won_trades, lost_trades, draw_trades,
          total_volume, current_streak, max_streak, roi, last_trade_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, profit, 1, won, lost, draw, volume, currentStreak, isWin ? 1 : 0, roi, now], conn);
    } else {
      let currentStreak = stat.current_streak || 0;
      let maxStreak = stat.max_streak || 0;

      if (tradeStatus === 'won') {
        currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else if (tradeStatus === 'lost') {
        currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
      } else {
        currentStreak = 0; // Draw resets streak
      }

      const newVolume = (stat.total_volume || 0) + volume;
      const newProfit = (stat.total_profit || 0) + profit;
      const newRoi = newVolume > 0 ? (newProfit / newVolume) * 100 : 0;

      await run(`
        UPDATE leaderboard_stats SET 
          total_profit = total_profit + ?,
          total_trades = total_trades + 1,
          won_trades = won_trades + ?,
          lost_trades = lost_trades + ?,
          draw_trades = draw_trades + ?,
          total_volume = ?,
          current_streak = ?,
          max_streak = ?,
          roi = ?,
          last_trade_at = ?
        WHERE user_id = ?
      `, [
        profit, 
        tradeStatus === 'won' ? 1 : 0,
        tradeStatus === 'lost' ? 1 : 0,
        tradeStatus === 'draw' ? 1 : 0,
        newVolume, currentStreak, maxStreak, newRoi, now, userId
      ], conn);
    }
  } catch (err) {
    console.error('Error updating leaderboard stats:', err);
  }
};

export const fetchLeaderboards = async () => {
  try {
    // 1. All Time Top Profit
    const allTime = await query(`
      SELECT l.*, u.display_name, u.photo_url, u.country
      FROM leaderboard_stats l
      JOIN users u ON l.user_id = u.uid
      ORDER BY l.total_profit DESC
      LIMIT 20
    `) || [];

    // 2. Highest Win Rate (min 10 trades)
    const winRate = await query(`
      SELECT l.*, u.display_name, u.photo_url, u.country,
      CAST(l.won_trades AS REAL) / l.total_trades * 100 as win_percentage
      FROM leaderboard_stats l
      JOIN users u ON l.user_id = u.uid
      WHERE l.total_trades >= 10
      ORDER BY win_percentage DESC
      LIMIT 20
    `) || [];

    // 3. Current Max Streak
    const streaks = await query(`
      SELECT l.*, u.display_name, u.photo_url, u.country
      FROM leaderboard_stats l
      JOIN users u ON l.user_id = u.uid
      ORDER BY l.max_streak DESC
      LIMIT 20
    `) || [];

    const oneDayAgo = Math.floor(Date.now() / 1000) - 24 * 60 * 60;
    const daily = await query(`
      SELECT t.user_id, SUM(t.payout_amount - t.amount) as profit,
      u.display_name, u.photo_url, u.country
      FROM trades t
      JOIN users u ON t.user_id = u.uid
      WHERE (t.account_type = 'real' OR t.is_demo = 0) AND t.status IN ('won', 'lost', 'draw')
      AND t.settled_at >= ?
      GROUP BY t.user_id
      ORDER BY profit DESC
      LIMIT 20
    `, [oneDayAgo]) || [];

    const sevenDaysAgo = Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60;
    const weekly = await query(`
      SELECT t.user_id, SUM(t.payout_amount - t.amount) as profit,
      u.display_name, u.photo_url, u.country
      FROM trades t
      JOIN users u ON t.user_id = u.uid
      WHERE (t.account_type = 'real' OR t.is_demo = 0) AND t.status IN ('won', 'lost', 'draw')
      AND t.settled_at >= ?
      GROUP BY t.user_id
      ORDER BY profit DESC
      LIMIT 20
    `, [sevenDaysAgo]) || [];

    return { allTime, winRate, streaks, daily, weekly };
  } catch (err) {
    console.error('Failed to fetch leaderboards:', err);
    return { allTime: [], winRate: [], streaks: [], daily: [], weekly: [] };
  }
};

export const broadcastLeaderboards = async () => {
  const data = await fetchLeaderboards();
  if (data) {
    const io = getIO();
    io.emit('leaderboard_update', data);
  }
};
