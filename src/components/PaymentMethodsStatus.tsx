import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Wallet, CheckCircle, XCircle } from 'lucide-react';

const PaymentMethodsStatus: React.FC = () => {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'depositMethods'));
        const deps = querySnapshot.docs.map((d: any) => ({id: d.id, ...d.data()}));
        setMethods(deps.filter(m => ['bkash', 'nagad', 'rocket'].includes(m.name?.toLowerCase())));
      } catch (e) {
        console.error("Error fetching payment methods:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMethods();
  }, []);

  if (loading) return <div className="text-gray-500 text-sm">Loading status...</div>;

  return (
    <div className="bg-[#14151B] p-4 rounded-xl border border-white/5 space-y-3">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Wallet size={16} className="text-[#FFE24C]" /> Payment Gateway Status
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {methods.map(method => (
          <div key={method.id} className="bg-black/30 p-2 rounded-lg flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-gray-400">{method.name}</span>
            {method.isActive !== false ? (
              <CheckCircle size={16} className="text-green-500" />
            ) : (
              <XCircle size={16} className="text-red-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodsStatus;
