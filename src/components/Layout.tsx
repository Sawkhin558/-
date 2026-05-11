import { ReactNode } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { 
  BarChart3, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  Receipt,
  LogOut,
  User as UserIcon,
  RefreshCw
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: ReactNode;
  activeSection: string;
  onNavChange: (section: string) => void;
  user: User;
  posData: any;
}

export function Layout({ children, activeSection, onNavChange, user, posData }: LayoutProps) {
  const menuItems = [
    { id: 'dashboard', label: 'ပင်မစာမျက်နှာ', icon: LayoutDashboard },
    { id: 'exchange', label: 'ငွေလဲလှယ်ခြင်း', icon: ArrowLeftRight },
    { id: 'service', label: 'ငွေသွင်း/ငွေထုတ်', icon: Wallet },
    { id: 'bill', label: 'ဘေလ်ဆောင်ခြင်း', icon: Receipt },
    { id: 'reports', label: 'အစီရင်ခံစာ', icon: BarChart3 },
    { id: 'rates', label: 'သတ်မှတ်ချက်များ', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-teal-600 p-2 rounded-lg">
            <RefreshCw className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg leading-tight">Myanmar<br/>POS</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                activeSection === item.id 
                  ? "bg-teal-50 text-teal-700 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-100/50 rounded-xl mb-4 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full rounded-full" />
              ) : (
                <UserIcon className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate text-slate-800">{user.displayName || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            ထွက်မည်
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-3 flex justify-around items-center z-50">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 min-w-[60px]",
              activeSection === item.id ? "text-teal-600" : "text-slate-400"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-x-hidden pt-6 pb-24 md:pb-6 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 capitalize">
            {activeSection === 'dashboard' ? 'ခြုံငုံသုံးသပ်ချက်' : 
             activeSection === 'exchange' ? 'ငွေလဲလှယ်ခြင်း' :
             activeSection === 'service' ? 'ငွေသွင်း/ငွေထုတ်' :
             activeSection === 'bill' ? 'ဘေလ်ဆောင်ခြင်း' :
             activeSection === 'reports' ? 'အစီရင်ခံစာ' : 'သတ်မှတ်ချက်များ'}
          </h1>
          {posData.loading && (
             <div className="flex items-center gap-2 text-slate-400 text-sm">
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
               ဒေတာ ချိတ်ဆက်နေသည်...
             </div>
          )}
        </header>
        {children}
      </main>
    </div>
  );
}
