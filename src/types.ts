export type Currency = 'THB' | 'MMK';
export type TransactionType = 'exchange' | 'service' | 'bill';
export type ServiceAction = 'CashOut' | 'CashIn';

export interface ExchangeRate {
  thb_to_mmk: number;
  mmk_to_thb: number;
  thb_to_mmk_profit: number; // Profit in MMK per 1 THB exchanged
  mmk_to_thb_profit: number; // Profit in MMK per 1 MMK exchanged
  updatedAt: string;
}

export interface Bank {
  name: string;
  cashIn: number; // percentage
  cashOut: number; // percentage
}

export interface BillType {
  name: string;
  fee: number; // percentage
}

export interface ServiceFeeSettings {
  banks: Bank[];
  bills: BillType[];
  updatedAt: string;
}

export interface Transaction {
  id?: string;
  type: TransactionType;
  customerName: string;
  amount: number;
  profit: number;
  timestamp: string;
  createdBy: string;
  details: {
    fromCurrency?: Currency;
    toCurrency?: Currency;
    rate?: number;
    receiveAmount?: number;
    serviceType?: ServiceAction;
    bank?: string;
    feeRate?: number;
    feeAmount?: number;
    billType?: string;
  };
}
