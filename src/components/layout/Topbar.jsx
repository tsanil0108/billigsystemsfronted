import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import './Topbar.css';  // ✅ CSS import sahi hai

export default function Topbar() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button 
          className="topbar-mobile-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="topbar-page-title">Dashboard</span>
      </div>

      <div className="topbar-right">
        <div className="topbar-user">
          <span className="topbar-user-name">{user?.fullName || 'User'}</span>
          <span className="topbar-user-avatar">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </span>
        </div>
      </div>
    </header>
  );
}