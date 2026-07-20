import { 
  markets_real, markets_demo, 
  history_real, history_demo, 
  currentCandles_real, currentCandles_demo,
  saveCandleToDB_v2, TIMEFRAMES, timeframeSecondsMap
} from './marketService.ts';
import { getIO } from './socketService.ts';

const pairStates = new Map<string, {
  trend: number;
  trendDuration: number;
  volatilityMultiplier: number;
  lastTickTime: number;
  newsEvent?: {
    intensity: number;
    duration: number;
    direction: number;
  };
}>();

import { globalManipulationMode } from './marketService.ts';

export function updatePair(pair: string, type: 'real' | 'demo', now: number) {
  const pool = type === 'real' ? markets_real : markets_demo;
  const historyPool = type === 'real' ? history_real : history_demo;
  const candlePool = type === 'real' ? currentCandles_real : currentCandles_demo;
  
  const m = pool[pair];
  if (!m) return null;

  // Force targetPrice to null for real markets to ensure erratic simulation behavior
  if (type === 'real') {
    m.targetPrice = null;
  }

  const stateKey = `${pair}_${type}`;
  let state = pairStates.get(stateKey);
  if (!state) {
    state = {
      trend: 0,
      trendDuration: 0,
      volatilityMultiplier: 1,
      lastTickTime: Date.now()
    };
    pairStates.set(stateKey, state);
  }

  // 1. Calculate Time Step (dt)
  const nowMs = Date.now();
  let dt = (nowMs - state.lastTickTime) / 1000;
  if (dt <= 0) dt = 0.1;
  if (dt > 2) dt = 0.1;
  state.lastTickTime = nowMs;

  // 2. Trend & Momentum Management
  state.trendDuration -= (dt * 1000);
  
  // Handle News Events
  if (state.newsEvent) {
    state.newsEvent.duration -= (dt * 1000);
    if (state.newsEvent.duration <= 0) {
      state.newsEvent = undefined;
    }
  } else if (m.newsTrigger) {
    state.newsEvent = m.newsTrigger;
    m.newsTrigger = null; // Consume the trigger
    console.log(`📡 Manual News Event on ${pair} (${type})! Direction: ${state.newsEvent.direction}`);
  } else if (Math.random() < 0.0005 * dt) { // Random news event ~ every 30 mins per pair
    state.newsEvent = {
      intensity: 3 + Math.random() * 5,
      duration: 5000 + Math.random() * 10000,
      direction: Math.random() > 0.5 ? 1 : -1
    };
    console.log(`📡 Random News Event on ${pair} (${type})! Direction: ${state.newsEvent.direction}`);
  }

  if (state.trendDuration <= 0) {
    state.trendDuration = 10000 + Math.random() * 30000; // Longer trends: 10-40s
    
    let trendPower = (Math.random() - 0.5) * 2;
    
    // Global Manipulation Integration
    if (globalManipulationMode === 'always_loss') {
      // For demo accounts, maybe we want them to lose? Or is it for real accounts?
      // Usually manipulation is per-user, but global mode affects everyone.
      // If we want a general "market crash" or "pump", we can use this.
    }

    state.trend = trendPower * 0.0008; // Slightly stronger base trend
    state.volatilityMultiplier = 0.7 + Math.random() * 0.6;
  }

  // 3. GEOMETRIC BROWNIAN MOTION (GBM) CALCULATION with News & Manipulation
  const currentPrice = Number(m.price) || 100;
  
  let baseSigma = Number(m.volatility) || 0.0002;
  if (baseSigma > 1) {
    baseSigma = baseSigma / currentPrice;
  }
  
  // If no target price is available, increase volatility and add random drift
  // to ensure the market remains dynamic.
  let volatilityMultiplier = state.volatilityMultiplier || 1;
  if (m.targetPrice === null) {
      volatilityMultiplier *= (type === 'real' ? 3.0 : 1.5); // Even higher volatility for real markets (erratic)
  }

  let sigma = baseSigma * volatilityMultiplier;
  let mu = state.trend || 0;

  // Apply news intensity
  if (state.newsEvent) {
    sigma *= (state.newsEvent.intensity || 1);
    mu += (state.newsEvent.direction || 1) * 0.002 * (state.newsEvent.intensity || 1);
  }
  
  // Target Price Smoothing
  let targetDrift = 0;
  if (m.targetPrice && Math.abs(m.targetPrice - currentPrice) > (currentPrice * 0.00001)) {
    const diff = Number(m.targetPrice) - currentPrice;
    targetDrift = (diff / currentPrice) * 0.1 * dt; // Faster smoothing (10% per sec)
  } else if (m.targetPrice === null) {
      // If no target price, add a small random drift to simulate market sentiment
      const driftMultiplier = type === 'real' ? 0.0015 : 0.0002;
      targetDrift = (Math.random() - 0.5) * driftMultiplier * dt;
  }
  
  const u1 = Math.random() || 0.0001; 
  const u2 = Math.random();
  const dW = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * Math.sqrt(dt);
  
  const drift = (mu - 0.5 * Math.pow(sigma, 2)) * dt + targetDrift;
  const shock = sigma * dW;
  const priceMultiplier = Math.exp(drift + shock);
  
  const newPrice = currentPrice * priceMultiplier;
  
  // Final safety check
  if (isNaN(newPrice) || !isFinite(newPrice) || newPrice <= 0) {
    // Keep old price or fallback
    m.price = currentPrice;
  } else {
    m.price = newPrice;
  }

  if (m.targetPrice && Math.abs(m.targetPrice - m.price) < (m.price * 0.00005)) {
    m.targetPrice = null;
  }

  // 4. Update all timeframes
  for (const tf of TIMEFRAMES) {
    const tfSeconds = timeframeSecondsMap[tf];
    const bucketTime = now - (now % tfSeconds);
    const activeCandle = candlePool[pair]?.[tf];

    if (!activeCandle) {
      if (!candlePool[pair]) candlePool[pair] = {};
      candlePool[pair][tf] = {
        open: m.price,
        high: m.price,
        low: m.price,
        close: m.price,
        volume: Math.random() * 5,
        openTime: bucketTime,
        closeTime: bucketTime + tfSeconds
      };
      saveCandleToDB_v2(pair, type, tf, candlePool[pair][tf]);
    } else if (bucketTime > activeCandle.openTime) {
      // ACTIVE CANDLE COMPLETED!
      const completedCandle = { ...activeCandle };

      // 1. Save completed candle permanently to database
      saveCandleToDB_v2(pair, type, tf, completedCandle);

      // 2. Push to local history cache
      if (!historyPool[pair]) historyPool[pair] = {};
      if (!historyPool[pair][tf]) historyPool[pair][tf] = [];
      const historyRow = {
        time: completedCandle.openTime,
        open: completedCandle.open,
        high: completedCandle.high,
        low: completedCandle.low,
        close: completedCandle.close,
        volume: completedCandle.volume,
        openTime: completedCandle.openTime,
        closeTime: completedCandle.closeTime
      };
      historyPool[pair][tf].push(historyRow);
      if (historyPool[pair][tf].length > 25000) historyPool[pair][tf].shift();

      // 3. Prevent gaps: Fill any gaps between completed candle and current bucketTime
      let gapTime = completedCandle.closeTime;
      let runtimeGapCount = 0;
      while (gapTime < bucketTime && runtimeGapCount < 100) {
        const gapCandle = {
          open: completedCandle.close,
          high: completedCandle.close,
          low: completedCandle.close,
          close: completedCandle.close,
          volume: 0,
          openTime: gapTime,
          closeTime: gapTime + tfSeconds
        };

        saveCandleToDB_v2(pair, type, tf, gapCandle);

        const gapRow = {
          time: gapCandle.openTime,
          open: gapCandle.open,
          high: gapCandle.high,
          low: gapCandle.low,
          close: gapCandle.close,
          volume: gapCandle.volume,
          openTime: gapCandle.openTime,
          closeTime: gapCandle.closeTime
        };

        historyPool[pair][tf].push(gapRow);
        if (historyPool[pair][tf].length > 25000) historyPool[pair][tf].shift();

        // Emit complete for gaps too so users stay sync'd
        try {
           getIO().to(`market_${pair}_${type}`).emit('candle_complete', { pair, timeframe: tf, candle: gapRow });
        } catch(e) {
           // IO might not be initialized
        }

        gapTime += tfSeconds;
        runtimeGapCount++;
      }

      // 4. Emit completed candle to Socket.IO clients in proper format { pair, timeframe, candle }
      try {
         getIO().to(`market_${pair}_${type}`).emit('candle_complete', { pair, timeframe: tf, candle: historyRow });
      } catch(e) {
         // IO might not be initialized
      }

      // 5. Create new forming candle
      candlePool[pair][tf] = {
        open: completedCandle.close, // smooth continuation
        high: Math.max(completedCandle.close, m.price),
        low: Math.min(completedCandle.close, m.price),
        close: m.price,
        volume: Math.random() * 5,
        openTime: bucketTime,
        closeTime: bucketTime + tfSeconds,
        lastSaved: Date.now() // Track when we last saved this candle to DB
      };
      saveCandleToDB_v2(pair, type, tf, candlePool[pair][tf]);
    } else {
      // Still in the same candle: update high, low, close, and volume
      activeCandle.close = m.price;
      activeCandle.high = Math.max(activeCandle.high, m.price);
      activeCandle.low = Math.min(activeCandle.low, m.price);
      activeCandle.volume += Math.random() * 2;

      // ONLY save to DB periodically (every 5 seconds) to prevent overwhelming the database
      // Completed candles are always saved above.
      const nowMs = Date.now();
      if (!activeCandle.lastSaved || (nowMs - activeCandle.lastSaved) > 5000) {
        activeCandle.lastSaved = nowMs;
        saveCandleToDB_v2(pair, type, tf, activeCandle);
      }
    }
  }

  const active5sCandle = candlePool[pair]?.["5 seconds"];

  return {
    price: m.price,
    time: now,
    candle: active5sCandle ? {
      time: active5sCandle.openTime,
      open: active5sCandle.open,
      high: active5sCandle.high,
      low: active5sCandle.low,
      close: active5sCandle.close,
      volume: active5sCandle.volume
    } : null
  };
}
