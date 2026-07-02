import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}

export default function App() {
  const { token, role } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}
