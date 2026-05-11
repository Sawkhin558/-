import { useState, useEffect } from 'react';
import { ExchangeRate, ServiceFeeSettings, Bank, BillType } from '../types';
import { Settings as SettingsIcon, Save, Plus, Trash2, ArrowLeftRight, Wallet, Receipt } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsProps {
  posData: {
    rates: ExchangeRate | null;
    fees: ServiceFeeSettings | null;
    saveRates: (r: Partial<ExchangeRate>) => Promise<void>;
    saveFees: (f: Partial<ServiceFeeSettings>) => Promise<void>;
  };
}

export function Settings({ posData }: SettingsProps) {
  const { rates, fees, saveRates, saveFees } = posData;
  const [localRates, setLocalRates] = useState<ExchangeRate | null>(null);
  const [localFees, setLocalFees] = useState<ServiceFeeSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (rates) setLocalRates(rates);
    if (fees) setLocalFees(fees);
  }, [rates, fees]);

  const handleSaveRates = async () => {
    if (!localRates) return;
    setSaving(true);
    await saveRates(localRates);
    setSaving(false);
    alert('နှုန်းထားများ သိမ်းဆည်းပြီးပါပြီ');
  };

  const handleSaveFees = async () => {
    if (!localFees) return;
    setSaving(true);
    await saveFees(localFees);
    setSaving(false);
    alert('ဘဏ်နှင့် ဘေလ် နှုန်းထားများ သိမ်းဆည်းပြီးပါပြီ');
  };

  const addBank = () => {
    if (!localFees) return;
    const newBanks = [...(localFees.banks || []), { name: 'ဘဏ်အသစ်', cashIn: 0, cashOut: 0 }];
    setLocalFees({ ...localFees, banks: newBanks });
  };

  const removeBank = (index: number) => {
    if (!localFees) return;
    const newBanks = [...localFees.banks];
    newBanks.splice(index, 1);
    setLocalFees({ ...localFees, banks: newBanks });
  };

  const addBill = () => {
    if (!localFees) return;
    const newBills = [...(localFees.bills || []), { name: 'ဘေလ်အမျိုးအစားသစ်', fee: 0 }];
    setLocalFees({ ...localFees, bills: newBills });
  };

  const removeBill = (index: number) => {
    if (!localFees) return;
    const newBills = [...localFees.bills];
    newBills.splice(index, 1);
    setLocalFees({ ...localFees, bills: newBills });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Exchange Rates */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ArrowLeftRight className="w-6 h-6 text-blue-600" />
            <h2 className="font-bold text-slate-800">ငွေလဲနှုန်းထားများ</h2>
          </div>
          <button 
            onClick={handleSaveRates}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" /> နှုန်းထားသိမ်းမည်
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">ဘတ် ➡️ ကျပ်</h3>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">ရောင်းဈေး (1 ဘတ် = ? ကျပ်)</label>
              <input 
                type="number" 
                value={localRates?.thb_to_mmk || 0}
                onChange={(e) => setLocalRates(r => r ? {...r, thb_to_mmk: parseFloat(e.target.value)} : null)}
                className="w-full px-4 py-2 rounded-lg border-slate-200 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">အမြတ် (ဘတ်တစ်ယူနစ်လျှင် ရမည့် ကျပ်)</label>
              <input 
                type="number" 
                value={localRates?.thb_to_mmk_profit || 0}
                onChange={(e) => setLocalRates(r => r ? {...r, thb_to_mmk_profit: parseFloat(e.target.value)} : null)}
                className="w-full px-4 py-2 rounded-lg border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">ကျပ် ➡️ ဘတ်</h3>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">ရောင်းဈေး (1 ကျပ် = ? ဘတ်)</label>
              <input 
                type="number" 
                value={localRates?.mmk_to_thb || 0}
                step="0.000001"
                onChange={(e) => setLocalRates(r => r ? {...r, mmk_to_thb: parseFloat(e.target.value)} : null)}
                className="w-full px-4 py-2 rounded-lg border-slate-200 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">အမြတ် (ကျပ်တစ်ယူနစ်လျှင် ရမည့် ကျပ်)</label>
              <input 
                type="number" 
                value={localRates?.mmk_to_thb_profit || 0}
                step="0.000001"
                onChange={(e) => setLocalRates(r => r ? {...r, mmk_to_thb_profit: parseFloat(e.target.value)} : null)}
                className="w-full px-4 py-2 rounded-lg border-slate-200 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bank Fees */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-violet-600" />
            <h2 className="font-bold text-slate-800">ဘဏ်နှင့် ဝေါလက် ဝန်ဆောင်ခ (%)</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={addBank}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              <Plus className="w-4 h-4" /> ထည့်မည်
            </button>
            <button 
              onClick={handleSaveFees}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition-colors"
            >
              <Save className="w-4 h-4" /> ဝန်ဆောင်ခသိမ်းမည်
            </button>
          </div>
        </div>
        <div className="p-0">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
              <tr>
                <th className="px-6 py-4">ဘဏ် / ဝေါလက် အမည်</th>
                <th className="px-6 py-4">သွင်း (%)</th>
                <th className="px-6 py-4">ထုတ် (%)</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localFees?.banks?.map((bank, index) => (
                <tr key={index} className="group">
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={bank.name}
                      onChange={(e) => {
                         const newBanks = [...localFees.banks];
                         newBanks[index].name = e.target.value;
                         setLocalFees({...localFees, banks: newBanks});
                      }}
                      className="w-full bg-transparent border-0 focus:ring-0 font-medium text-slate-900"
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <input 
                      type="number" 
                      value={bank.cashIn}
                      onChange={(e) => {
                         const newBanks = [...localFees.banks];
                         newBanks[index].cashIn = parseFloat(e.target.value);
                         setLocalFees({...localFees, banks: newBanks});
                      }}
                      className="w-20 bg-slate-50 border-0 rounded px-2 py-1 text-sm font-bold"
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                     <input 
                      type="number" 
                      value={bank.cashOut}
                      onChange={(e) => {
                         const newBanks = [...localFees.banks];
                         newBanks[index].cashOut = parseFloat(e.target.value);
                         setLocalFees({...localFees, banks: newBanks});
                      }}
                      className="w-20 bg-slate-50 border-0 rounded px-2 py-1 text-sm font-bold"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => removeBank(index)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bill Fees */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6 text-amber-600" />
            <h2 className="font-bold text-slate-800">ဘေလ် ဝန်ဆောင်ခ (%)</h2>
          </div>
          <button 
            onClick={addBill}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors ml-auto mr-2"
          >
            <Plus className="w-4 h-4" /> ထည့်မည်
          </button>
          <button 
            onClick={handleSaveFees}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors"
          >
            <Save className="w-4 h-4" /> ဝန်ဆောင်ခသိမ်းမည်
          </button>
        </div>
        <div className="p-0">
           <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
              <tr>
                <th className="px-6 py-4">ဘေလ် အမျိုးအစား</th>
                <th className="px-6 py-4">ဝန်ဆောင်ခ (%)</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {localFees?.bills?.map((bill, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={bill.name}
                      onChange={(e) => {
                         const newBills = [...localFees.bills];
                         newBills[index].name = e.target.value;
                         setLocalFees({...localFees, bills: newBills});
                      }}
                      className="w-full bg-transparent border-0 focus:ring-0 font-medium text-slate-900"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="number" 
                      value={bill.fee}
                      onChange={(e) => {
                         const newBills = [...localFees.bills];
                         newBills[index].fee = parseFloat(e.target.value);
                         setLocalFees({...localFees, bills: newBills});
                      }}
                      className="w-20 bg-slate-50 border-0 rounded px-2 py-1 text-sm font-bold"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => removeBill(index)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
