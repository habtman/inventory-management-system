import { Navigate, Outlet } from 'react-router-dom';
import { hasRole, isAuthenticated, type UserRole } from '../utils/auth';

interface Props {
  roles?: UserRole[];
}

export default function ProtectedRoute({ roles }: Props) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
