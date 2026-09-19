import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext/AuthContext';

function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

