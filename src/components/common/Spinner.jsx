import React from 'react';
import './Spinner.css';

export default function Spinner({ size = 'md', className = '' }) {
  return <div className={`spinner spinner-${size} ${className}`} />;
}