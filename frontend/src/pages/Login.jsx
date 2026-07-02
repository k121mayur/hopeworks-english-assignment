import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('api_url') || '');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(email, password);
      // Optional: Add a slight delay for animation before navigating
      setTimeout(() => {
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      }, 300);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const saveSettings = (e) => {
    e.preventDefault();
    const formattedUrl = apiUrl.trim();
    if (formattedUrl) {
      localStorage.setItem('api_url', formattedUrl);
    } else {
      localStorage.removeItem('api_url');
    }
    setShowSettings(false);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center relative overflow-hidden bg-surface-dim">
      {/* Premium Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[15%] w-[40rem] h-[40rem] rounded-full bg-blue-300/20 blur-[120px] mix-blend-multiply animate-float"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[50rem] h-[50rem] rounded-full bg-purple-300/20 blur-[150px] mix-blend-multiply animate-float" style={{ animationDelay: '2s', animationDuration: '20s' }}></div>
        <div className="absolute top-[40%] left-[60%] w-[30rem] h-[30rem] rounded-full bg-emerald-300/20 blur-[100px] mix-blend-multiply animate-float" style={{ animationDelay: '4s', animationDuration: '18s' }}></div>
      </div>

      {/* Main Login Card */}
      <div className="card-elevated glass px-6 sm:px-10 pb-10 sm:pb-12 pt-20 sm:pt-24 w-full max-w-lg z-10 animate-fade-in relative mt-16 sm:mt-20 shadow-2xl flex flex-col justify-center min-h-[400px] sm:min-h-[480px]">
        
        {/* Server Settings Icon */}
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-slate-100 transition-colors z-20 cursor-pointer text-lg"
          title="Server Configuration"
        >
          ⚙️
        </button>

        {/* Floating Logo Atop the Card exactly centered */}
        <div className="absolute -top-12 sm:-top-[4.5rem] left-1/2 -translate-x-1/2 w-24 h-24 sm:w-[9rem] sm:h-[9rem] bg-white rounded-full shadow-2xl border border-outline-variant p-4 sm:p-6 flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-2 duration-500 z-20 group">
          <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img src="/Mauli_Logo-removebg-preview.png" alt="Silicon Mango Logo" className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] relative z-10 transition-transform duration-700 ease-out group-hover:rotate-12 group-hover:scale-110" />
        </div>

        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight font-heading drop-shadow-sm pb-1 leading-tight">
            Welcome to English Playground
          </h1>
          <p className="text-sm sm:text-[16px] text-text-secondary mt-3 sm:mt-4 font-medium tracking-wide">
            Practice English with confidence
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
          {error && (
            <div className="p-4 rounded-xl bg-danger-container text-danger text-sm font-medium text-center border border-red-200 animate-fade-in mt-2 sm:mt-6">
              {error}
            </div>
          )}

          <div className="input-group mt-6 sm:mt-8">
            <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="input bg-white/70 focus:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-outline-variant placeholder-text-muted/60 transition-all duration-300"
              placeholder="student@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="block text-sm font-bold text-text-primary mb-2 tracking-wide" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input bg-white/70 focus:bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-outline-variant placeholder-text-muted/60 transition-all duration-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full  text-base sm:text-[17px] shadow-[0_8px_20px_-6px_rgba(15,23,42,0.4)] hover:shadow-[0_15px_30px_-8px_rgba(15,23,42,0.5)] hover:-translate-y-1 transition-all duration-300 font-bold tracking-widest text-white rounded-xl overflow-hidden relative group"
            disabled={loading}
            id="login-button"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10">
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : 'Sign In'}
            </span>
          </button>
        </form>
      </div>

      {/* Footer placed at the absolute bottom of the screen */}
      <div className="mt-auto pt-8 pb-4 w-full text-center text-xs sm:text-[13px] font-semibold tracking-wide text-text-muted z-10 animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
        <p>© {new Date().getFullYear()} | Developed by <a href="https://siliconmango.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 transition-colors">Silicon Mango</a> | All rights reserved.</p>
      </div>

      {/* Server Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="card-elevated p-6 bg-white max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold font-heading text-text-primary">Server Configuration</h3>
            <p className="text-sm text-text-secondary">
              Configure the API Server URL (useful for Android). Default is relative path <code className="bg-surface-dim px-1.5 py-0.5 rounded font-mono text-xs">/api</code>.
            </p>
            <form onSubmit={saveSettings} className="space-y-4">
              <div className="input-group">
                <label className="text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wider">Server URL</label>
                <input
                  className="input"
                  type="url"
                  placeholder="e.g. http://192.168.1.100:8000"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-text-muted">
                Leave empty to use the default server hosting this frontend application.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn btn-ghost" onClick={() => setShowSettings(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
