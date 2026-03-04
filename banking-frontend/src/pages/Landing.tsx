type Props = {
  onLogin: () => void;
  onRegister: () => void;
};

export default function Landing({ onLogin, onRegister }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      <div className="container mx-auto px-6 py-6 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">🏦 Banking App</h1>
        <div className="flex gap-3">
          <button onClick={onLogin} className="text-white border border-white px-5 py-2 rounded-lg hover:bg-white hover:text-blue-600 transition">Login</button>
          <button onClick={onRegister} className="bg-white text-blue-600 px-5 py-2 rounded-lg hover:bg-gray-100 transition font-semibold">Register</button>
        </div>
      </div>
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">Your Money, <br /><span className="text-yellow-300">Under Control</span></h2>
        <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">Manage your accounts, track transactions, and transfer money — all in one secure place.</p>
        <button onClick={onRegister} className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-10 py-4 rounded-lg text-lg transition">Get Started Free →</button>
      </div>
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[['💳','Multiple Accounts','Create checking and savings accounts to organize your finances.'],
            ['💸','Easy Transfers','Send money between accounts instantly and securely.'],
            ['📊','Transaction History','Track all your transactions and export them as PDF.']
          ].map(([icon, title, desc]) => (
            <div key={title} className="bg-white bg-opacity-10 rounded-xl p-6 text-center">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
              <p className="text-blue-100">{desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center text-blue-200 pb-8"><p>© 2026 Banking App. Secure & Reliable.</p></div>
    </div>
  );
}