export interface ManipulationSettings {
  targetTrend: 'up' | 'down' | 'random' | null;
  profitPercentage: number;
  enabled: boolean;
  mode?: 'percentage' | 'always_loss' | 'always_win' | 'smart_house';
}

export interface Market {
  name: string;
  price: number;
  active: boolean;
  payout: number;
  trend: 'up' | 'down' | 'random';
  volatility: number;
  targetPrice: number | null;
  isFrozen: boolean;
  lastChange: number;
  freezeReason?: string;
  houseEdge?: number;
  totalUp?: number;
  totalDown?: number;
  maxTradeAmount?: number;
  manipulation?: ManipulationSettings;
  hidden?: boolean;
  pressure?: number; // -100 to 100
}

export const markets: Record<string, Market> = {
    // Currencies (OTC)
    'GBP/USD (OTC)': { name: 'GBP/USD (OTC)', price: 1.2650, active: true, payout: 80, trend: 'random', volatility: 0.00015, targetPrice: null, isFrozen: false, lastChange: 0, houseEdge: 10, totalUp: 0, totalDown: 0, maxTradeAmount: 50000 },
    'AUD/USD (OTC)': { name: 'AUD/USD (OTC)', price: 0.6540, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, houseEdge: 10, totalUp: 0, totalDown: 0, maxTradeAmount: 50000 },
    'USD/CAD (OTC)': { name: 'USD/CAD (OTC)', price: 1.3540, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, houseEdge: 10, totalUp: 0, totalDown: 0, maxTradeAmount: 50000 },
    'NZD/USD (OTC)': { name: 'NZD/USD (OTC)', price: 0.6020, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'GBP/CHF (OTC)': { name: 'GBP/CHF (OTC)', price: 1.1120, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'CHF/JPY (OTC)': { name: 'CHF/JPY (OTC)', price: 172.40, active: true, payout: 80, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'EUR/CAD (OTC)': { name: 'EUR/CAD (OTC)', price: 1.4650, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'GBP/JPY (OTC)': { name: 'GBP/JPY (OTC)', price: 198.80, active: true, payout: 80, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'EUR/GBP (OTC)': { name: 'EUR/GBP (OTC)', price: 0.8540, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'AUD/CAD (OTC)': { name: 'AUD/CAD (OTC)', price: 0.8840, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'EUR/JPY (OTC)': { name: 'EUR/JPY (OTC)', price: 165.40, active: true, payout: 80, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'USD/CHF (OTC)': { name: 'USD/CHF (OTC)', price: 0.9050, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'EUR/AUD (OTC)': { name: 'EUR/AUD (OTC)', price: 1.6240, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'GBP/CAD (OTC)': { name: 'GBP/CAD (OTC)', price: 1.7140, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'AUD/JPY (OTC)': { name: 'AUD/JPY (OTC)', price: 102.40, active: true, payout: 80, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'USD/SGD (OTC)': { name: 'USD/SGD (OTC)', price: 1.3440, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'USD/TRY (OTC)': { name: 'USD/TRY (OTC)', price: 32.40, active: true, payout: 80, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'USD/MXN (OTC)': { name: 'USD/MXN (OTC)', price: 16.80, active: true, payout: 80, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'AUD/CHF (OTC)': { name: 'AUD/CHF (OTC)', price: 0.5840, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'NZD/CAD (OTC)': { name: 'NZD/CAD (OTC)', price: 0.8140, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'EUR/USD (OTC)': { name: 'EUR/USD (OTC)', price: 1.0850, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'USD/JPY (OTC)': { name: 'USD/JPY (OTC)', price: 156.40, active: true, payout: 80, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },
    'GBP/NZD (OTC)': { name: 'GBP/NZD (OTC)', price: 2.0640, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0, maxTradeAmount: 50000 },

    // Currencies (Real)
    'USD/DKK': { name: 'USD/DKK', price: 6.9540, active: true, payout: 81, trend: 'random', volatility: 0.00015, targetPrice: null, isFrozen: false, lastChange: 0 },
    'GBP/CHF': { name: 'GBP/CHF', price: 1.1120, active: true, payout: 81, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'EUR/CHF': { name: 'EUR/CHF', price: 0.9540, active: true, payout: 82, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'CAD/CHF': { name: 'CAD/CHF', price: 0.6540, active: true, payout: 82, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'GBP/AUD': { name: 'GBP/AUD', price: 1.9540, active: true, payout: 82, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'EUR/JPY': { name: 'EUR/JPY', price: 165.40, active: true, payout: 82, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/CHF': { name: 'USD/CHF', price: 0.9050, active: true, payout: 82, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'EUR/AUD': { name: 'EUR/AUD', price: 1.6240, active: true, payout: 82, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'GBP/CAD': { name: 'GBP/CAD', price: 1.7140, active: true, payout: 82, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'AUD/JPY': { name: 'AUD/JPY', price: 102.40, active: true, payout: 82, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/SGD': { name: 'USD/SGD', price: 1.3440, active: true, payout: 82, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'EUR/NZD': { name: 'EUR/NZD', price: 1.7840, active: true, payout: 82, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'AUD/NZD': { name: 'AUD/NZD', price: 1.0850, active: true, payout: 82, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'CAD/JPY': { name: 'CAD/JPY', price: 114.40, active: true, payout: 82, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/ZAR': { name: 'USD/ZAR', price: 18.40, active: true, payout: 82, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/SEK': { name: 'USD/SEK', price: 10.50, active: true, payout: 82, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/NOK': { name: 'USD/NOK', price: 10.80, active: true, payout: 82, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0 },
    'EUR/USD': { name: 'EUR/USD', price: 1.0850, active: true, payout: 85, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'GBP/USD': { name: 'GBP/USD', price: 1.2650, active: true, payout: 85, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/JPY': { name: 'USD/JPY', price: 156.40, active: true, payout: 85, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0 },
    'AUD/USD': { name: 'AUD/USD', price: 0.6540, active: true, payout: 84, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/CAD': { name: 'USD/CAD', price: 1.3540, active: true, payout: 84, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'NZD/USD': { name: 'NZD/USD', price: 0.6020, active: true, payout: 84, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'EUR/GBP': { name: 'EUR/GBP', price: 0.8540, active: true, payout: 84, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'GBP/JPY': { name: 'GBP/JPY', price: 198.80, active: true, payout: 84, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0 },
    'NZD/JPY': { name: 'NZD/JPY', price: 92.40, active: true, payout: 83, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0 },
    'AUD/CAD': { name: 'AUD/CAD', price: 0.8840, active: true, payout: 83, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'GBP/NZD': { name: 'GBP/NZD', price: 2.0640, active: true, payout: 83, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/PLN': { name: 'USD/PLN', price: 4.05, active: true, payout: 81, trend: 'random', volatility: 0.0005, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/HUF': { name: 'USD/HUF', price: 360.50, active: true, payout: 81, trend: 'random', volatility: 0.05, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/CZK': { name: 'USD/CZK', price: 23.20, active: true, payout: 81, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/ILS': { name: 'USD/ILS', price: 3.75, active: true, payout: 81, trend: 'random', volatility: 0.0005, targetPrice: null, isFrozen: false, lastChange: 0 },
    'USD/THB': { name: 'USD/THB', price: 36.40, active: true, payout: 81, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0 },
    'EUR/TRY': { name: 'EUR/TRY', price: 34.80, active: true, payout: 80, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0 },
    'GBP/TRY': { name: 'GBP/TRY', price: 40.80, active: true, payout: 80, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0 },
    'AUD/SGD': { name: 'AUD/SGD', price: 0.8850, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },

    // Stocks/Companies
    'Yum Brands': { name: 'Yum Brands', price: 135.40, active: true, payout: 76, trend: 'random', volatility: 0.05, targetPrice: null, isFrozen: false, lastChange: 0 },
    'Apple (OTC)': { name: 'Apple (OTC)', price: 185.40, active: true, payout: 80, trend: 'random', volatility: 0.05, targetPrice: null, isFrozen: false, lastChange: 0 },
    'Tesla (OTC)': { name: 'Tesla (OTC)', price: 175.40, active: true, payout: 80, trend: 'random', volatility: 0.08, targetPrice: null, isFrozen: false, lastChange: 0 },

    // Commodities
    'Gold (OTC)': { name: 'Gold (OTC)', price: 2350.50, active: true, payout: 82, trend: 'random', volatility: 0.5, targetPrice: null, isFrozen: false, lastChange: 0 },
    'Oil (OTC)': { name: 'Oil (OTC)', price: 78.50, active: true, payout: 82, trend: 'random', volatility: 0.1, targetPrice: null, isFrozen: false, lastChange: 0 },

    // Cryptos
    'Crypto IDX': { name: 'Crypto IDX', price: 4560.50, active: true, payout: 82, trend: 'random', volatility: 1.8, targetPrice: null, isFrozen: false, lastChange: 0 },
    'BTC/USD': { name: 'BTC/USD', price: 65420.0, active: true, payout: 88, trend: 'random', volatility: 25.0, targetPrice: null, isFrozen: false, lastChange: 0 },
    'ETH/USD': { name: 'ETH/USD', price: 3450.0, active: true, payout: 88, trend: 'random', volatility: 5.0, targetPrice: null, isFrozen: false, lastChange: 0 },
    'UNI/USD': { name: 'UNI/USD', price: 7.45, active: true, payout: 85, trend: 'random', volatility: 0.05, targetPrice: null, isFrozen: false, lastChange: 0 },
    'LINK/USD': { name: 'LINK/USD', price: 14.20, active: true, payout: 85, trend: 'random', volatility: 0.1, targetPrice: null, isFrozen: false, lastChange: 0 },
    'AAVE/USD': { name: 'AAVE/USD', price: 84.50, active: true, payout: 85, trend: 'random', volatility: 0.5, targetPrice: null, isFrozen: false, lastChange: 0 },
    'BCH/USD': { name: 'BCH/USD', price: 485.0, active: true, payout: 85, trend: 'random', volatility: 1.5, targetPrice: null, isFrozen: false, lastChange: 0 },
    'ADA/USD': { name: 'ADA/USD', price: 0.45, active: true, payout: 85, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0 },
    'SOL/USD': { name: 'SOL/USD', price: 145.20, active: true, payout: 86, trend: 'random', volatility: 1.2, targetPrice: null, isFrozen: false, lastChange: 0 },
    'TON/USD': { name: 'TON/USD', price: 6.85, active: true, payout: 85, trend: 'random', volatility: 0.05, targetPrice: null, isFrozen: false, lastChange: 0 },
    'CAKE/USD': { name: 'CAKE/USD', price: 2.85, active: true, payout: 84, trend: 'random', volatility: 0.02, targetPrice: null, isFrozen: false, lastChange: 0 },
    'FET/USD': { name: 'FET/USD', price: 2.15, active: true, payout: 84, trend: 'random', volatility: 0.02, targetPrice: null, isFrozen: false, lastChange: 0 },
    'ICP/USD': { name: 'ICP/USD', price: 11.20, active: true, payout: 84, trend: 'random', volatility: 0.15, targetPrice: null, isFrozen: false, lastChange: 0 },
    'TON/USD (OTC)': { name: 'TON/USD (OTC)', price: 6.85, active: true, payout: 85, trend: 'random', volatility: 0.05, targetPrice: null, isFrozen: false, lastChange: 0 },
    'BAR/USD': { name: 'BAR/USD', price: 3.45, active: true, payout: 80, trend: 'random', volatility: 0.05, targetPrice: null, isFrozen: false, lastChange: 0 },
    'KSM/USD': { name: 'KSM/USD', price: 28.50, active: true, payout: 80, trend: 'random', volatility: 0.25, targetPrice: null, isFrozen: false, lastChange: 0 },
    'RSR/USD': { name: 'RSR/USD', price: 0.0065, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'LPT/USD': { name: 'LPT/USD', price: 18.50, active: true, payout: 80, trend: 'random', volatility: 0.25, targetPrice: null, isFrozen: false, lastChange: 0 },
    'WOO/USD': { name: 'WOO/USD', price: 0.285, active: true, payout: 80, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0 },
    'VEC/USD': { name: 'VEC/USD', price: 1.25, active: true, payout: 80, trend: 'random', volatility: 0.02, targetPrice: null, isFrozen: false, lastChange: 0 },
    'DOGE/USD': { name: 'DOGE/USD', price: 0.15, active: true, payout: 82, trend: 'random', volatility: 0.01, targetPrice: null, isFrozen: false, lastChange: 0 },
    'XRP/USD': { name: 'XRP/USD', price: 0.50, active: true, payout: 82, trend: 'random', volatility: 0.01, targetPrice: null, isFrozen: false, lastChange: 0 },
    'SHIB/USD': { name: 'SHIB/USD', price: 0.000025, active: true, payout: 82, trend: 'random', volatility: 0.000001, targetPrice: null, isFrozen: false, lastChange: 0 },
    
    // Additional Currencies (OTC)
    'NZD/CHF (OTC)': { name: 'NZD/CHF (OTC)', price: 0.5420, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'CHF/JPY': { name: 'CHF/JPY', price: 172.40, active: true, payout: 80, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0 },
    'NZD/JPY (OTC)': { name: 'NZD/JPY (OTC)', price: 92.40, active: true, payout: 80, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0 },
    'AUD/NZD (OTC)': { name: 'AUD/NZD (OTC)', price: 1.0850, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'EUR/NZD (OTC)': { name: 'EUR/NZD (OTC)', price: 1.7840, active: true, payout: 80, trend: 'random', volatility: 0.0001, targetPrice: null, isFrozen: false, lastChange: 0 },
    'CAD/JPY (OTC)': { name: 'CAD/JPY (OTC)', price: 114.40, active: true, payout: 80, trend: 'random', volatility: 0.015, targetPrice: null, isFrozen: false, lastChange: 0 },
    
    // More Crypto
    'DOT/USD': { name: 'DOT/USD', price: 7.25, active: true, payout: 83, trend: 'random', volatility: 0.05, targetPrice: null, isFrozen: false, lastChange: 0 },
    'AVAX/USD': { name: 'AVAX/USD', price: 34.50, active: true, payout: 83, trend: 'random', volatility: 0.25, targetPrice: null, isFrozen: false, lastChange: 0 },
    'LINK/USD (OTC)': { name: 'LINK/USD (OTC)', price: 14.20, active: true, payout: 83, trend: 'random', volatility: 0.1, targetPrice: null, isFrozen: false, lastChange: 0 },
    'POL/USD': { name: 'POL/USD', price: 0.65, active: true, payout: 83, trend: 'random', volatility: 0.005, targetPrice: null, isFrozen: false, lastChange: 0 },
};
