export type MarketRegime = 'CONSOLIDATION' | 'MOMENTUM_BURST' | 'VOLATILITY_SPIKE' | 'FAKE_BREAKOUT' | 'PAUSE_SQUEEZE';

export type PostGapBehavior = 'continue' | 'partial_fill' | 'full_fill_reverse';

export interface GapState {
  preGapClose: number;
  gapOpen: number;
  type: 'up' | 'down';
  behavior: PostGapBehavior;
  targetFillPrice: number;
  ticksRemaining: number;
}

export interface PairMarketState {
  trend: number;                 // Base drift direction
  trendDuration: number;         // Time remaining in current trend (ms)
  volatilityMultiplier: number;  // Multiplier for sigma
  lastTickTime: number;
  momentum: number;              // Autocorrelation momentum from recent ticks
  
  // Market Regimes
  regime: MarketRegime;
  regimeDuration: number;
  consolidationAnchor: number;
  
  fakeBreakoutTarget?: number;
  fakeBreakoutPhase?: number;   // 0: pushing out, 1: rejecting back
  
  gapState?: GapState;
  
  pauseTicksRemaining: number;
  
  newsEvent?: {
    intensity: number;
    duration: number;
    direction: number;
  };
}

export type PatternType =
  | 'BULLISH_MARUBOZU'
  | 'BEARISH_MARUBOZU'
  | 'DOJI'
  | 'SPINNING_TOP'
  | 'HAMMER'
  | 'INVERTED_HAMMER'
  | 'SHOOTING_STAR'
  | 'LONG_WICK_REJECTION'
  | 'STANDARD_BULL'
  | 'STANDARD_BEAR';

/**
 * Organically picks the next market regime and its duration.
 */
export function pickNextRegime(currentRegime?: MarketRegime): { regime: MarketRegime; duration: number } {
  const duration = 6000 + Math.random() * 18000; // 6s to 24s
  const rand = Math.random();

  if (currentRegime === 'CONSOLIDATION') {
    if (rand < 0.30) return { regime: 'MOMENTUM_BURST', duration };
    if (rand < 0.60) return { regime: 'FAKE_BREAKOUT', duration: 4000 + Math.random() * 6000 };
    if (rand < 0.80) return { regime: 'VOLATILITY_SPIKE', duration };
    return { regime: 'PAUSE_SQUEEZE', duration: 4000 + Math.random() * 5000 };
  }

  if (currentRegime === 'MOMENTUM_BURST') {
    if (rand < 0.30) return { regime: 'PAUSE_SQUEEZE', duration: 4000 + Math.random() * 6000 };
    if (rand < 0.55) return { regime: 'CONSOLIDATION', duration };
    if (rand < 0.80) return { regime: 'FAKE_BREAKOUT', duration: 4000 + Math.random() * 6000 };
    return { regime: 'VOLATILITY_SPIKE', duration };
  }

  if (currentRegime === 'VOLATILITY_SPIKE') {
    if (rand < 0.35) return { regime: 'CONSOLIDATION', duration };
    if (rand < 0.60) return { regime: 'PAUSE_SQUEEZE', duration: 4000 + Math.random() * 6000 };
    if (rand < 0.80) return { regime: 'FAKE_BREAKOUT', duration: 4000 + Math.random() * 6000 };
    return { regime: 'MOMENTUM_BURST', duration };
  }

  if (currentRegime === 'FAKE_BREAKOUT') {
    if (rand < 0.50) return { regime: 'CONSOLIDATION', duration };
    if (rand < 0.80) return { regime: 'PAUSE_SQUEEZE', duration: 4000 + Math.random() * 6000 };
    return { regime: 'MOMENTUM_BURST', duration };
  }

  // Default or PAUSE_SQUEEZE
  if (rand < 0.25) return { regime: 'CONSOLIDATION', duration };
  if (rand < 0.50) return { regime: 'MOMENTUM_BURST', duration };
  if (rand < 0.70) return { regime: 'VOLATILITY_SPIKE', duration };
  if (rand < 0.85) return { regime: 'FAKE_BREAKOUT', duration: 4000 + Math.random() * 6000 };
  return { regime: 'PAUSE_SQUEEZE', duration: 4000 + Math.random() * 5000 };
}

/**
 * Generates a realistic single candle OHLC with exact pattern characteristics and optional gaps.
 */
