import { logout } from '../utils/logout';
import { getUserFromToken } from '../utils/auth';

export default function Navbar() {
  const user = getUserFromToken();

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
      <div className="font-bold text-lg">
        Inventory System
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm opacity-90">
            Role: <strong>{user.role}</strong>
          </span>
        )}

        <button
          onClick={logout}
          className="bg-indigo-800 hover:bg-indigo-900 px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
