import { useMemo } from 'react';
import { Transaction } from '../types';
import { TrendingUp, ArrowLeftRight, Wallet, Receipt, Clock } from 'lucide-react';
import { format, isToday, isSameMonth } from 'date-fns';
import { motion } from 'motion/react';

interface DashboardProps {
  posData: {
    transactions: Transaction[];
    loading: boolean;
  };
}

export function Dashboard({ posData }: DashboardProps) {
  const { transactions } = posData;

  const stats = useMemo(() => {
    const todayTrans = transactions.filter(t => isToday(new Date(t.timestamp)));
    const monthTrans = transactions.filter(t => isSameMonth(new Date(t.timestamp), new Date()));

    const calculateStats = (list: Transaction[]) => {
      const exchangeProfit = list.filter(t => t.type === 'exchange').reduce((sum, t) => sum + t.profit, 0);
      const serviceProfit = list.filter(t => t.type === 'service').reduce((sum, t) => sum + t.profit, 0);
      const billProfit = list.filter(t => t.type === 'bill').reduce((sum, t) => sum + t.profit, 0);
      return {
        exchangeProfit,
        serviceProfit,
        billProfit,
        totalProfit: exchangeProfit + serviceProfit + billProfit,
        counts: {
          exchange: list.filter(t => t.type === 'exchange').length,
          service: list.filter(t => t.type === 'service').length,
          bill: list.filter(t => t.type === 'bill').length,
        }
      };
    };

    return {
      today: calculateStats(todayTrans),
      month: calculateStats(monthTrans)
    };
  }, [transactions]);

  const cards = [
    { label: "ယနေ့ အမြတ်", value: stats.today.totalProfit, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", suffix: "ကျပ်" },
    { label: "ငွေလဲ အမြတ်", value: stats.today.exchangeProfit, icon: ArrowLeftRight, color: "text-blue-600", bg: "bg-blue-50", suffix: "ကျပ်" },
    { label: "သွင်း/ထုတ် အမြတ်", value: stats.today.serviceProfit, icon: Wallet, color: "text-violet-600", bg: "bg-violet-50", suffix: "ကျပ်" },
    { label: "ဘေလ် အမြတ်", value: stats.today.billProfit, icon: Receipt, color: "text-amber-600", bg: "bg-amber-50", suffix: "ကျပ်" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">{card.label}</span>
              <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900">{card.value.toLocaleString()}</span>
              <span className="text-xs ml-1 font-medium text-slate-400">{card.suffix}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">ယခုလ အကျဉ်းချုပ်</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-600">စုစုပေါင်း အမြတ်</span>
              <span className="text-xl font-bold text-teal-600">{stats.month.totalProfit.toLocaleString()} ကျပ်</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4">
                <p className="text-2xl font-bold text-slate-800">{stats.month.counts.exchange}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">ငွေလဲလှယ်မှု</p>
              </div>
              <div className="text-center p-4 border-x border-slate-100">
                <p className="text-2xl font-bold text-slate-800">{stats.month.counts.service}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">သွင်း/ထုတ်</p>
              </div>
              <div className="text-center p-4">
                <p className="text-2xl font-bold text-slate-800">{stats.month.counts.bill}</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">ဘေလ်များ</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800">လတ်တလော စာရင်းများ</h3>
            <Clock className="w-5 h-5 text-slate-300" />
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((t, i) => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    t.type === 'exchange' ? 'bg-blue-50 text-blue-600' :
                    t.type === 'service' ? 'bg-violet-50 text-violet-600' :
                    'bg-amber-50 text-amber-600'
                  }`}>
                    {t.type === 'exchange' ? <ArrowLeftRight className="w-4 h-4" /> :
                     t.type === 'service' ? <Wallet className="w-4 h-4" /> :
                     <Receipt className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.customerName || 'နာမည်မရှိ'}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {format(new Date(t.timestamp), 'MMM d, h:mm a')} • {
                        t.type === 'exchange' ? 'ငွေလဲ' : 
                        t.type === 'service' ? 'သွင်း/ထုတ်' : 'ဘေလ်'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{t.amount.toLocaleString()} <span className="text-[10px] uppercase">{t.type === 'exchange' ? t.details.fromCurrency : 'ကျပ်'}</span></p>
                  <p className="text-[10px] font-bold text-emerald-600">+{t.profit.toLocaleString()} ကျပ်</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p>စာရင်း မရှိသေးပါ</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