export function generateSingleCandleOHLC(
  open: number,
  volatility: number,
  patternHint?: PatternType,
  forceGap?: { isGap: boolean; gapDirection: 1 | -1; gapSizeMultiplier: number }
): { open: number; high: number; low: number; close: number; isGap: boolean; gapAmount: number } {
  let actualOpen = open;
  let isGap = false;
  let gapAmount = 0;

  if (forceGap && forceGap.isGap) {
    isGap = true;
    gapAmount = open * volatility * (forceGap.gapSizeMultiplier || 1.5);
    actualOpen = open + (forceGap.gapDirection * gapAmount);
  }

  const pattern = patternHint || pickRandomPattern();
  const rangeVol = actualOpen * volatility * (1.2 + Math.random() * 1.8);
  let close = actualOpen;
  let high = actualOpen;
  let low = actualOpen;

  switch (pattern) {
    case 'BULLISH_MARUBOZU': {
      const body = rangeVol * (1.5 + Math.random() * 1.5);
      close = actualOpen + body;
      const tinyUpper = body * (Math.random() * 0.04);
      const tinyLower = body * (Math.random() * 0.04);
      high = close + tinyUpper;
      low = actualOpen - tinyLower;
      break;
    }
    case 'BEARISH_MARUBOZU': {
      const body = rangeVol * (1.5 + Math.random() * 1.5);
      close = actualOpen - body;
      const tinyUpper = body * (Math.random() * 0.04);
      const tinyLower = body * (Math.random() * 0.04);
      high = actualOpen + tinyUpper;
      low = close - tinyLower;
      break;
    }
    case 'DOJI': {
      const totalRange = rangeVol * (1.2 + Math.random() * 1.2);
      const body = totalRange * (Math.random() * 0.04);
      const isUp = Math.random() > 0.5;
      close = isUp ? actualOpen + body : actualOpen - body;
      
      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      const upperWick = (totalRange - body) * (0.35 + Math.random() * 0.3);
      const lowerWick = (totalRange - body) - upperWick;
      high = maxBodyPrice + upperWick;
      low = minBodyPrice - lowerWick;
      break;
    }
    case 'SPINNING_TOP': {
      const totalRange = rangeVol * (1.2 + Math.random() * 1.2);
      const body = totalRange * (0.12 + Math.random() * 0.12);
      const isUp = Math.random() > 0.5;
      close = isUp ? actualOpen + body : actualOpen - body;

      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      const upperWick = (totalRange - body) * (0.42 + Math.random() * 0.16);
      const lowerWick = (totalRange - body) - upperWick;
      high = maxBodyPrice + upperWick;
      low = minBodyPrice - lowerWick;
      break;
    }
    case 'HAMMER': {
      const totalRange = rangeVol * (1.5 + Math.random() * 1.2);
      const body = totalRange * (0.12 + Math.random() * 0.08);
      const isUp = Math.random() > 0.3;
      close = isUp ? actualOpen + body : actualOpen - body;

      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      const upperWick = totalRange * (Math.random() * 0.08);
      const lowerWick = Math.max(0, totalRange - body - upperWick);
      high = maxBodyPrice + upperWick;
      low = minBodyPrice - lowerWick;
      break;
    }
    case 'INVERTED_HAMMER':
    case 'SHOOTING_STAR': {
      const totalRange = rangeVol * (1.5 + Math.random() * 1.2);
      const body = totalRange * (0.12 + Math.random() * 0.08);
      const isUp = pattern === 'SHOOTING_STAR' ? (Math.random() > 0.8) : (Math.random() > 0.3);
      close = isUp ? actualOpen + body : actualOpen - body;

      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      const lowerWick = totalRange * (Math.random() * 0.08);
      const upperWick = Math.max(0, totalRange - body - lowerWick);
      high = maxBodyPrice + upperWick;
      low = minBodyPrice - lowerWick;
      break;
    }
    case 'LONG_WICK_REJECTION': {
      const totalRange = rangeVol * (2.0 + Math.random() * 1.5);
      const body = totalRange * (0.08 + Math.random() * 0.10);
      const isUpper = Math.random() > 0.5;
      const isUp = Math.random() > 0.5;
      close = isUp ? actualOpen + body : actualOpen - body;

      const maxBodyPrice = Math.max(actualOpen, close);
      const minBodyPrice = Math.min(actualOpen, close);

      if (isUpper) {
        const upperWick = totalRange * (0.65 + Math.random() * 0.20);
        const lowerWick = Math.max(0, totalRange - body - upperWick);
        high = maxBodyPrice + upperWick;
        low = minBodyPrice - lowerWick;
      } else {
        const lowerWick = totalRange * (0.65 + Math.random() * 0.20);
        const upperWick = Math.max(0, totalRange - body - lowerWick);
        high = maxBodyPrice + upperWick;
        low = minBodyPrice - lowerWick;
      }
      break;
    }
    case 'STANDARD_BULL':
    default: {
      const isUp = patternHint === 'STANDARD_BULL' || Math.random() > 0.5;
      const body = rangeVol * (0.4 + Math.random() * 0.8);
      close = isUp ? actualOpen + body : actualOpen - body;

      const upperWick = rangeVol * (0.1 + Math.random() * 0.4);
      const lowerWick = rangeVol * (0.1 + Math.random() * 0.4);
      high = Math.max(actualOpen, close) + upperWick;
      low = Math.min(actualOpen, close) - lowerWick;
      break;
    }
  }

  // Strict mathematical sanity checks
  high = Math.max(high, actualOpen, close);
  low = Math.min(low, actualOpen, close);

  return { open: actualOpen, high, low, close, isGap, gapAmount };
}

export function pickRandomPattern(): PatternType {
  const r = Math.random();
  if (r < 0.14) return 'DOJI';
  if (r < 0.28) return 'SPINNING_TOP';
  if (r < 0.40) return 'HAMMER';
  if (r < 0.50) return 'SHOOTING_STAR';
  if (r < 0.60) return 'INVERTED_HAMMER';
  if (r < 0.70) return 'LONG_WICK_REJECTION';
  if (r < 0.80) return 'BULLISH_MARUBOZU';
  if (r < 0.88) return 'BEARISH_MARUBOZU';
  return Math.random() > 0.5 ? 'STANDARD_BULL' : 'STANDARD_BEAR';
}
