import { 
  markets_real, markets_demo, 
  history_real, history_demo, 
  currentCandles_real, currentCandles_demo,
  saveCandleToDB_v2, TIMEFRAMES, timeframeSecondsMap
} from './marketService.ts';
import { getIO } from './socketService.ts';
import { tradeExposureCache } from './tradeService.ts';
import { globalManipulationMode } from './marketService.ts';
import { 
  PairMarketState, 
  pickNextRegime, 
  PostGapBehavior,
  generateSingleCandleOHLC
} from './candlestickEngine.ts';

const pairStates = new Map<string, PairMarketState>();

export function updatePair(pair: string, type: 'real' | 'demo', now: number) {
  const pool = type === 'real' ? markets_real : markets_demo;
  const historyPool = type === 'real' ? history_real : history_demo;
  const candlePool = type === 'real' ? currentCandles_real : currentCandles_demo;
  
  const m = pool[pair];
  if (!m) return null;

  const stateKey = `${pair}_${type}`;
  let state = pairStates.get(stateKey);
  if (!state) {
    const { regime, duration } = pickNextRegime();
    state = {
      trend: 0,
      trendDuration: 0,
      volatilityMultiplier: 1.5,
      lastTickTime: Date.now(),
      momentum: 0,
      regime,
      regimeDuration: duration,
      consolidationAnchor: Number(m.price) || 100,
      pauseTicksRemaining: 0
    };
    pairStates.set(stateKey, state);
  }

  // 1. Calculate Time Step (dt)
  const nowMs = Date.now();
  let dt = (nowMs - state.lastTickTime) / 1000;
  if (dt <= 0) dt = 0.05;
  if (dt > 1) dt = 0.05;
  state.lastTickTime = nowMs;

  const currentPrice = Number(m.price) || 100;

  // 2. Manage Market Regimes & Transitions
  state.regimeDuration -= (dt * 1000);
  if (state.regimeDuration <= 0) {
    const next = pickNextRegime(state.regime);
    state.regime = next.regime;
    state.regimeDuration = next.duration;
    state.consolidationAnchor = currentPrice;

    if (state.regime === 'FAKE_BREAKOUT') {
      const isUpBreak = Math.random() > 0.5;
      const breakoutDist = currentPrice * (Number(m.volatility) || 0.0002) * (2.5 + Math.random() * 2.0);
      state.fakeBreakoutTarget = isUpBreak ? currentPrice + breakoutDist : currentPrice - breakoutDist;
      state.fakeBreakoutPhase = 0; // Phase 0: Push away from anchor
    }
  }

  // Handle News Events
  if (state.newsEvent) {
    state.newsEvent.duration -= (dt * 1000);
    if (state.newsEvent.duration <= 0) {
      state.newsEvent = undefined;
    }
  } else if (m.newsTrigger) {
    state.newsEvent = m.newsTrigger;
    m.newsTrigger = null;
    console.log(`📡 News Event on ${pair} (${type})! Direction: ${state.newsEvent.direction}`);
  }

  // Trend duration update
  state.trendDuration -= (dt * 1000);
  if (state.trendDuration <= 0) {
    state.trendDuration = 5000 + Math.random() * 15000;
    let trendPower = (Math.random() - 0.5) * 2;
    if (m.trend === 'up') trendPower = Math.abs(trendPower) + 0.5;
    else if (m.trend === 'down') trendPower = -Math.abs(trendPower) - 0.5;
    state.trend = trendPower * 0.002;
  }

  // 3. REGIME-BASED DRIFT & VOLATILITY COMPUTATION
  let baseSigma = (Number(m.volatility) || 0.0002) / Math.max(1e-6, currentPrice);
  // Cap baseSigma to max 0.005 per sqrt(second)
  baseSigma = Math.min(0.005, Math.max(0.00001, baseSigma));

  let mu = state.trend || 0;
  let volatilityMultiplier = 1.5;
  let isPauseTick = false;

  switch (state.regime) {
    case 'CONSOLIDATION': {
      volatilityMultiplier = 0.4 + Math.random() * 0.3;
      // Mean reversion pull towards anchor
      const pull = (state.consolidationAnchor - currentPrice) / currentPrice;
      mu += Math.max(-0.02, Math.min(0.02, pull * 0.08));
      break;
    }
    case 'MOMENTUM_BURST': {
      volatilityMultiplier = 1.8 + Math.random() * 1.2;
      const burstDirection = state.trend >= 0 ? 1 : -1;
      mu += burstDirection * 0.004;
      break;
    }
    case 'VOLATILITY_SPIKE': {
      volatilityMultiplier = 3.0 + Math.random() * 2.5;
      // Oscillate wildly
      mu += (Math.random() - 0.5) * 0.006;
      break;
    }
    case 'FAKE_BREAKOUT': {
      volatilityMultiplier = 2.2 + Math.random() * 1.0;
      if (state.fakeBreakoutTarget) {
        if (state.fakeBreakoutPhase === 0) {
          // Push towards fake breakout target
          const dist = (state.fakeBreakoutTarget - currentPrice) / currentPrice;
          mu += Math.max(-0.03, Math.min(0.03, dist * 0.15));
          if (Math.abs(currentPrice - state.fakeBreakoutTarget) / currentPrice < 0.0002) {
            state.fakeBreakoutPhase = 1; // Trigger aggressive rejection!
          }
        } else {
          // Reject aggressively back to anchor
          const pull = (state.consolidationAnchor - currentPrice) / currentPrice;
          mu += Math.max(-0.04, Math.min(0.04, pull * 0.25));
        }
      }
      break;
    }
    case 'PAUSE_SQUEEZE': {
      volatilityMultiplier = 0.25 + Math.random() * 0.2;
      if (Math.random() < 0.25) {
        isPauseTick = true; // Small pause (price stays flat for a micro-step)
      }
      break;
    }
  }

  // Handle Post-Gap Behaviors
  if (state.gapState) {
    state.gapState.ticksRemaining--;
    const gap = state.gapState;
    if (gap.behavior === 'continue') {
      const continueDir = gap.type === 'up' ? 1 : -1;
      mu += continueDir * 0.003;
    } else if (gap.behavior === 'partial_fill') {
      // Pull halfway back to pre-gap close
      const midPoint = gap.preGapClose + (gap.gapOpen - gap.preGapClose) * 0.5;
      const fillPull = (midPoint - currentPrice) / currentPrice;
      mu += Math.max(-0.02, Math.min(0.02, fillPull * 0.1));
    } else if (gap.behavior === 'full_fill_reverse') {
      // Pull all the way back to pre-gap close, then reverse
      const fillPull = (gap.preGapClose - currentPrice) / currentPrice;
      mu += Math.max(-0.03, Math.min(0.03, fillPull * 0.15));
      if (Math.abs(currentPrice - gap.preGapClose) / currentPrice < 0.0001) {
        // Gap filled! Reverse direction
        const reverseDir = gap.type === 'up' ? -1 : 1;
        state.trend = reverseDir * 0.003;
        state.gapState = undefined;
      }
    }
    if (state.gapState && state.gapState.ticksRemaining <= 0) {
      state.gapState = undefined;
    }
  }

  // Admin Pressure
  if (m.pressure && Math.abs(m.pressure) > 0) {
    mu += (m.pressure / 100) * 0.015;
    volatilityMultiplier *= (1 - Math.abs(m.pressure) / 200);
  }

  // Global Manipulation Mode
  if (globalManipulationMode !== 'neutral') {
    const exposureKey = `${pair}_${type}`;
    const exposure = tradeExposureCache.get(exposureKey) || 0;
    if (exposure !== 0) {
      let biasDirection = 0;
      if (globalManipulationMode === 'always_loss') {
        biasDirection = exposure > 0 ? -1 : 1;
      } else if (globalManipulationMode === 'always_win') {
        biasDirection = exposure > 0 ? 1 : -1;
      }
      mu += biasDirection * 0.05;
      volatilityMultiplier *= 0.5;
    }
  }

  // News Events
  if (state.newsEvent) {
    volatilityMultiplier *= (state.newsEvent.intensity || 1.5);
    mu += (state.newsEvent.direction || 1) * 0.004 * (state.newsEvent.intensity || 1);
  }

  // Target Price Smoothing
  let targetDrift = 0;
  if (m.targetPrice && currentPrice > 0 && Math.abs(m.targetPrice - currentPrice) > (currentPrice * 0.000001)) {
    const rawDrift = (Number(m.targetPrice) - currentPrice) / currentPrice;
    targetDrift = Math.max(-0.02, Math.min(0.02, (rawDrift / 3.0) * dt));
  } else if (m.targetPrice === null) {
    const driftMultiplier = type === 'real' ? 0.0002 : 0.0001;
    targetDrift = (Math.random() - 0.5) * driftMultiplier * dt;
  }

  // Calculate Price Multiplier
  let newPrice = currentPrice;
  if (!isPauseTick) {
    const sigma = Math.min(0.01, Math.max(0.00001, baseSigma * volatilityMultiplier));
    const u1 = Math.random() || 0.0001; 
    const u2 = Math.random();
    const dW = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * Math.sqrt(dt);
    
    // Intra-candle price jump / volatility burst
    let suddenJump = 0;
    if (state.regime === 'VOLATILITY_SPIKE' && Math.random() < 0.08) {
      suddenJump = (Math.random() - 0.5) * sigma * 2.5;
    }

    const clampedMomentum = Math.max(-0.01, Math.min(0.01, state.momentum));
    const momentumEffect = clampedMomentum * 0.05;
    
    const clampedMu = Math.max(-0.02, Math.min(0.02, mu));
    const drift = (clampedMu - 0.5 * Math.pow(sigma, 2)) * dt + targetDrift + momentumEffect;
    const shock = sigma * dW;
    const flicker = (Math.random() - 0.5) * sigma * 0.8;

    const totalExponent = Math.max(-0.02, Math.min(0.02, drift + shock + flicker + suddenJump));
    const priceMultiplier = Math.exp(totalExponent);
    newPrice = currentPrice * priceMultiplier;
  }

  state.momentum = Math.max(-0.01, Math.min(0.01, (newPrice - currentPrice) / currentPrice));

  if (isNaN(newPrice) || !isFinite(newPrice) || newPrice <= 0 || newPrice > 500000) {
    m.price = currentPrice;
  } else {
    m.price = newPrice;
  }

  if (m.targetPrice && Math.abs(m.targetPrice - m.price) < (m.price * 0.00005)) {
    m.targetPrice = null;
  }

  // 4. UPDATE ALL TIMEFRAMES
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
        volume: Math.random() * 15 + 5,
        openTime: bucketTime,
        closeTime: bucketTime + tfSeconds
      };
      saveCandleToDB_v2(pair, type, tf, candlePool[pair][tf]);
    } else if (bucketTime > activeCandle.openTime) {
      // CANDLE COMPLETED
      const completedCandle = { ...activeCandle };

      // 1. Save completed candle
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

      // 3. Gap handling between ticks (generate realistic volatile candles instead of flat ones)
      let gapTime = completedCandle.closeTime;
      let runtimeGapCount = 0;
      let currentPrice = completedCandle.close;
      const basePrice = Number(m.price) || 100;
      let volatility = Number(m.volatility) || 0.0002;
      const relVolatility = volatility / basePrice;
      const stepVol = relVolatility * Math.sqrt(tfSeconds);

      while (gapTime < bucketTime && runtimeGapCount < 100) {
        const isGap = Math.random() < 0.12;
        const gapDirection: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
        const c = generateSingleCandleOHLC(currentPrice, stepVol, undefined, {
          isGap,
          gapDirection,
          gapSizeMultiplier: 1.2 + Math.random() * 1.5
        });
        const volume = Math.random() * 50 + 5;

        const gapCandle = {
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          volume,
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

        try {
           getIO().to(`market_${pair}_${type}`).emit('candle_complete', { pair, timeframe: tf, candle: gapRow });
        } catch(e) {}

        const pull = (basePrice - c.close) * 0.02;
        currentPrice = c.close + pull;

        gapTime += tfSeconds;
        runtimeGapCount++;
      }

      // 4. Emit completed candle
      try {
         getIO().to(`market_${pair}_${type}`).emit('candle_complete', { pair, timeframe: tf, candle: historyRow });
      } catch(e) {}

      // 5. Create new forming candle with NATURAL GAPS
      let nextOpen = completedCandle.close;
      
      // Gap chance depends on volatility / regime
      const gapChance = state.regime === 'VOLATILITY_SPIKE' || state.regime === 'MOMENTUM_BURST' ? 0.22 : 0.12;
      if (Math.random() < gapChance) {
        const gapSize = nextOpen * baseSigma * (Math.random() * 2.2 + 0.8);
        const gapDir = Math.random() < 0.5 ? 1 : -1;
        nextOpen += (gapDir * gapSize);
        m.price = nextOpen; // Snap market price immediately to gap open

        // Store gap state for post-gap dynamics
        const behaviors: PostGapBehavior[] = ['continue', 'partial_fill', 'full_fill_reverse'];
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        state.gapState = {
          preGapClose: completedCandle.close,
          gapOpen: nextOpen,
          type: gapDir === 1 ? 'up' : 'down',
          behavior,
          targetFillPrice: completedCandle.close,
          ticksRemaining: Math.floor(15 + Math.random() * 30)
        };
      }

      candlePool[pair][tf] = {
        open: nextOpen,
        high: Math.max(nextOpen, m.price),
        low: Math.min(nextOpen, m.price),
        close: m.price,
        volume: Math.random() * 20 + 5,
        openTime: bucketTime,
        closeTime: bucketTime + tfSeconds,
        lastSaved: Date.now()
      };
      saveCandleToDB_v2(pair, type, tf, candlePool[pair][tf]);
    } else {
      // In same candle: update high, low, close, volume
      activeCandle.close = m.price;
      activeCandle.high = Math.max(activeCandle.high, m.price);
      activeCandle.low = Math.min(activeCandle.low, m.price);
      activeCandle.volume += Math.random() * 3;

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
