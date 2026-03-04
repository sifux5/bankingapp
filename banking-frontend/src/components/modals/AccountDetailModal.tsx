import { accountAPI } from '../../services/api';
import type { Account, Transaction } from '../../types';
import { toast } from 'react-toastify';

type Props = {
  account: Account;
  transactions: Transaction[];
  onClose: () => void;
  onRefresh: () => void;
};

export default function AccountDetailModal({ account, transactions, onClose, onRefresh }: Props) {
  const totalIn = transactions.filter(t => t.toAccountNumber === account.accountNumber).reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.fromAccountNumber === account.accountNumber).reduce((s, t) => s + t.amount, 0);

  const handleClose = async () => {
    if (window.confirm(`Are you sure you want to close account ${account.accountNumber}? Balance must be €0.00`)) {
      try {
        await accountAPI.deactivateAccount(account.accountNumber);
        toast.success('Account closed successfully');
        onClose();
        onRefresh();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to close account');
      }
    }
  };

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex justify-between py-2 border-b dark:border-gray-700">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-medium dark:text-white">{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold dark:text-white">Account Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-2xl">✕</button>
        </div>
        <div className="space-y-1">
          {row('Account Type', account.accountType)}
          {row('Account Number', account.accountNumber)}
          {row('Balance', <span className="font-bold text-blue-600 dark:text-blue-400">€{account.balance.toFixed(2)}</span>)}
          {row('Status', <span className={account.active ? 'text-green-600' : 'text-red-600'}>{account.active ? 'Active' : 'Inactive'}</span>)}
          {row('Created', new Date(account.createdAt).toLocaleDateString())}
          {row('Total In', <span className="text-green-600">+€{totalIn.toFixed(2)}</span>)}
          <div className="flex justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Total Out</span>
            <span className="font-medium text-red-600">-€{totalOut.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">Close</button>
          {account.active && (
            <button onClick={handleClose} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg">Close Account</button>
          )}
        </div>
      </div>
    </div>
  );
}