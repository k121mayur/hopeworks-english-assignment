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
    <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
          R
        </div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
          ReadAssess
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary-light font-medium capitalize">
          {user?.role}
        </span>
        <button onClick={handleLogout} className="btn btn-ghost text-xs py-1.5 px-3">
          Logout
        </button>
      </div>
    </nav>
  );
}
