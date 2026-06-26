import React from 'react';
import './Card.css';

export default function Card({ 
  children, 
  title, 
  className = '',
  headerActions,
  noPadding = false,
  ...props 
}) {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || headerActions) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {headerActions && <div className="card-actions">{headerActions}</div>}
        </div>
      )}
      <div className={`card-body ${noPadding ? 'card-body-no-padding' : ''}`}>
        {children}
      </div>
    </div>
  );
}