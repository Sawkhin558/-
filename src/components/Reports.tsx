import { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Download, Filter, TrendingUp, Search } from 'lucide-react';

interface ReportsProps {
  posData: {
    transactions: Transaction[];
  };
}

export function Reports({ posData }: ReportsProps) {
  const { transactions } = posData;
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'yearly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    let start: Date;
    let end: Date;

    if (reportType === 'daily') {
      start = startOfDay(selectedDate);
      end = endOfDay(selectedDate);
    } else if (reportType === 'monthly') {
      start = startOfMonth(selectedDate);
      end = endOfMonth(selectedDate);
    } else {
      // yearly - keep it simple, just filter the whole year
      start = new Date(selectedDate.getFullYear(), 0, 1);
      end = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59);
    }

    return transactions.filter(t => {
      const d = new Date(t.timestamp);
      const isInTimeRange = isWithinInterval(d, { start, end });
      
      if (!isInTimeRange) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.customerName.toLowerCase().includes(query);
        const matchesType = t.type.toLowerCase().includes(query);
        const matchesDetails = JSON.stringify(t.details).toLowerCase().includes(query);
        return matchesName || matchesType || matchesDetails;
      }

      return true;
    });
  }, [transactions, reportType, selectedDate, searchQuery]);

  const chartData = useMemo(() => {
    // Group by day for the chart
    const groups: { [key: string]: number } = {};
    filteredData.forEach(t => {
      const day = format(new Date(t.timestamp), 'MMM d');
      groups[day] = (groups[day] || 0) + t.profit;
    });

    return Object.entries(groups).map(([name, profit]) => ({ name, profit }));
  }, [filteredData]);

  const summary = useMemo(() => {
    const exchange = filteredData.filter(t => t.type === 'exchange').reduce((sum, t) => sum + t.profit, 0);
    const service = filteredData.filter(t => t.type === 'service').reduce((sum, t) => sum + t.profit, 0);
    const bill = filteredData.filter(t => t.type === 'bill').reduce((sum, t) => sum + t.profit, 0);
    return { exchange, service, bill, total: exchange + service + bill };
  }, [filteredData]);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Customer', 'Amount', 'Profit', 'Details'];
    const rows = filteredData.map(t => [
      format(new Date(t.timestamp), 'yyyy-MM-dd HH:mm'),
      t.type,
      t.customerName,
      t.amount,
      t.profit,
      JSON.stringify(t.details).replace(/"/g, '')
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report-${reportType}-${format(selectedDate, 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex-shrink-0">
           {[
             { id: 'daily', label: 'နေ့စဉ်' },
             { id: 'monthly', label: 'လစဉ်' },
             { id: 'yearly', label: 'နှစ်စဉ်' }
           ].map((type) => (
             <button
               key={type.id}
               onClick={() => setReportType(type.id as any)}
               className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                 reportType === type.id ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-slate-500 hover:text-slate-900'
               }`}
             >
               {type.label}
             </button>
           ))}
        </div>

        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ဝယ်သူအမည် သို့မဟုတ် အချက်အလက်ဖြင့် ရှာဖွေပါ..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" /> ဒေတာထုတ်ယူရန်
          </button>
          <input 
            type={reportType === 'daily' ? 'date' : reportType === 'monthly' ? 'month' : 'number'}
            value={reportType === 'daily' ? format(selectedDate, 'yyyy-MM-dd') : reportType === 'monthly' ? format(selectedDate, 'yyyy-MM') : selectedDate.getFullYear()}
            onChange={(e) => {
              if (reportType === 'yearly') {
                setSelectedDate(new Date(parseInt(e.target.value), 0, 1));
              } else {
                setSelectedDate(new Date(e.target.value));
              }
            }}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">အမြတ်အစွန်း ခွဲခြမ်းစိတ်ဖြာချက်</h3>
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.2 rounded-full text-sm font-bold">
              <TrendingUp className="w-4 h-4" />
              <span>စုစုပေါင်း {summary.total.toLocaleString()} ကျပ်</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px'}}
                />
                <Bar dataKey="profit" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#0d9488" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-4">ဝန်ဆောင်မှုအလိုက် စုစုပေါင်း</h4>
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">ငွေလဲလှယ်မှု</p>
                      <p className="font-bold text-slate-800">{summary.exchange.toLocaleString()} <span className="text-sm text-slate-400 ml-1">ကျပ်</span></p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-300">{((summary.exchange / summary.total || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 bg-violet-500 rounded-full"></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">သွင်း/ထုတ်</p>
                      <p className="font-bold text-slate-800">{summary.service.toLocaleString()} <span className="text-sm text-slate-400 ml-1">ကျပ်</span></p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-300">{((summary.service / summary.total || 0) * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 bg-amber-500 rounded-full"></div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">ဘေလ် ဝန်ဆောင်မှု</p>
                      <p className="font-bold text-slate-800">{summary.bill.toLocaleString()} <span className="text-sm text-slate-400 ml-1">ကျပ်</span></p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-300">{((summary.bill / summary.total || 0) * 100).toFixed(0)}%</span>
                </div>
             </div>
           </div>

           <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
             <div className="flex items-center gap-2 mb-2 text-teal-400">
               <TrendingUp className="w-4 h-4" />
               <span className="text-[10px] uppercase font-black tracking-[0.2em]">စုစုပေါင်း လုပ်ဆောင်ချက်</span>
             </div>
             <p className="text-3xl font-black mb-1">{summary.total.toLocaleString()} <span className="text-xs font-bold text-slate-500">ကျပ်</span></p>
             <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
               ရွေးချယ်ထားသော ကာလအတွင်း လုပ်ဆောင်ခဲ့သော စာရင်းများအားလုံးမှ စုစုပေါင်း အမြတ်ငွေ ဖြစ်ပါသည်။
             </p>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">အရောင်းမှတ်တမ်း</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest font-bold text-slate-400">
              <tr>
                <th className="px-6 py-4">အချိန်</th>
                <th className="px-6 py-4">အမျိုးအစား</th>
                <th className="px-6 py-4">ဝယ်သူ</th>
                <th className="px-6 py-4">ပမာဏ</th>
                <th className="px-6 py-4">အမြတ်</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">
                    {format(new Date(t.timestamp), 'MMM d, HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      t.type === 'exchange' ? 'bg-blue-100 text-blue-700' :
                      t.type === 'service' ? 'bg-violet-100 text-violet-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {t.type === 'exchange' ? 'ငွေလဲ' : t.type === 'service' ? 'သွင်း/ထုတ်' : 'ဘေလ်'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                    {t.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 whitespace-nowrap">
                    {t.amount.toLocaleString()} <span className="text-[10px] text-slate-400 uppercase">{t.type === 'exchange' ? t.details.fromCurrency : 'ကျပ်'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-emerald-600 whitespace-nowrap">
                    {t.profit.toLocaleString()} <span className="text-[10px] text-slate-400">ကျပ်</span>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">ရွေးချယ်ထားသော ကာလအတွင်း စာရင်းမှတ်တမ်း မရှိပါ။</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
