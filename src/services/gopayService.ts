import crypto from 'crypto';
import axios from 'axios';

const API_URL = 'https://api.go-pay.world';
const MERCHANT_ID = process.env.GO_PAY_MERCHANT_ID;
const SECRET_KEY = process.env.GO_PAY_SECRET_KEY;

export const generateSignature = (params: Record<string, any>): string => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  );
  
  delete filteredParams.sign;
  
  const sortedKeys = Object.keys(filteredParams).sort();
  const queryString = sortedKeys.map(key => `${key}=${filteredParams[key]}`).join('&');
  const stringToSign = `${queryString}&key=${SECRET_KEY}`;
  
  return crypto.createHash('md5').update(stringToSign).digest('hex');
};

export const createDeposit = async (amount: number, orderId: string, payType: string) => {
    if (!MERCHANT_ID || !SECRET_KEY) throw new Error('GoPay credentials missing');
    
    const params: any = {
        mchId: MERCHANT_ID,
        money: amount,
        out_trade_no: orderId,
        pay_type: payType
    };
    
    params.sign = generateSignature(params);
    
    return await axios.post(`${API_URL}/v1/Collect`, new URLSearchParams(params));
};
