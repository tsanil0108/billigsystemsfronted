import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layout
import Layout from '../components/layout/Layout';

// Auth Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Main Pages
import Dashboard from '../pages/dashboard/Dashboard';
import Customers from '../pages/customers/Customers';
import Products from '../pages/products/Products';
import Invoices from '../pages/invoices/Invoices';
import InvoiceDetail from '../pages/invoices/InvoiceDetail';
import Purchases from '../pages/purchases/Purchases';
import GSTReports from '../pages/gst/GSTReports';
import Payments from '../pages/payments/Payments';
import ProfitLoss from '../pages/reports/ProfitLoss';
import Settings from '../pages/settings/Settings';
import Subscription from '../pages/subscription/Subscription';
import AdminPanel from '../pages/admin/AdminPanel';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes - No Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes - With Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<Products />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="gst" element={<GSTReports />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports/profit-loss" element={<ProfitLoss />} />
        <Route path="settings" element={<Settings />} />
        <Route path="subscription" element={<Subscription />} />
        
        {/* Admin Route */}
        <Route path="admin" element={
          <AdminRoute>
            <AdminPanel />
          </AdminRoute>
        } />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}