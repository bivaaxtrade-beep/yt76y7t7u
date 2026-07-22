const Database = require('better-sqlite3');
const db = new Database('database.sqlite');
console.time('query');
const rows = db.prepare(`
  SELECT 
    user_id,
    SUM(payout_amount - amount) as total_profit,
    COUNT(*) as total_trades,
    SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won_trades
  FROM trades
  WHERE account_type = 'real' AND status IN ('won', 'lost', 'draw')
  GROUP BY user_id
  ORDER BY total_profit DESC
  LIMIT 20
`).all();
console.timeEnd('query');
console.log(rows);
