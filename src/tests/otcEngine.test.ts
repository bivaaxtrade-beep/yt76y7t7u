import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import Database from 'better-sqlite3';

const mockInMemoryDb = new Database(':memory:');
mockInMemoryDb.exec(`
  CREATE TABLE historical_candles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    market TEXT NOT NULL,
    type TEXT NOT NULL,
    timeframe TEXT NOT NULL,
    open NUMERIC NOT NULL,
    high NUMERIC NOT NULL,
    low NUMERIC NOT NULL,
    close NUMERIC NOT NULL,
    volume NUMERIC NOT NULL,
    openTime INTEGER NOT NULL,
    closeTime INTEGER NOT NULL
  );
  CREATE UNIQUE INDEX idx_historical_candles_market_type_tf_opentime 
  ON historical_candles (market, type, timeframe, openTime);
`);

vi.doMock('../db/mysql-db.ts', () => ({
  default: mockInMemoryDb,
  query: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
  transaction: vi.fn((cb) => cb(mockInMemoryDb)),
}));

vi.doMock('../services/socketService.ts', () => ({
  getIO: vi.fn(() => ({
    to: vi.fn(() => ({
      emit: vi.fn()
    }))
  }))
}));

const mockMarkets = {
  'EUR/USD (OTC)': { name: 'EUR/USD (OTC)', price: 1.0850, volatility: 0.0001 }
};

vi.doMock('../services/marketService.ts', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    markets_real: JSON.parse(JSON.stringify(mockMarkets)),
    markets_demo: JSON.parse(JSON.stringify(mockMarkets)),
    history_real: {},
    history_demo: {},
    currentCandles_real: {},
    currentCandles_demo: {},
    saveCandleToDB_v2: (pair: string, type: string, timeframe: string, candle: any) => {
      mockInMemoryDb.prepare(`
        INSERT INTO historical_candles (market, type, timeframe, open, high, low, close, volume, openTime, closeTime)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(market, type, timeframe, openTime) DO UPDATE SET
          high = excluded.high,
          low = excluded.low,
          close = excluded.close,
          volume = excluded.volume,
          closeTime = excluded.closeTime
      `).run(
        pair,
        type,
        timeframe,
        Number(candle.open).toFixed(6),
        Number(candle.high).toFixed(6),
        Number(candle.low).toFixed(6),
        Number(candle.close).toFixed(6),
        Number(candle.volume).toFixed(2),
        candle.openTime,
        candle.closeTime
      );
    }
  };
});

// System under test must be dynamically imported AFTER mocks are defined
let updatePair: any;
let marketService: any;

describe('OTC Candle Engine Unit Tests', () => {
  const pair = 'EUR/USD (OTC)';
  
  beforeAll(async () => {
    const otcModule = await import('../services/otcEngine.ts');
    updatePair = otcModule.updatePair;
    marketService = await import('../services/marketService.ts');
  });

  beforeEach(() => {
    mockInMemoryDb.prepare('DELETE FROM historical_candles').run();
    marketService.currentCandles_real[pair] = undefined;
    marketService.history_real[pair] = {};
    marketService.markets_real[pair].price = 1.0850;
  });

  it('should initialize a new candle if none exists', () => {
    const now = 100000;
    const result = updatePair(pair, 'real', now);
    
    expect(result).toBeDefined();
    expect(marketService.currentCandles_real[pair]['5 seconds']).toBeDefined();
    
    const candle = marketService.currentCandles_real[pair]['5 seconds'];
    expect(candle.openTime).toBe(now - (now % 5));
    
    const dbCandle = mockInMemoryDb.prepare('SELECT * FROM historical_candles WHERE market = ? AND timeframe = ?').get(pair, '5 seconds') as any;
    expect(dbCandle).toBeDefined();
    expect(dbCandle.openTime).toBe(candle.openTime);
  });

  it('should update OHLC data within the same timeframe', () => {
    const startTime = 100000;
    updatePair(pair, 'real', startTime);
    const initialPrice = marketService.markets_real[pair].price;
    
    const secondTime = startTime + 1;
    updatePair(pair, 'real', secondTime);
    
    const candle = marketService.currentCandles_real[pair]['5 seconds'];
    const currentPrice = marketService.markets_real[pair].price;
    
    expect(candle.close).toBe(currentPrice);
    expect(candle.high).toBeGreaterThanOrEqual(Math.max(initialPrice, currentPrice));
    expect(candle.low).toBeLessThanOrEqual(Math.min(initialPrice, currentPrice));
    
    const dbCandle = mockInMemoryDb.prepare('SELECT * FROM historical_candles WHERE market = ? AND timeframe = ? AND openTime = ?').get(pair, '5 seconds', 100000) as any;
    expect(Number(dbCandle.close)).toBeCloseTo(currentPrice, 6);
  });

  it('should switch to a new candle when the timeframe threshold is crossed', () => {
    const startTime = 100000;
    updatePair(pair, 'real', startTime);
    
    const firstCandleOpenTime = marketService.currentCandles_real[pair]['5 seconds'].openTime;
    
    const nextTime = 100005;
    updatePair(pair, 'real', nextTime);
    
    const newCandle = marketService.currentCandles_real[pair]['5 seconds'];
    expect(newCandle.openTime).toBe(100005);
    expect(newCandle.openTime).not.toBe(firstCandleOpenTime);
    
    const history = marketService.history_real[pair]['5 seconds'];
    expect(history.length).toBe(1);
    expect(history[0].openTime).toBe(100000);
    
    const dbCandle = mockInMemoryDb.prepare('SELECT * FROM historical_candles WHERE market = ? AND timeframe = ? AND openTime = ?').get(pair, '5 seconds', 100000) as any;
    expect(dbCandle).toBeDefined();
  });

  it('should fill gaps between candles if time jumps significantly', () => {
    const startTime = 100000;
    updatePair(pair, 'real', startTime);
    
    const skipTime = 100020;
    updatePair(pair, 'real', skipTime);
    
    const history = marketService.history_real[pair]['5 seconds'];
    expect(history.length).toBe(4);
    
    const openTimes = history.map(h => h.openTime);
    expect(openTimes).toContain(100000);
    expect(openTimes).toContain(100005);
    expect(openTimes).toContain(100010);
    expect(openTimes).toContain(100015);
    
    expect(marketService.currentCandles_real[pair]['5 seconds'].openTime).toBe(100020);
    
    const dbCountResult = mockInMemoryDb.prepare('SELECT COUNT(*) as count FROM historical_candles WHERE market = ? AND timeframe = ?').get(pair, '5 seconds') as any;
    expect(dbCountResult.count).toBe(5);
  });

  it('should handle multiple timeframes correctly', () => {
    const now = 100000;
    updatePair(pair, 'real', now);
    
    const candle5s = marketService.currentCandles_real[pair]['5 seconds'];
    const candle1m = marketService.currentCandles_real[pair]['1 minute'];
    
    expect(candle5s.openTime).toBe(100000);
    expect(candle1m.openTime).toBe(100000 - (100000 % 60));
    
    const db5s = mockInMemoryDb.prepare('SELECT * FROM historical_candles WHERE timeframe = ?').get('5 seconds') as any;
    const db1m = mockInMemoryDb.prepare('SELECT * FROM historical_candles WHERE timeframe = ?').get('1 minute') as any;
    
    expect(db5s).toBeDefined();
    expect(db1m).toBeDefined();
  });
});
