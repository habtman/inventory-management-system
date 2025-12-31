import Navbar from '../pages/Navbar';
import { getUserFromToken } from '../utils/auth';

export default function Dashboard() {
  const user = getUserFromToken();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">
          Dashboard
        </h1>

        <div className="bg-white p-4 rounded shadow">
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
      </div>
    </div>
  );
}
