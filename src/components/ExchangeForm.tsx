import React, { useState, useEffect } from 'react';
import { Currency, Transaction } from '../types';
import { ArrowLeftRight, User, Hash, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface ExchangeFormProps {
  posData: {
    rates: any;
    addTransaction: (t: any) => Promise<void>;
  };
}

export function ExchangeForm({ posData }: ExchangeFormProps) {
  const { rates, addTransaction } = posData;
  const [customerName, setCustomerName] = useState('ပုံမှန် ဝယ်သူ');
  const [amount, setAmount] = useState<string>('');
  const [fromCurrency, setFromCurrency] = useState<Currency>('THB');
  const [toCurrency, setToCurrency] = useState<Currency>('MMK');
  const [calculating, setCalculating] = useState(false);

  const stats = (() => {
    if (!rates || !amount) return { receiveAmount: 0, profit: 0, rate: 0 };
    const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;
    let rate = 0;
    let profit = 0;
    let receiveAmount = 0;

    if (fromCurrency === 'THB' && toCurrency === 'MMK') {
      rate = rates.thb_to_mmk;
      receiveAmount = numAmount * rate;
      profit = numAmount * (rates.thb_to_mmk_profit || 1);
    } else if (fromCurrency === 'MMK' && toCurrency === 'THB') {
      rate = rates.mmk_to_thb;
      receiveAmount = numAmount * rate;
      profit = numAmount * (rates.mmk_to_thb_profit || 0.0001); // Assuming profit is in MMK equivalent or fixed
    }

    return { receiveAmount, profit, rate };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || stats.receiveAmount <= 0) return;

    setCalculating(true);
    await addTransaction({
      type: 'exchange',
      customerName,
      amount: parseFloat(amount.replace(/,/g, '')),
      profit: stats.profit,
      details: {
        fromCurrency,
        toCurrency,
        rate: stats.rate,
        receiveAmount: stats.receiveAmount
      }
    });
    setAmount('');
    setCalculating(false);
    alert('ငွေလဲလှယ်မှု မှတ်တမ်းတင်ပြီးပါပြီ');
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
            <ArrowLeftRight className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">ငွေလဲလှယ်ခြင်း</h2>
              <p className="text-teal-100 text-sm">ဘတ် နှင့် ကျပ် တိုက်ရိုက်လဲလှယ်ခြင်း</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider font-semibold text-teal-200">ယနေ့ပေါက်ဈေး</p>
            <p className="text-lg font-bold">1 THB = {rates?.thb_to_mmk || '0'} ကျပ်</p>
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
                className="w-full px-4 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl transition-all"
                placeholder="ပုံမှန် ဝယ်သူ"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Hash className="w-4 h-4" /> လဲလှယ်မည့် ပမာဏ
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-slate-50 border-transparent focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-xl transition-all text-xl font-bold"
                  placeholder="0.00"
                  required
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold uppercase">{fromCurrency}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl">
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">မှ</label>
              <select 
                value={fromCurrency} 
                onChange={(e) => setFromCurrency(e.target.value as Currency)}
                className="w-full bg-transparent font-bold text-slate-800 focus:outline-none"
              >
                <option value="THB">ဘတ် (THB)</option>
                <option value="MMK">ကျပ် (MMK)</option>
              </select>
            </div>
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">သို့</label>
              <select 
                value={toCurrency === fromCurrency ? (fromCurrency === 'THB' ? 'MMK' : 'THB') : toCurrency}
                onChange={(e) => setToCurrency(e.target.value as Currency)}
                className="w-full bg-transparent font-bold text-slate-800 focus:outline-none"
              >
                <option value="MMK">ကျပ် (MMK)</option>
                <option value="THB">ဘတ် (THB)</option>
              </select>
            </div>
          </div>

          <motion.div 
            animate={{ height: amount ? 'auto' : 0, opacity: amount ? 1 : 0 }}
            className="overflow-hidden bg-teal-50/50 rounded-2xl border border-teal-100"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-end border-b border-teal-100 pb-4">
                <div>
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">ပြန်ပေးရမည့် ပမာဏ</p>
                  <p className="text-3xl font-black text-slate-900">{stats.receiveAmount.toLocaleString()} <span className="text-sm font-bold text-slate-400 ml-1 uppercase">{toCurrency}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">ခန့်မှန်း အမြတ်</p>
                  <p className="text-lg font-bold text-emerald-600">{stats.profit.toLocaleString()} ကျပ်</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                <Info className="w-3 h-3" />
                နှုန်းထားများမှာ ဖုန်းအားလုံးတွင် အတူတူပင်ဖြစ်ပါသည်။ အတည်မပြုမီ သေချာစစ်ဆေးပါ။
              </div>
            </div>
          </motion.div>

          <button
            type="submit"
            disabled={!amount || stats.receiveAmount <= 0 || calculating}
            className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white rounded-2xl font-bold text-lg shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
          >
            {calculating ? 'လုပ်ဆောင်နေသည်...' : 'အတည်ပြုမည်'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
