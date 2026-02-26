import { useState } from 'react';
import Scanner from './components/Scanner';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'maitri2026') {
      setIsAdmin(true);
      setError('');
    } else {
      setError('Incorrect Password');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 text-white p-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-900/30 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="bg-slate-900/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-700/50 relative z-10 transition-transform hover:scale-[1.01] duration-300">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2 tracking-tight">MAITRI '26</h1>
            <p className="text-slate-400 text-xs font-bold tracking-[0.2em] uppercase">Security Portal</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Admin Access Code</label>
              <input
                type="password"
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-4 px-5 text-white text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono tracking-widest placeholder:tracking-normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
                <p className="text-red-400 text-sm text-center font-medium">{error}</p>
              </div>
            )}
            <button
              type="submit"
              className="mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] active:scale-[0.98] w-full uppercase tracking-widest text-sm"
            >
              Initialize Scanner
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <Scanner />;
}

export default App;
