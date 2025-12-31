import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

export default function PublicRoute() {
  // If already logged in → kick out of login/register pages
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
