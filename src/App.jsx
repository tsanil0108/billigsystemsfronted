import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import './styles/variables.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TenantProvider>  {/* ✅ Make sure TenantProvider wraps everything */}
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--surface)',
                  color: 'var(--gray-900)',
                  border: '1px solid var(--border)',
                },
              }}
            />
          </BrowserRouter>
        </TenantProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;