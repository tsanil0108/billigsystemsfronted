import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { dashboardService } from '../../api/services';
import { formatINR, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import StatsCard from '../../components/common/StatsCard';
import Spinner from '../../components/common/Spinner';
import './ProfitLoss.css';

// Icons
const IncomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);

const ExpenseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
    <polyline points="17 18 23 18 23 12"/>
  </svg>
);

const ProfitIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 12h8"/>
    <path d="M12 8v8"/>
  </svg>
);

const MarginIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
  </svg>
);

// Helper functions
const firstDayOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

const today = () => new Date().toISOString().split('T')[0];

export default function ProfitLoss() {
  const [from, setFrom] = useState(firstDayOfMonth());
  const [to, setTo] = useState(today());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getProfitLoss(from, to);
      setData(res.data);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (!data?.monthlyData) return [];
    return data.monthlyData.map((m) => ({
      month: m.month,
      revenue: Number(m.revenue || 0)
    }));
  }, [data]);

  const margin = data && Number(data.totalRevenue) > 0
    ? ((Number(data.grossProfit) / Number(data.totalRevenue)) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="profit-loss-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Profit & Loss Report</h1>
          <p className="page-subtitle">
            Revenue vs purchase cost, based on your real invoices &amp; stock-inward records
          </p>
        </div>
        <form
          className="pl-date-filter"
          onSubmit={(e) => { e.preventDefault(); loadReport(); }}
        >
          <input
            type="date"
            className="form-input"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span>to</span>
          <input
            type="date"
            className="form-input"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Apply</button>
        </form>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-center"><Spinner size="lg" /></div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-grid">
            <StatsCard
              label="Total Income"
              value={formatINR(data?.totalRevenue)}
              icon={IncomeIcon}
              color="success"
            />
            <StatsCard
              label="Total Purchases"
              value={formatINR(data?.totalPurchases)}
              icon={ExpenseIcon}
              color="danger"
            />
            <StatsCard
              label="Gross Profit"
              value={formatINR(data?.grossProfit)}
              icon={ProfitIcon}
              color="primary"
            />
            <StatsCard
              label="Gross Margin"
              value={`${margin}%`}
              icon={MarginIcon}
              color="purple"
            />
          </div>

          {/* Revenue Trend Chart */}
          <Card title="Revenue Trend">
            {chartData.length === 0 || chartData.every((d) => d.revenue === 0) ? (
              <div className="empty-state-text">No invoice data in this date range</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'var(--gray-500)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`}
                  />
                  <Tooltip
                    formatter={(v) => formatINR(v)}
                    contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Statement Table */}
          <Card title="Statement">
            <table className="table pl-statement-table">
              <tbody>
                <tr>
                  <td>Total Income (Sales from Invoices)</td>
                  <td className="text-right">{formatINR(data?.totalRevenue)}</td>
                </tr>
                <tr>
                  <td>Total Purchases (Stock Inward)</td>
                  <td className="text-right text-danger">-{formatINR(data?.totalPurchases)}</td>
                </tr>
                <tr className="pl-net-row">
                  <td>Gross Profit</td>
                  <td className="text-right">{formatINR(data?.grossProfit)}</td>
                </tr>
              </tbody>
            </table>
            <p className="pl-note">
              Note: this report reflects invoice revenue and stock-purchase cost only. Operating
              expenses (rent, salaries, utilities, etc.) aren't tracked in BillMaster yet — ask to add
              an Expenses module if you'd like a full net-profit breakdown.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}