import { useState, useEffect } from 'react';
import { authAPI, accountAPI, transactionAPI } from './services/api';
import type { LoginResponse, Transaction, Account } from './types';
import { toast } from 'react-toastify';
import TransactionChart from './components/TransactionChart';
import Profile from './pages/Profile';
import jsPDF from 'jspdf';

// Dark mode hook
function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return [darkMode, setDarkMode] as const;
}

function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'profile' | 'landing'>('landing');
  const [user, setUser] = useState<LoginResponse | null>(null);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Dashboard state
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

 // Transfer state
 const [showTransfer, setShowTransfer] = useState(false);
 const [transferData, setTransferData] = useState({
   toAccountNumber: '',
   amount: '',
   description: '',
 });

 // Account detail state
 const [showAccountDetail, setShowAccountDetail] = useState(false);
 const [detailAccount, setDetailAccount] = useState<Account | null>(null);

  // Deposit/Withdrawal modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [modalAmount, setModalAmount] = useState('');
  const [modalDescription, setModalDescription] = useState('');

  // Filter state
  const [filterType, setFilterType] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'>('ALL');
  const [filterDateRange, setFilterDateRange] = useState<'7' | '30' | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (filterType !== 'ALL' && transaction.transactionType !== filterType) {
      return false;
    }

    if (filterDateRange !== 'ALL') {
      const transactionDate = new Date(transaction.createdAt);
      const today = new Date();
      const daysAgo = parseInt(filterDateRange);
      const cutoffDate = new Date(today.setDate(today.getDate() - daysAgo));
      if (transactionDate < cutoffDate) {
        return false;
      }
    }

    if (searchQuery && !transaction.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    if (user && view === 'dashboard') {
      loadAccounts();
    }
  }, [user, view]);

  const loadAccounts = async () => {
    if (!user) return;
    setLoading(true);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      if (response.data.token) {
        localStorage.setItem('jwt_token', response.data.token);
      }
      setUser(response.data);
      setView('dashboard');
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);

  if (registerData.firstName.trim().length < 2 || !/^[a-zA-ZäöüõÄÖÜÕ\s]+$/.test(registerData.firstName)) {
    toast.error('First name must be at least 2 letters and contain only letters');
    setRegisterLoading(false);
    return;
  }
  if (registerData.lastName.trim().length < 2 || !/^[a-zA-ZäöüõÄÖÜÕ\s]+$/.test(registerData.lastName)) {
    toast.error('Last name must be at least 2 letters and contain only letters');
    setRegisterLoading(false);
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
    toast.error('Please enter a valid email address');
    setRegisterLoading(false);
    return;
  }
  if (registerData.password.length < 8) {
    toast.error('Password must be at least 8 characters');
    setRegisterLoading(false);
    return;
  }
  if (!/(?=.*[0-9])(?=.*[!@#$%^&*])/.test(registerData.password)) {
    toast.error('Password must contain at least one number and one special character (!@#$%^&*)');
    setRegisterLoading(false);
    return;
  }
  if (!/^\+?[\d\s\-]{7,15}$/.test(registerData.phoneNumber)) {
    toast.error('Please enter a valid phone number');
    setRegisterLoading(false);
    return;
  }

    try {
      await authAPI.register(registerData);
      toast.success('Registration successful! Please login.', {
        position: 'top-center',
        autoClose: 3000,
      });
      setView('login');
      setRegisterData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    setView('login');
    setEmail('');
    setPassword('');
    setAccounts([]);
    setSelectedAccount(null);
    setTransactions([]);
  };

  const handleCreateAccount = async (type: 'CHECKING' | 'SAVINGS') => {
    if (!user) return;
    try {
      await accountAPI.createAccount(user.email, type);
      await loadAccounts();
      toast.success(`${type} account created successfully!`);
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !modalAmount) return;

    try {
      await transactionAPI.deposit(selectedAccount.accountNumber, parseFloat(modalAmount), modalDescription || 'Deposit');
      toast.success(`€${modalAmount} deposited successfully!`);
      setShowDepositModal(false);
      setModalAmount('');
      setModalDescription('');
      await loadAccounts();
      selectAccount(selectedAccount);
    } catch (error) {
      toast.error('Deposit failed');
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || !modalAmount) return;

    const numAmount = parseFloat(modalAmount);
    if (numAmount > selectedAccount.balance) {
      toast.error('Insufficient funds!');
      return;
    }

    try {
      await transactionAPI.withdraw(selectedAccount.accountNumber, numAmount, modalDescription || 'Withdrawal');
      toast.success(`€${modalAmount} withdrawn successfully!`);
      setShowWithdrawModal(false);
      setModalAmount('');
      setModalDescription('');
      await loadAccounts();
      selectAccount(selectedAccount);
    } catch (error) {
      toast.error('Withdrawal failed');
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
      toast.success('Transfer successful!');
      setShowTransfer(false);
      setTransferData({ toAccountNumber: '', amount: '', description: '' });
      await loadAccounts();
      selectAccount(selectedAccount);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Transfer failed');
    }
  };

const exportToPDF = () => {
  if (!selectedAccount) return;

  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text('Banking App - Transaction History', 14, 20);

  doc.setFontSize(12);
  doc.text(`Account: ${selectedAccount.accountNumber}`, 14, 32);
  doc.text(`Type: ${selectedAccount.accountType}`, 14, 40);
  doc.text(`Balance: €${selectedAccount.balance.toFixed(2)}`, 14, 48);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 56);

  doc.line(14, 62, 196, 62);

  let y = 72;
  doc.setFontSize(10);
  doc.text('Date', 14, y);
  doc.text('Type', 60, y);
  doc.text('Description', 95, y);
  doc.text('Amount', 170, y);

  doc.line(14, y + 4, 196, y + 4);
  y += 12;

  filteredTransactions.forEach((transaction) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    const date = new Date(transaction.createdAt).toLocaleDateString();
    const amount = transaction.fromAccountNumber === selectedAccount.accountNumber
      ? `-€${transaction.amount.toFixed(2)}`
      : `+€${transaction.amount.toFixed(2)}`;

    doc.text(date, 14, y);
    doc.text(transaction.transactionType, 60, y);
    doc.text(transaction.description || '-', 95, y);
    doc.text(amount, 170, y);
    y += 8;
  });

  doc.save(`transactions-${selectedAccount.accountNumber}.pdf`);
};

  if (view === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">Banking App</h2>
          <h3 className="text-xl text-gray-600 dark:text-gray-300 mb-6 text-center">Register</h3>
          {registerError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {registerError}
            </div>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">First Name</label>
              <input
                type="text"
                value={registerData.firstName}
                onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Last Name</label>
              <input
                type="text"
                value={registerData.lastName}
                onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Phone Number</label>
              <input
                type="tel"
                value={registerData.phoneNumber}
                onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {registerLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
            Already have an account?{' '}
            <button onClick={() => setView('login')} className="text-purple-500 hover:text-purple-600 font-semibold">
              Login
            </button>
          </p>
        </div>
      </div>
    );
  }

if (view === 'landing') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      {/* Header */}
      <div className="container mx-auto px-6 py-6 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">🏦 Banking App</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setView('login')}
            className="text-white border border-white px-5 py-2 rounded-lg hover:bg-white hover:text-blue-600 transition"
          >
            Login
          </button>
          <button
            onClick={() => setView('register')}
            className="bg-white text-blue-600 px-5 py-2 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Register
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          Your Money, <br />
          <span className="text-yellow-300">Under Control</span>
        </h2>
        <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">
          Manage your accounts, track transactions, and transfer money — all in one secure place.
        </p>
        <button
          onClick={() => setView('register')}
          className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-10 py-4 rounded-lg text-lg transition"
        >
          Get Started Free →
        </button>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-white text-xl font-bold mb-2">Multiple Accounts</h3>
            <p className="text-blue-100">Create checking and savings accounts to organize your finances.</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-white text-xl font-bold mb-2">Easy Transfers</h3>
            <p className="text-blue-100">Send money between accounts instantly and securely.</p>
          </div>
          <div className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-white text-xl font-bold mb-2">Transaction History</h3>
            <p className="text-blue-100">Track all your transactions and export them as PDF.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-blue-200 pb-8">
        <p>© 2026 Banking App. Secure & Reliable.</p>
      </div>
    </div>
  );
}

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">Banking App</h2>
          <h3 className="text-xl text-gray-600 dark:text-gray-300 mb-6 text-center">Login</h3>
          {loginError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {loginError}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loginLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
            Don't have an account?{' '}
            <button onClick={() => setView('register')} className="text-blue-500 hover:text-blue-600 font-semibold">
              Register
            </button>
          </p>
        </div>
      </div>
    );
  }

