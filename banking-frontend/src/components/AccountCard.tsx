import type { Account } from '../types';

type Props = {
  account: Account;
  isSelected: boolean;
  onClick: () => void;
};

export default function AccountCard({ account, isSelected, onClick }: Props) {
  return (
    <div onClick={onClick}
      className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow cursor-pointer transition ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold dark:text-white">{account.accountType}</h3>
        <span className={`px-2 py-1 rounded text-xs ${account.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
          {account.active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{account.accountNumber}</p>
      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">€{account.balance.toFixed(2)}</p>
    </div>
  );
}