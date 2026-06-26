import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-center"><div className="spinner spinner-lg" /></div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-center"><div className="spinner spinner-lg" /></div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};