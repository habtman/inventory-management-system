import { Outlet } from 'react-router-dom';
import Navbar from '../pages/Navbar';

export default function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Outlet />
    </div>
  );
}
