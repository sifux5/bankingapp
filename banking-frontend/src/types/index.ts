export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface Account {
  id: number;
  accountNumber: string;
  accountType: 'CHECKING' | 'SAVINGS';
  balance: number;
  active: boolean;
  createdAt: string;
}

export interface Transaction {
  id: number;
  fromAccountNumber: string | null;
  toAccountNumber: string | null;
  amount: number;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description: string;
  category: string | null;
  createdAt: string;
}

export interface LoginResponse {
  message: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  message: string;
  userId: number;
  email: string;
}