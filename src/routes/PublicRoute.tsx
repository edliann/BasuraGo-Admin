import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext/AuthContext';

function PublicRoute() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;

