import React from 'react';
import './Button.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  type = 'button',
  onClick,
  ...props 
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="spinner-sm" />
      ) : (
        <>
          {Icon && <Icon className="btn-icon-svg" />}
          {children}
        </>
      )}
    </button>
  );
}