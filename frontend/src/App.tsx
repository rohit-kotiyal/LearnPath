import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import { ToastProvider } from './components/hooks/useToast';
import Dashboard from './components/pages/Dashboard';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import Session from './components/pages/Session';
import NotFound from './components/pages/NotFound';
import Loading from './components/ui/Loading';
 
// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
 
  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }
 
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
 
  return <>{children}</>;
}
 
// Public Route wrapper (redirect if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
 
  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }
 
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
 
  return <>{children}</>;
}
 
function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
 
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
 
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/session/:id"
        element={
          <ProtectedRoute>
            <Session />
          </ProtectedRoute>
        }
      />
 
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
 
export default function App() {
  return (
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
  );
}