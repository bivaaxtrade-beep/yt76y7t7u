
import WebSocket from 'ws';
import { markets_real, markets_demo } from './marketService.ts';
import { markets } from '../markets.ts';

/**
 * LiveApiService connects to external real-time data providers.
 * For Crypto: Binance WebSockets (Free, no key required)
 * For others: FMP Polling (requires key)
 */
class LiveApiService {
  private binanceWs: WebSocket | null = null;
  private binanceBlocked = false;
  private pairsToBinance: Record<string, string> = {
    'BTC/USD': 'btcusdt',
    'ETH/USD': 'ethusdt',
    'LTC/USD': 'ltcusdt',
    'SOL/USD': 'solusdt',
    'ADA/USD': 'adausdt',
    'UNI/USD': 'uniusdt',
    'LINK/USD': 'linkusdt',
    'TON/USD': 'tonusdt',
    'BCH/USD': 'bchusdt',
    'AVAX/USD': 'avaxusdt',
    'DOT/USD': 'dotusdt',
    'POL/USD': 'maticusdt', // Polygon
    'AAVE/USD': 'aaveusdt',
    'SHIB/USD': 'shibusdt',
    'DOGE/USD': 'dogeusdt',
    'XRP/USD': 'xrpusdt',
  };

  private binanceToPair: Record<string, string> = {};

  constructor() {
    Object.entries(this.pairsToBinance).forEach(([pair, symbol]) => {
      this.binanceToPair[symbol] = pair;
    });
  }

  public start() {
    console.log('🌐 Initializing Live API Service...');
    this.connectBinance();
  }

  private connectBinance() {
    if (this.binanceBlocked) {
      return;
    }

    const symbols = Object.values(this.pairsToBinance);
    const streams = symbols.map(s => `${s}@ticker`).join('/');
    const url = `wss://stream.binance.com:9443/ws/${streams}`;

    console.log(`🔌 Connecting to Binance WebSocket: ${url}`);
    
    this.binanceWs = new WebSocket(url);

    this.binanceWs.on('open', () => {
      console.log('✅ Connected to Binance WebSocket');
    });

    this.binanceWs.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data);
        const ticker = msg.data || msg;
        if (ticker.e !== '24hrTicker') return;

        const binanceSymbol = ticker.s.toLowerCase();
        const pair = this.binanceToPair[binanceSymbol];
        const price = parseFloat(ticker.c);

        if (pair && !isNaN(price)) {
          if (markets_real[pair]) {
            markets_real[pair].targetPrice = price;
          }
          if (markets_demo[pair]) {
            markets_demo[pair].targetPrice = price;
          }
        }
      } catch (err) {
        // ignore parse errors
      }
    });

    this.binanceWs.on('error', (err) => {
      if (err.message?.includes('451')) {
        this.binanceBlocked = true;
        console.warn('ℹ️ Binance API is geographically restricted (HTTP 451) on this hosting server region. Internal real-time market engine active for all assets.');
      } else {
        console.warn('❌ Binance WebSocket Error:', err.message);
      }
    });

    this.binanceWs.on('close', () => {
      if (!this.binanceBlocked) {
        console.log('⚠️ Binance WebSocket closed. Reconnecting in 5s...');
        setTimeout(() => this.connectBinance(), 5000);
      }
    });
  }
}

export const liveApiService = new LiveApiService();
