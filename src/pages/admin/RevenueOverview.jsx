import React from 'react';
import { formatINR } from '../../utils/helpers';
import StatsCard from '../../components/common/StatsCard';

// Icons
const MoneyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
const UsersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

export default function RevenueOverview({ revenue, loading }) {
  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  return (
    <div className="stats-grid">
      <StatsCard
        label="Total Revenue"
        value={formatINR(revenue?.totalRevenue || 0)}
        icon={MoneyIcon}
        color="success"
      />
      <StatsCard
        label="Total Tenants"
        value={revenue?.totalTenants || 0}
        icon={UsersIcon}
        color="primary"
      />
    </div>
  );
}