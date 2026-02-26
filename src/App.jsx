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
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
        <div className="bg-slate-800 p-8 rounded-xl shadow-lg shadow-purple-900/20 w-full max-w-sm border border-slate-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-purple-400 mb-2">MAITRI '26</h1>
            <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Staff Portal</p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Admin Password</label>
              <input
                type="password"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 text-lg rounded-lg transition-colors w-full uppercase tracking-wider"
            >
              Access Scanner
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <Scanner />;
}

export default App;
