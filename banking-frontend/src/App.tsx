import { useState, useEffect } from 'react';
import { accountAPI, transactionAPI } from './services/api';
import type { LoginResponse, Transaction, Account } from './types';
import { toast } from 'react-toastify';
import TransactionChart from './components/TransactionChart';
import TransactionList from './components/TransactionList';
import AccountCard from './components/AccountCard';
import AccountDetailModal from './components/modals/AccountDetailModal';
import DepositModal from './components/modals/DepositModal';
import WithdrawModal from './components/modals/WithdrawModal';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('darkMode') || 'false'));
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  return [darkMode, setDarkMode] as const;
}

function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'profile'>('landing');
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({ toAccountNumber: '', amount: '', description: '' });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => { if (user && view === 'dashboard') loadAccounts(); }, [user, view]);

  const loadAccounts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await accountAPI.getUserAccounts(user.email);
      setAccounts(res.data);
      if (res.data.length > 0) selectAccount(res.data[0]);
    } catch { console.error('Failed to load accounts'); }
    finally { setLoading(false); }
  };

  const selectAccount = async (account: Account) => {
    setSelectedAccount(account);
    try {
      const res = await transactionAPI.getHistory(account.accountNumber);
      setTransactions(res.data);
    } catch { console.error('Failed to load transactions'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null); setView('login'); setAccounts([]); setSelectedAccount(null); setTransactions([]);
  };

  const handleCreateAccount = async (type: 'CHECKING' | 'SAVINGS') => {
    if (!user) return;
    try { await accountAPI.createAccount(user.email, type); await loadAccounts(); toast.success(`${type} account created!`); }
    catch { toast.error('Failed to create account'); }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    try {
      await transactionAPI.transfer({ fromAccountNumber: selectedAccount.accountNumber, toAccountNumber: transferData.toAccountNumber, amount: parseFloat(transferData.amount), description: transferData.description });
      toast.success('Transfer successful!');
      setShowTransfer(false);
      setTransferData({ toAccountNumber: '', amount: '', description: '' });
      await loadAccounts();
      selectAccount(selectedAccount);
    } catch (err: any) { toast.error(err.response?.data?.error || 'Transfer failed'); }
  };

  if (view === 'landing') return <Landing onLogin={() => setView('login')} onRegister={() => setView('register')} />;
  if (view === 'login') return <Login onSuccess={u => { setUser(u); setView('dashboard'); }} onRegister={() => setView('register')} />;
  if (view === 'register') return <Register onSuccess={() => setView('login')} onLogin={() => setView('login')} />;
  if (view === 'profile' && user) return <Profile user={user} onLogout={handleLogout} onBack={() => setView('dashboard')} onUpdate={setUser} />;
  if (loading) return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center"><div className="text-xl dark:text-white">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-blue-600 text-white p-4 shadow-lg dark:bg-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Banking App</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.firstName}!</span>
            <button onClick={() => setDarkMode(!darkMode)} className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-white">{darkMode ? '☀️' : '🌙'}</button>
            <button onClick={() => setView('profile')} className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-white">👤 Profile</button>
            <button onClick={handleLogout} className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-white">Logout</button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {accounts.map(account => (
            <AccountCard key={account.id} account={account} isSelected={selectedAccount?.id === account.id}
              onClick={() => { selectAccount(account); setShowDetailModal(true); }} />
          ))}
          <div onClick={() => handleCreateAccount('CHECKING')} className="bg-blue-50 dark:bg-gray-800 border-2 border-dashed border-blue-300 dark:border-blue-700 p-6 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 transition flex items-center justify-center">
            <p className="text-blue-600 dark:text-blue-400 font-semibold">+ Create Checking Account</p>
          </div>
          <div onClick={() => handleCreateAccount('SAVINGS')} className="bg-purple-50 dark:bg-gray-800 border-2 border-dashed border-purple-300 dark:border-purple-700 p-6 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-gray-700 transition flex items-center justify-center">
            <p className="text-purple-600 dark:text-purple-400 font-semibold">+ Create Savings Account</p>
          </div>
        </div>

        {selectedAccount && (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-bold dark:text-white mb-4">Quick Actions</h2>
              <div className="flex gap-4 flex-wrap">
                <button onClick={() => setShowDepositModal(true)} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded">💰 Deposit</button>
                <button onClick={() => setShowWithdrawModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded">💵 Withdraw</button>
                <button onClick={() => setShowTransfer(!showTransfer)} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">💸 Transfer</button>
              </div>
              {showTransfer && (
                <form onSubmit={handleTransfer} className="mt-4 space-y-4">
                  <div><label className="block text-sm font-medium dark:text-gray-300 mb-1">To Account Number</label>
                    <input type="text" value={transferData.toAccountNumber} onChange={e => setTransferData({...transferData, toAccountNumber: e.target.value})} className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded" required /></div>
                  <div><label className="block text-sm font-medium dark:text-gray-300 mb-1">Amount</label>
                    <input type="number" step="0.01" value={transferData.amount} onChange={e => setTransferData({...transferData, amount: e.target.value})} className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded" required /></div>
                  <div><label className="block text-sm font-medium dark:text-gray-300 mb-1">Description (optional)</label>
                    <input type="text" value={transferData.description} onChange={e => setTransferData({...transferData, description: e.target.value})} className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded" /></div>
                  <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">Send Transfer</button>
                </form>
              )}
            </div>

            {showDetailModal && <AccountDetailModal account={selectedAccount} transactions={transactions} onClose={() => setShowDetailModal(false)} onRefresh={loadAccounts} />}
            {showDepositModal && <DepositModal account={selectedAccount} onClose={() => setShowDepositModal(false)} onSuccess={() => { loadAccounts(); selectAccount(selectedAccount); }} />}
            {showWithdrawModal && <WithdrawModal account={selectedAccount} onClose={() => setShowWithdrawModal(false)} onSuccess={() => { loadAccounts(); selectAccount(selectedAccount); }} />}

            <div className="mb-8"><TransactionChart transactions={transactions} currentAccountNumber={selectedAccount.accountNumber} /></div>
            <TransactionList account={selectedAccount} transactions={transactions} onCategoryUpdate={() => selectAccount(selectedAccount)} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;