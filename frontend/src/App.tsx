import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StockTransfer from './pages/StockTransfer';
import ProtectedRoute from './routes/ProtectedRoute';
import StockTable from './pages/StockTable';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
          <Route path="/stock/transfer" element={<StockTransfer />} />
        </Route>

        <Route element={<ProtectedRoute roles={['admin', 'manager']} />}>
          <Route path="/stock" element={<StockTable />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
