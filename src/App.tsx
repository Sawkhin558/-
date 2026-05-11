import { useState, useEffect } from 'react';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { usePOSData } from './hooks/usePOSData';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ExchangeForm } from './components/ExchangeForm';
import { ServiceForm } from './components/ServiceForm';
import { BillForm } from './components/BillForm';
import { Settings } from './components/Settings';
import { Reports } from './components/Reports';
import { LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const posData = usePOSData(!!user);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-slate-900">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
            <LogIn className="w-10 h-10 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold">မြန်မာ ငွေလဲနှင့် ဝန်ဆောင်မှု</h1>
          <p className="text-slate-500">POS စနစ်ကို အသုံးပြုရန် Google အကောင့်ဖြင့် ဝင်ရောက်ပါ။</p>
          <button
            onClick={signInWithGoogle}
            className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            Google အကောင့်ဖြင့် ဝင်မည်
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <Layout activeSection={activeSection} onNavChange={setActiveSection} user={user} posData={posData}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeSection === 'dashboard' && <Dashboard posData={posData} />}
          {activeSection === 'exchange' && <ExchangeForm posData={posData} />}
          {activeSection === 'service' && <ServiceForm posData={posData} />}
          {activeSection === 'bill' && <BillForm posData={posData} />}
          {activeSection === 'rates' && <Settings posData={posData} />}
          {activeSection === 'reports' && <Reports posData={posData} />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
