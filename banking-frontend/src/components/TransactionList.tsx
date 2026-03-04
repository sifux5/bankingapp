import { useState } from 'react';
import { transactionAPI } from '../services/api';
import type { Account, Transaction } from '../types';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';

type Props = {
  account: Account;
  transactions: Transaction[];
  onCategoryUpdate: () => void;
};

export default function TransactionList({ account, transactions, onCategoryUpdate }: Props) {
  const [filterType, setFilterType] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'>('ALL');
  const [filterDateRange, setFilterDateRange] = useState<'7' | '30' | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter(t => {
    if (filterType !== 'ALL' && t.transactionType !== filterType) return false;
    if (filterDateRange !== 'ALL') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(filterDateRange));
      if (new Date(t.createdAt) < cutoff) return false;
    }
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Banking App - Transaction History', 14, 20);
    doc.setFontSize(12);
    doc.text(`Account: ${account.accountNumber}`, 14, 32);
    doc.text(`Balance: €${account.balance.toFixed(2)}`, 14, 40);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48);
    doc.line(14, 54, 196, 54);
    let y = 64;
    doc.setFontSize(10);
    doc.text('Date', 14, y); doc.text('Type', 60, y); doc.text('Description', 95, y); doc.text('Amount', 170, y);
    doc.line(14, y + 4, 196, y + 4);
    y += 12;
    filtered.forEach(t => {
      if (y > 270) { doc.addPage(); y = 20; }
      const amount = t.fromAccountNumber === account.accountNumber ? `-€${t.amount.toFixed(2)}` : `+€${t.amount.toFixed(2)}`;
      doc.text(new Date(t.createdAt).toLocaleDateString(), 14, y);
      doc.text(t.transactionType, 60, y);
      doc.text(t.description || '-', 95, y);
      doc.text(amount, 170, y);
      y += 8;
    });
    doc.save(`transactions-${account.accountNumber}.pdf`);
  };

  const typeBtn = (label: string, val: typeof filterType, color: string) => (
    <button onClick={() => setFilterType(val)}
      className={`px-4 py-2 rounded ${filterType === val ? `${color} text-white` : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
      {label}
    </button>
  );

  const dateBtn = (label: string, val: typeof filterDateRange) => (
    <button onClick={() => setFilterDateRange(val)}
      className={`px-4 py-2 rounded ${filterDateRange === val ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
      {label}
    </button>
  );

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">Transaction History</h2>
        <button onClick={exportToPDF} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm">📄 Export PDF</button>
      </div>
      <div className="mb-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-2">
            {typeBtn('All', 'ALL', 'bg-blue-500')}
            {typeBtn('Deposits', 'DEPOSIT', 'bg-green-500')}
            {typeBtn('Withdrawals', 'WITHDRAWAL', 'bg-orange-500')}
            {typeBtn('Transfers', 'TRANSFER', 'bg-purple-500')}
          </div>
          <div className="flex gap-2">
            {dateBtn('Last 7 days', '7')}
            {dateBtn('Last 30 days', '30')}
            {dateBtn('All time', 'ALL')}
          </div>
        </div>
        <input type="text" placeholder="Search by description..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No transactions match your filters</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="border-b dark:border-gray-700 pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`font-semibold ${t.transactionType === 'DEPOSIT' ? 'text-green-600 dark:text-green-400' : t.transactionType === 'WITHDRAWAL' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                    {t.transactionType}
                  </span>
                  {t.category && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">{t.category}</span>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300">{t.description}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(t.createdAt).toLocaleString()}</p>
                  <select value={t.category || ''} onChange={async e => {
                    try {
                      await transactionAPI.updateCategory(t.id, e.target.value);
                      onCategoryUpdate();
                    } catch { toast.error('Failed to update category'); }
                  }} className="mt-1 text-xs border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1">
                    <option value="">No category</option>
                    {['Food','Transport','Entertainment','Shopping','Health','Salary','Rent','Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <span className={`font-bold ${t.fromAccountNumber === account.accountNumber ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {t.fromAccountNumber === account.accountNumber ? '-' : '+'}€{t.amount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}