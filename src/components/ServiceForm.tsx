import React, { useState } from 'react';
import { ServiceAction, Transaction } from '../types';
import { Wallet, User, Hash, Info, Building2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ServiceFormProps {
  posData: {
    fees: any;
    addTransaction: (t: any) => Promise<void>;
  };
}

export function ServiceForm({ posData }: ServiceFormProps) {
  const { fees, addTransaction } = posData;
  const [customerName, setCustomerName] = useState('ပုံမှန် ဝယ်သူ');
  const [amount, setAmount] = useState<string>('');
  const [serviceType, setServiceType] = useState<ServiceAction>('CashOut');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  const stats = (() => {
    if (!fees || !amount || !selectedBank) return { feeAmount: 0, feeRate: 0 };
    const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;
    const bank = fees.banks.find((b: any) => b.name === selectedBank);
    if (!bank) return { feeAmount: 0, feeRate: 0 };

    const feeRate = serviceType === 'CashOut' ? bank.cashOut : bank.cashIn;
    const feeAmount = (numAmount * feeRate) / 100;

    return { feeAmount, feeRate };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || stats.feeAmount <= 0) return;

    setProcessing(true);
    await addTransaction({
      type: 'service',
      customerName,
      amount: parseFloat(amount.replace(/,/g, '')),
      profit: stats.feeAmount, // Fee is the profit for this service
      details: {
        serviceType,
        bank: selectedBank,
        feeRate: stats.feeRate,
        feeAmount: stats.feeAmount,
      }
    });
    setAmount('');
    setProcessing(false);
    alert('ဝန်ဆောင်မှု မှတ်တမ်းတင်ပြီးပါပြီ');
  };

  const handleAmountChange = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setAmount(parts.join('.'));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="bg-teal-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">ငွေသွင်း/ငွေထုတ် ဝန်ဆောင်မှု</h2>
              <p className="text-teal-100 text-sm">ဘဏ်နှင့် ဝေါလက်များမှတစ်ဆင့် ငွေပို့/ငွေထုတ်ခြင်း</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4" /> ဝယ်သူအမည်
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 rounded-xl transition-all"
                placeholder="ပုံမှန် ဝယ်သူ"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Hash className="w-4 h-4" /> ဝန်ဆောင်မှု ပမာဏ
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-4 py-3 pl-14 bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 rounded-xl transition-all text-xl font-bold"
                  placeholder="0.00"
                  required
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm uppercase tracking-tighter">ကျပ်</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button
               type="button"
               onClick={() => setServiceType('CashOut')}
               className={`py-3 px-4 rounded-xl font-bold transition-all border-2 ${
                 serviceType === 'CashOut' ? 'bg-teal-50 border-teal-600 text-teal-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
               }`}
             >
               ငွေထုတ် (Cash Out)
             </button>
             <button
               type="button"
               onClick={() => setServiceType('CashIn')}
               className={`py-3 px-4 rounded-xl font-bold transition-all border-2 ${
                 serviceType === 'CashIn' ? 'bg-teal-50 border-teal-600 text-teal-700' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
               }`}
             >
               ငွေသွင်း (Cash In)
             </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> ဘဏ် / ဝေါလက် ရွေးချယ်ပါ
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {fees?.banks?.map((bank: any) => (
                <button
                  key={bank.name}
                  type="button"
                  onClick={() => setSelectedBank(bank.name)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                    selectedBank === bank.name 
                      ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/10' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-600'
                  }`}
                >
                  {bank.name}
                </button>
              ))}
              {(!fees?.banks || fees.banks.length === 0) && (
                <p className="col-span-full text-center py-4 text-slate-400 text-xs italic">သတ်မှတ်ချက်များတွင် ဘဏ်များ ထည့်သွင်းထားခြင်း မရှိပါ</p>
              )}
            </div>
          </div>

          <motion.div 
            animate={{ height: amount && selectedBank ? 'auto' : 0, opacity: amount && selectedBank ? 1 : 0 }}
            className="overflow-hidden bg-teal-50/50 rounded-2xl border border-teal-100"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-end border-b border-teal-100 pb-4">
                <div>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">ဝန်ဆောင်ခ ({serviceType === 'CashOut' ? 'ထုတ်' : 'သွင်း'})</p>
                  <p className="text-3xl font-black text-slate-900">{stats.feeAmount.toLocaleString()} <span className="text-sm font-bold text-slate-400 ml-1">ကျပ်</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">ဝန်ဆောင်ခ နှုန်း</p>
                  <p className="text-lg font-bold text-slate-700">{stats.feeRate.toFixed(2)}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                <Info className="w-3 h-3" />
                ဤဝန်ဆောင်ခမှာ သင့်အမြတ်ထဲသို့ ပေါင်းထည့်မည်ဖြစ်သည်။
              </div>
            </div>
          </motion.div>

          <button
            type="submit"
            disabled={!amount || !selectedBank || processing}
            className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white rounded-2xl font-bold text-lg shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
          >
            {processing ? 'ဆောင်ရွက်နေသည်...' : 'စာရင်းသွင်းမည်'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
