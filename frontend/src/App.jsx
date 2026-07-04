import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import Upload from './Upload';
import Chat from './Chat';
import Report from './Report';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setViewInternal] = useState('login');
  const [viewParams, setViewParams] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Check session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      setViewInternal('dashboard');
    } else {
      setViewInternal('login');
    }
    setInitializing(false);
  }, []);

  const setView = (newView, params = null) => {
    setViewParams(params);
    setViewInternal(newView);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('login');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render Login directly without nav
  if (view === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0e12]">
      {/* Background neon glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-900/10 glow-overlay -z-10"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 glow-overlay -z-10"></div>

      {/* Navigation Header */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div 
          onClick={() => setView('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow shadow-purple-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="font-extrabold text-white text-md tracking-tight group-hover:text-purple-400 transition-colors">
            Insurance Copilot
          </span>
        </div>

        {/* Desktop nav links */}
        <nav className="flex items-center gap-1.5 sm:gap-4">
          <button
            onClick={() => setView('dashboard')}
            className={`text-xs px-3 py-2 rounded-lg font-medium cursor-pointer transition-all ${
              view === 'dashboard' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('upload', { activeTab: 'policy' })}
            className={`text-xs px-3 py-2 rounded-lg font-medium cursor-pointer transition-all ${
              view === 'upload' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Uploads
          </button>
          <button
            onClick={() => setView('chat')}
            className={`text-xs px-3 py-2 rounded-lg font-medium cursor-pointer transition-all ${
              view === 'chat' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ask RAG
          </button>
          <button
            onClick={() => setView('report')}
            className={`text-xs px-3 py-2 rounded-lg font-medium cursor-pointer transition-all ${
              view === 'report' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Analysis
          </button>
        </nav>

        {/* User avatar/logout */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono text-slate-300">
            U
          </div>
          <button
            onClick={handleLogout}
            className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main views rendering */}
      <main className="flex-1">
        {view === 'dashboard' && <Dashboard setView={setView} user={user} onLogout={handleLogout} />}
        {view === 'upload' && <Upload setView={setView} initialTab={viewParams?.activeTab || 'policy'} />}
        {view === 'chat' && <Chat setView={setView} />}
        {view === 'report' && <Report setView={setView} />}
      </main>
    </div>
  );
}