if (view === 'profile' && user) {
    return (
      <Profile
        user={user}
        onLogout={handleLogout}
        onBack={() => setView('dashboard')}
        onUpdate={(updated) => setUser(updated)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-blue-600 text-white p-4 shadow-lg dark:bg-gray-800">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Banking App</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.firstName}!</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-white"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => { console.log('Profile clicked'); setView('profile'); }}
              className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-white"
            >
              👤 Profile
            </button>
            <button onClick={handleLogout} className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 dark:bg-gray-700 dark:text-white">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => {
                selectAccount(account);
                setDetailAccount(account);
                setShowAccountDetail(true);
              }}
              className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow cursor-pointer transition ${
                selectedAccount?.id === account.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold dark:text-white">{account.accountType}</h3>
                <span className={`px-2 py-1 rounded text-xs ${account.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                  {account.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{account.accountNumber}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">€{account.balance.toFixed(2)}</p>
            </div>
          ))}

          <div
            onClick={() => handleCreateAccount('CHECKING')}
            className="bg-blue-50 dark:bg-gray-800 border-2 border-dashed border-blue-300 dark:border-blue-700 p-6 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 transition flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-blue-600 dark:text-blue-400 font-semibold">+ Create Checking Account</p>
            </div>
          </div>

          <div
            onClick={() => handleCreateAccount('SAVINGS')}
            className="bg-purple-50 dark:bg-gray-800 border-2 border-dashed border-purple-300 dark:border-purple-700 p-6 rounded-lg cursor-pointer hover:bg-purple-100 dark:hover:bg-gray-700 transition flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-purple-600 dark:text-purple-400 font-semibold">+ Create Savings Account</p>
            </div>
          </div>
        </div>

        {selectedAccount && (
          <>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-bold dark:text-white mb-4">Quick Actions</h2>
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition-colors"
                >
                  💰 Deposit
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded transition-colors"
                >
                  💵 Withdraw
                </button>
                <button
                  onClick={() => setShowTransfer(!showTransfer)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
                >
                  💸 Transfer
                </button>
              </div>

              {showTransfer && (
                <form onSubmit={handleTransfer} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">To Account Number</label>
                    <input
                      type="text"
                      value={transferData.toAccountNumber}
                      onChange={(e) => setTransferData({ ...transferData, toAccountNumber: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium dark:text-gray-300 mb-1">Description (optional)</label>
                    <input
                      type="text"
                      value={transferData.description}
                      onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded"
                    />
                  </div>
                  <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded">
                    Send Transfer
                  </button>
                </form>
              )}
            </div>

{showAccountDetail && detailAccount && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold dark:text-white">Account Details</h3>
        <button
          onClick={() => setShowAccountDetail(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-2xl"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between py-2 border-b dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Account Type</span>
          <span className="font-medium dark:text-white">{detailAccount.accountType}</span>
        </div>
        <div className="flex justify-between py-2 border-b dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Account Number</span>
          <span className="font-medium dark:text-white">{detailAccount.accountNumber}</span>
        </div>
        <div className="flex justify-between py-2 border-b dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Balance</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">€{detailAccount.balance.toFixed(2)}</span>
        </div>
        <div className="flex justify-between py-2 border-b dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Status</span>
          <span className={`font-medium ${detailAccount.active ? 'text-green-600' : 'text-red-600'}`}>
            {detailAccount.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex justify-between py-2 border-b dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Created</span>
          <span className="font-medium dark:text-white">{new Date(detailAccount.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between py-2 border-b dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Total In</span>
          <span className="font-medium text-green-600">
            +€{transactions.filter(t => t.toAccountNumber === detailAccount.accountNumber).reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600 dark:text-gray-400">Total Out</span>
          <span className="font-medium text-red-600">
            -€{transactions.filter(t => t.fromAccountNumber === detailAccount.accountNumber).reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setShowAccountDetail(false)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
        >
          Close
        </button>
        {detailAccount.active && (
          <button
            onClick={async () => {
              if (window.confirm(`Are you sure you want to close account ${detailAccount.accountNumber}? Balance must be €0.00`)) {
                try {
                  await accountAPI.deactivateAccount(detailAccount.accountNumber);
                  toast.success('Account closed successfully');
                  setShowAccountDetail(false);
                  await loadAccounts();
                } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Failed to close account');
                }
              }
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
          >
            Close Account
          </button>
        )}
      </div>
          </div>
        </div>
      )}

            {showDepositModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold dark:text-white">Deposit Money</h3>
                    <button
                      onClick={() => {
                        setShowDepositModal(false);
                        setModalAmount('');
                        setModalDescription('');
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleDeposit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium dark:text-gray-300 mb-1">Amount (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={modalAmount}
                        onChange={(e) => setModalAmount(e.target.value)}
                        className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium dark:text-gray-300 mb-1">Description (optional)</label>
                      <input
                        type="text"
                        value={modalDescription}
                        onChange={(e) => setModalDescription(e.target.value)}
                        className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Salary, Gift"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDepositModal(false);
                          setModalAmount('');
                          setModalDescription('');
                        }}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg">
                        Deposit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showWithdrawModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold dark:text-white">Withdraw Money</h3>
                    <button
                      onClick={() => {
                        setShowWithdrawModal(false);
                        setModalAmount('');
                        setModalDescription('');
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded p-3 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Available Balance: <span className="font-bold">€{selectedAccount?.balance.toFixed(2)}</span>
                    </p>
                  </div>
                  <form onSubmit={handleWithdrawal} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium dark:text-gray-300 mb-1">Amount (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={selectedAccount?.balance}
                        value={modalAmount}
                        onChange={(e) => setModalAmount(e.target.value)}
                        className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium dark:text-gray-300 mb-1">Description (optional)</label>
                      <input
                        type="text"
                        value={modalDescription}
                        onChange={(e) => setModalDescription(e.target.value)}
                        className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="e.g., ATM Withdrawal, Cash"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowWithdrawModal(false);
                          setModalAmount('');
                          setModalDescription('');
                        }}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg">
                        Withdraw
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="mb-8">
              <TransactionChart transactions={transactions} currentAccountNumber={selectedAccount.accountNumber} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold dark:text-white">Transaction History</h2>
                <button
                  onClick={exportToPDF}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                >
                  📄 Export PDF
                </button>
              </div>

              <div className="mb-4 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterType('ALL')}
                      className={`px-4 py-2 rounded ${filterType === 'ALL' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterType('DEPOSIT')}
                      className={`px-4 py-2 rounded ${filterType === 'DEPOSIT' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      Deposits
                    </button>
                    <button
                      onClick={() => setFilterType('WITHDRAWAL')}
                      className={`px-4 py-2 rounded ${filterType === 'WITHDRAWAL' ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      Withdrawals
                    </button>
                    <button
                      onClick={() => setFilterType('TRANSFER')}
                      className={`px-4 py-2 rounded ${filterType === 'TRANSFER' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      Transfers
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterDateRange('7')}
                      className={`px-4 py-2 rounded ${filterDateRange === '7' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      Last 7 days
                    </button>
                    <button
                      onClick={() => setFilterDateRange('30')}
                      className={`px-4 py-2 rounded ${filterDateRange === '30' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      Last 30 days
                    </button>
                    <button
                      onClick={() => setFilterDateRange('ALL')}
                      className={`px-4 py-2 rounded ${filterDateRange === 'ALL' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      All time
                    </button>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Search by description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No transactions match your filters</p>
              ) : (
                <div className="space-y-2">
                  {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="border-b dark:border-gray-700 pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`font-semibold ${transaction.transactionType === 'DEPOSIT' ? 'text-green-600 dark:text-green-400' : transaction.transactionType === 'WITHDRAWAL' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                          {transaction.transactionType}
                        </span>
                        {transaction.category && (
                          <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                            {transaction.category}
                          </span>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-300">{transaction.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(transaction.createdAt).toLocaleString()}</p>
                        <select
                          value={transaction.category || ''}
                          onChange={async (e) => {
                            try {
                              await transactionAPI.updateCategory(transaction.id, e.target.value);
                              const response = await transactionAPI.getHistory(selectedAccount!.accountNumber);
                              setTransactions(response.data);
                            } catch (error) {
                              toast.error('Failed to update category');
                            }
                          }}
                          className="mt-1 text-xs border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1"
                        >
                          <option value="">No category</option>
                          <option value="Food">🍕 Food</option>
                          <option value="Transport">🚗 Transport</option>
                          <option value="Entertainment">🎬 Entertainment</option>
                          <option value="Shopping">🛍️ Shopping</option>
                          <option value="Health">💊 Health</option>
                          <option value="Salary">💼 Salary</option>
                          <option value="Rent">🏠 Rent</option>
                          <option value="Other">📦 Other</option>
                        </select>
                      </div>
                      <span className={`font-bold ${transaction.fromAccountNumber === selectedAccount.accountNumber ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
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
              export default App;
