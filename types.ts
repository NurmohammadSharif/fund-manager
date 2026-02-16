
export type EntryType = 'collection' | 'expense';

export interface Entry {
  id: string;
  type: EntryType;
  title: string; // "Name of contributor" for collection, "Title/Reason" for expense
  amount: number;
  date: string;
  yearId: string;
  receiptImage?: string; // Base64 string of the image
}

export interface YearRecord {
  id: string; // e.g., "2023", "2024"
  openingBalance: number;
  isClosed: boolean;
  closedAt?: string;
}

export interface FinancialStats {
  totalCollection: number;
  totalExpense: number;
  currentBalance: number;
  openingBalance: number;
}

export interface User {
  username: string;
  isAdmin: boolean;
}
