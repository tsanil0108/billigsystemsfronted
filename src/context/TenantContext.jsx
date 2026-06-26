import React, { createContext, useContext, useState, useEffect } from 'react';
import { tenantService, authService } from '../api/services';
import toast from 'react-hot-toast';
import { getErrorMsg } from '../utils/helpers';

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const loadTenant = async () => {
    setLoading(true);
    try {
      // Get current user from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      // Check if user is SUPER_ADMIN
      if (user?.role === 'SUPER_ADMIN') {
        setIsSuperAdmin(true);
        // For Super Admin, don't load tenant profile
        // Instead, load tenant list or show admin dashboard
        setTenant(null);
        setLoading(false);
        return;
      }

      // For normal users, load tenant profile
      const res = await tenantService.getProfile();
      setTenant(res.data);
      setIsSuperAdmin(false);
    } catch (err) {
      console.error('Failed to load tenant:', err);
      // If error, check if user is super admin
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.role === 'SUPER_ADMIN') {
        setIsSuperAdmin(true);
        setTenant(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenant();
  }, []);

  const updateTenant = async (data) => {
    try {
      const res = await tenantService.updateProfile(data);
      setTenant(res.data);
      toast.success('Profile updated successfully');
      return res.data;
    } catch (err) {
      toast.error(getErrorMsg(err));
      throw err;
    }
  };

  return (
    <TenantContext.Provider 
      value={{ 
        tenant, 
        loading, 
        loadTenant, 
        updateTenant,
        isSuperAdmin 
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};