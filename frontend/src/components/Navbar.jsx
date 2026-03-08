import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-outline-variant px-8 py-3.5 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}>
        <div className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm border border-outline-variant p-1.5 transition-transform group-hover:scale-105 duration-300">
          <img src="/silicon-mango-logo.png" alt="Silicon Mango Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-lg font-semibold text-text-primary tracking-tight font-heading">
          English Practice
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-text-primary capitalize tracking-wide">
            {user?.role || 'Admin'}
          </span>
          <span className="text-2xl drop-shadow-sm">👨‍🎓</span>
        </div>
        <button onClick={handleLogout} className="btn bg-white border border-outline-variant shadow-sm text-sm py-2 px-5 font-bold hover:bg-slate-50 text-slate-700 hover:text-text-primary rounded-xl transition-all">
          Sign Out
        </button>
      </div>
    </nav>
  );
}
