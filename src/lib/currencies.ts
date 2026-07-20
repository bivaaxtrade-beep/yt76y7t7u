export interface Currency {
  code: string;
  symbol: string;
  rate: number; // Rate relative to BDT (1 BDT = ?)
  name: string;
}

export const currencies: Currency[] = [
  { code: 'BDT', symbol: '৳', rate: 1, name: 'Bangladeshi Taka' },
  { code: 'USD', symbol: '$', rate: 0.0084, name: 'US Dollar' },
  { code: 'USDT', symbol: '$', rate: 0.0084, name: 'Tether' },
  { code: 'EUR', symbol: '€', rate: 0.0078, name: 'Euro' },
  { code: 'GBP', symbol: '£', rate: 0.0066, name: 'British Pound' },
  { code: 'INR', symbol: '₹', rate: 0.70, name: 'Indian Rupee' },
  { code: 'PKR', symbol: '₨', rate: 2.35, name: 'Pakistani Rupee' },
  { code: 'BRL', symbol: 'R$', rate: 0.043, name: 'Brazilian Real' },
  { code: 'TRY', symbol: '₺', rate: 0.28, name: 'Turkish Lira' },
  { code: 'NGN', symbol: '₦', rate: 12.50, name: 'Nigerian Naira' },
];

export const getCurrencySymbol = (code: string = 'BDT') => {
  return currencies.find(c => c.code === code)?.symbol || '৳';
};

export const formatWithCurrency = (amount: number, currencyCode: string = 'BDT') => {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  const converted = amount * currency.rate;
  
  // For high-value currencies like USD/USDT, show 2 decimals. For BDT/INR, rounded or 2 decimals is fine.
  const decimals = ['USD', 'USDT', 'EUR', 'GBP'].includes(currency.code) ? 2 : (converted < 10 ? 2 : 0);
  
  return `${currency.symbol}${converted.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })}`;
};

export const convertToBase = (amount: number, currencyCode: string = 'BDT') => {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  return amount / currency.rate;
};

export const convertFromBase = (amount: number, currencyCode: string = 'BDT') => {
  const currency = currencies.find(c => c.code === currencyCode) || currencies[0];
  return amount * currency.rate;
};
