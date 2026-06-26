import React from 'react';
import Card from '../../../components/common/Card';
import './ProfitLossChart.css';

export default function ProfitLossChart({ data, loading }) {
  if (loading) {
    return (
      <Card title="Profit & Loss">
        <div className="loading-center"><div className="spinner" /></div>
      </Card>
    );
  }

  if (!data || !data.monthlyData || data.monthlyData.length === 0) {
    return (
      <Card title="Profit & Loss">
        <div className="empty-state">No data available</div>
      </Card>
    );
  }

  const maxValue = Math.max(...data.monthlyData.map(d => Number(d.revenue || 0)));

  return (
    <Card title="Profit & Loss">
      <div className="chart-container">
        <div className="chart-bars">
          {data.monthlyData.map((item, index) => {
            const height = maxValue > 0 ? (Number(item.revenue || 0) / maxValue) * 200 : 0;
            return (
              <div key={index} className="chart-bar-wrapper">
                <div className="chart-bar" style={{ height: `${Math.max(height, 10)}px` }}>
                  <span className="chart-bar-value">₹{Number(item.revenue || 0).toLocaleString()}</span>
                </div>
                <span className="chart-bar-label">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}