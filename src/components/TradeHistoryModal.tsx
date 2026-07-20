import React from 'react';
import TradeHistory from './TradeHistory';
import { X } from 'lucide-react';

interface TradeHistoryModalProps {
  onClose: () => void;
}

const TradeHistoryModal: React.FC<TradeHistoryModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1b1f] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Trade History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <TradeHistory />
      </div>
    </div>
  );
};

export default TradeHistoryModal;
