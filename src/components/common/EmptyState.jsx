import React from 'react';
import './EmptyState.css';

export default function EmptyState({ 
  title = 'No data found',
  description = 'There are no records to display.',
  icon: Icon,
  action,
  className = '' 
}) {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && <Icon className="empty-state-icon" />}
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}