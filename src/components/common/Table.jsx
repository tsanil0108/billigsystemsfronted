import React from 'react';
import './Table.css';

export default function Table({ 
  columns, 
  data, 
  keyField = 'id',
  loading = false,
  emptyMessage = 'No data found',
  className = '',
  ...props 
}) {
  if (loading) {
    return (
      <div className="table-wrapper">
        <div className="loading-center">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-wrapper">
        <div className="empty-state">
          <p className="empty-state-text">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className={`table ${className}`} {...props}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={col.width ? { minWidth: col.width } : {}}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row[keyField] || idx}>
              {columns.map((col, colIdx) => (
                <td key={colIdx}>
                  {col.render ? col.render(row, idx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}