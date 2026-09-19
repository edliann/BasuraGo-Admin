import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext/AuthContext';

function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;