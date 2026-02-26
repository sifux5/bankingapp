import { useState, useEffect } from 'react';
import { accountAPI, transactionAPI } from '../services/api';
import type { Account, Transaction, LoginResponse } from '../types';

interface DashboardProps {
  user: LoginResponse;
  onLogout: () => void;
}

function Dashboard({ user, onLogout }: DashboardProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({
    toAccountNumber: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await accountAPI.getUserAccounts(user.email);
      setAccounts(response.data);
      if (response.data.length > 0) {
        selectAccount(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = async (account: Account) => {
    setSelectedAccount(account);
    try {
      const response = await transactionAPI.getHistory(account.accountNumber);
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const handleCreateAccount = async (type: 'CHECKING' | 'SAVINGS') => {
    try {
      await accountAPI.createAccount(user.email, type);
      await loadAccounts();
      alert(`${type} account created successfully!`);
    } catch (error) {
      alert('Failed to create account');
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    try {
      await transactionAPI.transfer({
        fromAccountNumber: selectedAccount.accountNumber,
        toAccountNumber: transferData.toAccountNumber,
        amount: parseFloat(transferData.amount),
        description: transferData.description,
      });
      alert('Transfer successful!');
      setShowTransfer(false);
      setTransferData({ toAccountNumber: '', amount: '', description: '' });
      await loadAccounts();
      if (selectedAccount) {
        selectAccount(selectedAccount);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Transfer failed');
    }
  };

  const handleDeposit = async () => {
    if (!selectedAccount) return;
    const amount = prompt('Enter deposit amount:');
    if (!amount) return;

    try {
      await transactionAPI.deposit(selectedAccount.accountNumber, parseFloat(amount), 'Deposit');
      alert('Deposit successful!');
      await loadAccounts();
      selectAccount(selectedAccount);
    } catch (error) {
      alert('Deposit failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Banking App</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user.firstName}!</span>
            <button
              onClick={onLogout}
              className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Accounts Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => selectAccount(account)}
              className={`bg-white p-6 rounded-lg shadow cursor-pointer transition ${
                selectedAccount?.id === account.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{account.accountType}</h3>
                <span className={`px-2 py-1 rounded text-xs ${account.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {account.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{account.accountNumber}</p>
              <p className="text-2xl font-bold text-blue-600">€{account.balance.toFixed(2)}</p>
            </div>
          ))}

          {/* Create Account Cards */}
          <div
            onClick={() => handleCreateAccount('CHECKING')}
            className="bg-blue-50 border-2 border-dashed border-blue-300 p-6 rounded-lg cursor-pointer hover:bg-blue-100 transition flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-blue-600 font-semibold">+ Create Checking Account</p>
            </div>
          </div>

          <div
            onClick={() => handleCreateAccount('SAVINGS')}
            className="bg-purple-50 border-2 border-dashed border-purple-300 p-6 rounded-lg cursor-pointer hover:bg-purple-100 transition flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-purple-600 font-semibold">+ Create Savings Account</p>
            </div>
          </div>
        </div>

        {selectedAccount && (
          <>
            {/* Actions */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="flex gap-4">
                <button
                  onClick={handleDeposit}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
                >
                  Deposit
                </button>
                <button
                  onClick={() => setShowTransfer(!showTransfer)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                >
                  Transfer
                </button>
              </div>

              {showTransfer && (
                <form onSubmit={handleTransfer} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">To Account Number</label>
                    <input
                      type="text"
                      value={transferData.toAccountNumber}
                      onChange={(e) => setTransferData({ ...transferData, toAccountNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description (optional)</label>
                    <input
                      type="text"
                      value={transferData.description}
                      onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
                    Send Transfer
                  </button>
                </form>
              )}
            </div>

            {/* Transaction History */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Transaction History</h2>
              {transactions.length === 0 ? (
                <p className="text-gray-500">No transactions yet</p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`font-semibold ${transaction.transactionType === 'DEPOSIT' ? 'text-green-600' : transaction.transactionType === 'WITHDRAWAL' ? 'text-red-600' : 'text-blue-600'}`}>
                            {transaction.transactionType}
                          </span>
                          <p className="text-sm text-gray-600">{transaction.description}</p>
                          <p className="text-xs text-gray-400">{new Date(transaction.createdAt).toLocaleString()}</p>
                        </div>
                        <span className={`font-bold ${transaction.fromAccountNumber === selectedAccount.accountNumber ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.fromAccountNumber === selectedAccount.accountNumber ? '-' : '+'}€{transaction.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;