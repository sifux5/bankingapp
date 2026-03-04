import { useState } from 'react';
import { transactionAPI } from '../../services/api';
import type { Account } from '../../types';
import { toast } from 'react-toastify';

type Props = {
  account: Account;
  onClose: () => void;
  onSuccess: () => void;
};

export default function WithdrawModal({ account, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (num > account.balance) return toast.error('Insufficient funds!');
    try {
      await transactionAPI.withdraw(account.accountNumber, num, description || 'Withdrawal');
      toast.success(`€${amount} withdrawn successfully!`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Withdrawal failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold dark:text-white">Withdraw Money</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-2xl">✕</button>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded p-3 mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">Available Balance: <span className="font-bold">€{account.balance.toFixed(2)}</span></p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Amount (€)</label>
            <input type="number" step="0.01" min="0.01" max={account.balance} value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="0.00" required />
          </div>
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Description (optional)</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="e.g., ATM Withdrawal, Cash" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 rounded-lg">Cancel</button>
            <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">Withdraw</button>
          </div>
        </form>
      </div>
    </div>
  );
}