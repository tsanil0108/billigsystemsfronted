import React from 'react';
import './Badge.css';

export default function Badge({ 
  children, 
  color = 'gray',
  size = 'md',
  className = '',
  ...props 
}) {
  return (
    <span className={`badge badge-${color} badge-${size} ${className}`} {...props}>
      {children}
    </span>
  );
}