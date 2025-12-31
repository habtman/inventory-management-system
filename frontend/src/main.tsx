import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StockTransfer from './pages/StockTransfer';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import AdminPage from './pages/AdminPage';




ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>

<Routes>
  <Route path="/login" element={<Login />} />

  <Route element={<ProtectedRoute />}>
    <Route element={<AppLayout />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/stock-transfer"
        element={<StockTransfer />}
      />
      <Route
        path="/admin"
        element={<AdminPage />}
      />
    </Route>
  </Route>
</Routes>

    </BrowserRouter>
  </React.StrictMode>
);
