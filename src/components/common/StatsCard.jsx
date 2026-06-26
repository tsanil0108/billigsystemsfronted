import React from 'react';
import './StatsCard.css';

export default function StatsCard({ 
  label, 
  value, 
  icon: Icon,
  color = 'primary',
  change,
  className = '',
  ...props 
}) {
  const colors = {
    primary: { bg: '#EFF6FF', text: 'var(--primary)' },
    success: { bg: '#DCFCE7', text: 'var(--success)' },
    warning: { bg: '#FEF3C7', text: 'var(--warning)' },
    danger: { bg: '#FEE2E2', text: 'var(--danger)' },
    info: { bg: '#E0F2FE', text: 'var(--info)' },
    purple: { bg: '#EDE9FE', text: '#7C3AED' },
  };

  const colorStyle = colors[color] || colors.primary;

  return (
    <div className={`stats-card ${className}`} {...props}>
      <div className="stats-card-content">
        <div className="stats-card-label">{label}</div>
        <div className="stats-card-value">{value}</div>
        {change && (
          <div className={`stats-card-change ${change >= 0 ? 'up' : 'down'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
      {Icon && (
        <div 
          className="stats-card-icon"
          style={{ background: colorStyle.bg, color: colorStyle.text }}
        >
          <Icon />
        </div>
      )}
    </div>
  );
}