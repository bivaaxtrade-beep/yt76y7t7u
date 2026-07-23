import { describe, it, expect, beforeAll } from 'vitest';
import { 
  generateSingleCandleOHLC, 
  pickNextRegime, 
  pickRandomPattern, 
  PatternType, 
  MarketRegime 
} from '../services/candlestickEngine.ts';

describe('Candlestick Engine Mathematical & Geometrical Tests', () => {

  it('should strictly satisfy OHLC mathematical invariants across 10,000 generated candles', () => {
    let currentPrice = 100.0;
    const volatility = 0.002;

    for (let i = 0; i < 10000; i++) {
      const isGap = Math.random() < 0.1;
      const gapDirection = Math.random() > 0.5 ? 1 : -1;
      
      const c = generateSingleCandleOHLC(currentPrice, volatility, undefined, {
        isGap,
        gapDirection,
        gapSizeMultiplier: 1.5
      });

      // 1. High must be >= max(open, close)
      expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close));

      // 2. Low must be <= min(open, close)
      expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close));

      // 3. High must be >= Low
      expect(c.high).toBeGreaterThanOrEqual(c.low);

      // 4. All prices must be strictly positive finite numbers
      expect(c.open).toBeGreaterThan(0);
      expect(c.high).toBeGreaterThan(0);
      expect(c.low).toBeGreaterThan(0);
      expect(c.close).toBeGreaterThan(0);
      expect(Number.isFinite(c.open)).toBe(true);
      expect(Number.isFinite(c.high)).toBe(true);
      expect(Number.isFinite(c.low)).toBe(true);
      expect(Number.isFinite(c.close)).toBe(true);

      // Continuity check
      if (!isGap) {
        expect(c.open).toBe(currentPrice);
      } else {
        expect(c.open).not.toBe(currentPrice);
        expect(Math.abs(c.open - currentPrice)).toBeCloseTo(c.gapAmount, 5);
      }

      currentPrice = c.close;
    }
  });

  it('should generate mathematically distinct and visually valid candlestick patterns', () => {
    const basePrice = 1.0850;
    const vol = 0.001;

    // 1. DOJI
    const doji = generateSingleCandleOHLC(basePrice, vol, 'DOJI');
    const dojiRange = doji.high - doji.low;
    const dojiBody = Math.abs(doji.close - doji.open);
    expect(dojiRange).toBeGreaterThan(0);
    expect(dojiBody / dojiRange).toBeLessThan(0.08); // Body is < 8% of range

    // 2. BULLISH MARUBOZU
    const bullMaru = generateSingleCandleOHLC(basePrice, vol, 'BULLISH_MARUBOZU');
    const maruRange = bullMaru.high - bullMaru.low;
    const maruBody = Math.abs(bullMaru.close - bullMaru.open);
    expect(bullMaru.close).toBeGreaterThan(bullMaru.open);
    expect(maruBody / maruRange).toBeGreaterThan(0.80); // Body > 80% of total range

    // 3. BEARISH MARUBOZU
    const bearMaru = generateSingleCandleOHLC(basePrice, vol, 'BEARISH_MARUBOZU');
    const bearMaruRange = bearMaru.high - bearMaru.low;
    const bearMaruBody = Math.abs(bearMaru.close - bearMaru.open);
    expect(bearMaru.close).toBeLessThan(bearMaru.open);
    expect(bearMaruBody / bearMaruRange).toBeGreaterThan(0.80);

    // 4. HAMMER
    const hammer = generateSingleCandleOHLC(basePrice, vol, 'HAMMER');
    const hammerRange = hammer.high - hammer.low;
    const hammerBody = Math.abs(hammer.close - hammer.open);
    const hammerLowerWick = Math.min(hammer.open, hammer.close) - hammer.low;
    expect(hammerLowerWick).toBeGreaterThanOrEqual(1.5 * hammerBody);

    // 5. SHOOTING STAR
    const star = generateSingleCandleOHLC(basePrice, vol, 'SHOOTING_STAR');
    const starBody = Math.abs(star.close - star.open);
    const starUpperWick = star.high - Math.max(star.open, star.close);
    expect(starUpperWick).toBeGreaterThanOrEqual(1.5 * starBody);

    // 6. LONG WICK REJECTION
    const rejection = generateSingleCandleOHLC(basePrice, vol, 'LONG_WICK_REJECTION');
    const rejBody = Math.abs(rejection.close - rejection.open);
    const rejUpperWick = rejection.high - Math.max(rejection.open, rejection.close);
    const rejLowerWick = Math.min(rejection.open, rejection.close) - rejection.low;
    const maxWick = Math.max(rejUpperWick, rejLowerWick);
    expect(maxWick).toBeGreaterThanOrEqual(2.0 * rejBody);
  });

  it('should produce all 5 market regimes with valid durations', () => {
    const regimesSeen = new Set<MarketRegime>();

    let currentRegime: MarketRegime | undefined = undefined;
    for (let i = 0; i < 50; i++) {
      const res = pickNextRegime(currentRegime);
      expect(res.duration).toBeGreaterThan(0);
      regimesSeen.add(res.regime);
      currentRegime = res.regime;
    }

    expect(regimesSeen.has('CONSOLIDATION')).toBe(true);
    expect(regimesSeen.has('MOMENTUM_BURST')).toBe(true);
    expect(regimesSeen.has('VOLATILITY_SPIKE')).toBe(true);
    expect(regimesSeen.has('FAKE_BREAKOUT')).toBe(true);
    expect(regimesSeen.has('PAUSE_SQUEEZE')).toBe(true);
  });

  it('should pick random patterns covering all defined pattern types', () => {
    const patternsSeen = new Set<PatternType>();
    for (let i = 0; i < 200; i++) {
      patternsSeen.add(pickRandomPattern());
    }

    expect(patternsSeen.has('DOJI')).toBe(true);
    expect(patternsSeen.has('SPINNING_TOP')).toBe(true);
    expect(patternsSeen.has('HAMMER')).toBe(true);
    expect(patternsSeen.has('SHOOTING_STAR')).toBe(true);
    expect(patternsSeen.has('INVERTED_HAMMER')).toBe(true);
    expect(patternsSeen.has('LONG_WICK_REJECTION')).toBe(true);
    expect(patternsSeen.has('BULLISH_MARUBOZU')).toBe(true);
    expect(patternsSeen.has('BEARISH_MARUBOZU')).toBe(true);
  });
});
