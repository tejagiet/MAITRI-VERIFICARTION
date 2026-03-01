import { useState } from 'react';
import Scanner from './components/Scanner';
import ObserverDashboard from './components/ObserverDashboard';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState('login');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'maitri2026') {
      setIsAdmin(true);
      setView('scanner');
      setError('');
    } else {
      setError('Incorrect Password');
    }
  };

  if (view === 'observer') {
    return <ObserverDashboard onExit={() => setView('login')} />;
  }

  if (view === 'login' || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-950 text-white p-6 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-900/30 rounded-full blur-[100px] pointer-events-none md:w-[600px] md:h-[600px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-[100px] pointer-events-none md:w-[600px] md:h-[600px]"></div>

        <div className="bg-slate-900/80 backdrop-blur-xl p-10 md:p-14 rounded-3xl shadow-2xl w-full max-w-sm md:max-w-md border border-slate-700/50 relative z-10 transition-transform hover:scale-[1.01] duration-300">
          <div className="text-center mb-10 md:mb-12 flex flex-col items-center">
            <div className="w-24 h-24 md:w-32 md:h-32 mb-4 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.3)] border border-purple-500/20 bg-slate-950 p-1">
              <img src="/logo.png" alt="Maitri Gate" className="w-full h-full object-cover rounded-2xl mix-blend-screen" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2 tracking-tight">MAITRI '26</h1>
            <p className="text-slate-400 text-xs md:text-sm font-bold tracking-[0.2em] uppercase">Security Portal</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6 md:gap-8">
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Admin Access Code</label>
              <input
                type="password"
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-4 flex-1 px-5 text-white text-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all font-mono tracking-widest placeholder:tracking-normal md:text-xl md:py-5"
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

          <div className="mt-8 text-center pt-6 border-t border-slate-800">
            <button onClick={() => setView('observer')} className="text-slate-500 text-xs font-bold uppercase tracking-wider hover:text-slate-300 transition-colors">
              Go to Observer Dashboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] relative">
      <Scanner />
      <button
        onClick={() => setView('observer')}
        className="absolute bottom-6 right-6 z-50 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 py-2.5 px-5 rounded-full font-bold text-xs uppercase tracking-wider text-slate-300 transition-all border border-slate-700 shadow-xl"
      >
        Observer Dash
      </button>
    </div>
  );
}

export default App;
