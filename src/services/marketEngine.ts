import { getIO } from './socketService.ts';
import { 
  markets_real, markets_demo, 
  history_real, history_demo, 
  currentCandles_real, currentCandles_demo,
  systemActive, globalManipulationMode,
  fetchAllRealPrices, initializeCandlesFromDB,
  saveCandleToDB_v2, TIMEFRAMES, timeframeSecondsMap
} from './marketService.ts';
import { markets } from '../markets.ts';
import { settleExpiredTrades, updateTradeExposureCache } from './tradeService.ts';
import { updatePair } from './otcEngine.ts';

const TICK_INTERVAL = 50;

export async function startMarketEngine() {
  console.log('🚀 Starting Market Engine...');
  
  // Initialize candles from the database asynchronously in background
  initializeCandlesFromDB().catch(err => console.error("Error initializing candles:", err));
  
  // Initial price fetch
  fetchAllRealPrices();
  setInterval(fetchAllRealPrices, 15000); // Sync with real prices every 15 seconds (reduced from 60s)

  // Start Real-time WebSocket Service
  import('./liveApiService.ts').then(m => m.liveApiService.start()).catch(e => console.error("Live API Start Error:", e));

  // Settle expired trades every 1 second
  setInterval(async () => {
    if (!systemActive) return;
    try {
      await updateTradeExposureCache();
      await settleExpiredTrades();
    } catch (e) {
      console.error('Settlement error:', e);
    }
  }, 1000);

  // Main Ticker Loop (100ms)
  setInterval(async () => {
    if (!systemActive) return;

    const io = getIO();
    const nowSec = Math.floor(Date.now() / 1000);

    const tickDataReal: Record<string, any> = {};
    const tickDataDemo: Record<string, any> = {};

    Object.keys(markets).forEach(pair => {
      const realTick = updatePair(pair, 'real', nowSec);
      if (realTick) {
        tickDataReal[pair] = realTick;
        tickDataDemo[pair] = realTick; // Use identical tick for demo
      }
    });

    // Broadcast market states (ticks)
    Object.keys(tickDataReal).forEach(pair => {
       io.to(`market_${pair}_real`).emit('market_ticks', { [pair]: tickDataReal[pair] });
    });
    Object.keys(tickDataDemo).forEach(pair => {
       io.to(`market_${pair}_demo`).emit('market_ticks', { [pair]: tickDataDemo[pair] });
    });

    // We can broadcast the full update less frequently, or keep it.
    // For 100ms, broadcasting full markets might be heavy. 
    // Let's only emit 'market_update' every 1000ms.
  }, TICK_INTERVAL);

  // Broadcast full markets every 1 second
  setInterval(() => {
    if (!systemActive) return;
    const io = getIO();
    io.to('real').emit('market_update', markets_real);
    io.to('demo').emit('market_update', markets_demo);
  }, 1000);
}

