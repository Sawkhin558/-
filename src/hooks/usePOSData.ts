import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, query, orderBy, limit, setDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { ExchangeRate, ServiceFeeSettings, Transaction } from '../types';

export function usePOSData(isAuthenticated: boolean) {
  const [rates, setRates] = useState<ExchangeRate | null>(null);
  const [fees, setFees] = useState<ServiceFeeSettings | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Listen to rates
    const unsubRates = onSnapshot(doc(db, 'settings', 'rates'), (snapshot) => {
      if (snapshot.exists()) {
        setRates(snapshot.data() as ExchangeRate);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/rates'));

    // Listen to fees
    const unsubFees = onSnapshot(doc(db, 'settings', 'fees'), (snapshot) => {
      if (snapshot.exists()) {
        setFees(snapshot.data() as ServiceFeeSettings);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/fees'));

    // Listen to latest transactions
    const q = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'), limit(100));
    const unsubTransactions = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
      setTransactions(docs);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'transactions'));

    return () => {
      unsubRates();
      unsubFees();
      unsubTransactions();
    };
  }, [isAuthenticated]);

  const saveRates = async (newRates: Partial<ExchangeRate>) => {
    try {
      await setDoc(doc(db, 'settings', 'rates'), {
        ...newRates,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/rates');
    }
  };

  const saveFees = async (newFees: Partial<ServiceFeeSettings>) => {
    try {
      await setDoc(doc(db, 'settings', 'fees'), {
        ...newFees,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/fees');
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp' | 'createdBy'>) => {
    try {
      await addDoc(collection(db, 'transactions'), {
        ...transaction,
        timestamp: new Date().toISOString(),
        createdBy: auth.currentUser?.email || 'unknown',
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'transactions');
    }
  };

  return { rates, fees, transactions, loading, saveRates, saveFees, addTransaction };
}
