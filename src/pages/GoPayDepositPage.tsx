import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { ArrowLeft, Wallet } from 'lucide-react';

const GoPayDepositPage: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [payType, setPayType] = useState('bkash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/payment/collect', {
        amount: Number(amount),
        payType
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to initiate payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0D12] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('/trade')} className="flex items-center gap-2 text-sm mb-6 text-gray-400">
          <ArrowLeft size={16} /> Back
        </button>
        
        <div className="bg-[#14151B] p-6 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-xl font-black uppercase flex items-center gap-3">
            <Wallet className="text-[#FFE24C]" /> Automated Deposit
          </h2>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase">Amount (BDT)</label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-white"
              placeholder="100"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase">Payment Method</label>
            <select 
                value={payType}
                onChange={(e) => setPayType(e.target.value)}
                className="w-full bg-black/30 border border-white/5 rounded-xl p-4 text-white"
            >
                <option value="bkash">bKash</option>
                <option value="nagad">Nagad</option>
                <option value="rocket">Rocket</option>
            </select>
          </div>
          
          <button 
            onClick={handleDeposit}
            disabled={isSubmitting}
            className="w-full bg-[#FFE24C] text-black font-black py-4 rounded-xl uppercase tracking-widest hover:bg-[#ffe666] disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoPayDepositPage;
