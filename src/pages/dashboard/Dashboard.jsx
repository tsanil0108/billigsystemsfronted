import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { invoiceService, customerService, productService } from '../../api/services';
import { formatINR, formatDate, getStatusColor } from '../../utils/helpers';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/common/StatsCard';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import './Dashboard.css';

// ─── Icons ──────────────────────────────────────────────────────
const SalesIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 7v10a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 17z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/></svg>;
const InvoiceIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const UsersIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ProductsIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const PlusInvoiceIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>;
const PlusUserIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>;
const PlusBoxIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const PaymentIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
const TenantIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const RevenueIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 7l-5-5-5 5M7 17l5 5 5-5"/></svg>;
const UsersActiveIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

const DONUT_COLORS = { Paid: '#16A34A', Pending: '#F59E0B', Overdue: '#DC2626' };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { tenant, isSuperAdmin } = useTenant();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // For Super Admin, don't load tenant-specific data
      if (isSuperAdmin) {
        setLoading(false);
        return;
      }

      const [invRes, custRes, prodRes] = await Promise.all([
        invoiceService.getAll(),
        customerService.getAll(),
        productService.getAll(),
      ]);
      setInvoices(invRes.data || []);
      setCustomers(custRes.data || []);
      setProducts(prodRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Derived stats (all from real invoices/customers/products data) ──
  const stats = useMemo(() => {
    const totalSales = invoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
    return {
      totalSales,
      totalInvoices: invoices.length,
      totalCustomers: customers.length,
      totalProducts: products.length,
    };
  }, [invoices, customers, products]);

  // ─── Sales Overview: last 6 months revenue ──
  const salesTrend = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-IN', { month: 'short' }), amount: 0 });
    }
    invoices.forEach((inv) => {
      if (!inv.invoiceDate) return;
      const d = new Date(inv.invoiceDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = months.find((m) => m.key === key);
      if (bucket) bucket.amount += Number(inv.totalAmount || 0);
    });
    return months;
  }, [invoices]);

  // ─── Invoice status donut ──
  const statusBreakdown = useMemo(() => {
    const today = new Date();
    let paid = 0, pending = 0, overdue = 0;
    invoices.forEach((inv) => {
      if (inv.paymentStatus === 'PAID') paid++;
      else if (inv.dueDate && new Date(inv.dueDate) < today) overdue++;
      else pending++;
    });
    return [
      { name: 'Paid', value: paid },
      { name: 'Pending', value: pending },
      { name: 'Overdue', value: overdue },
    ].filter((d) => d.value > 0);
  }, [invoices]);

  const recentInvoices = useMemo(
    () => [...invoices]
      .sort((a, b) => new Date(b.createdAt || b.invoiceDate) - new Date(a.createdAt || a.invoiceDate))
      .slice(0, 5),
    [invoices]
  );

  const totalInvoiceCount = statusBreakdown.reduce((s, d) => s + d.value, 0);

  if (loading) {
    return <div className="loading-center"><Spinner size="lg" /></div>;
  }

  // ─── SUPER ADMIN DASHBOARD ──────────────────────────────────────
  if (isSuperAdmin) {
    return (
      <div className="dashboard">
        <div className="page-header">
          <div>
            <p className="dashboard-welcome">Welcome back,</p>
            <h1 className="page-title dashboard-company">{user?.fullName || 'Super Admin'} 👋</h1>
            <p className="page-subtitle">Super Admin Dashboard - Manage all tenants</p>
          </div>
        </div>

        <div className="stats-grid">
          <StatsCard label="Total Tenants" value="0" icon={TenantIcon} color="primary" />
          <StatsCard label="Total Revenue" value="₹0" icon={RevenueIcon} color="success" />
          <StatsCard label="Active Users" value="0" icon={UsersActiveIcon} color="info" />
          <StatsCard label="Total Invoices" value="0" icon={InvoiceIcon} color="purple" />
        </div>

        <div className="dashboard-grid-2">
          <Card title="All Tenants" className="dashboard-recent-card">
            <div className="empty-state-text">Select a tenant to view details</div>
          </Card>

          <div className="dashboard-side-col">
            <Card title="Quick Actions">
              <div className="quick-actions-grid">
                <button className="quick-action" onClick={() => navigate('/admin')}>
                  <span className="quick-action-icon qa-purple"><UsersActiveIcon /></span>
                  Manage Tenants
                </button>
                <button className="quick-action" onClick={() => navigate('/admin/payments')}>
                  <span className="quick-action-icon qa-blue"><PaymentIcon /></span>
                  View Payments
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ─── NORMAL USER DASHBOARD ──────────────────────────────────────
  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <p className="dashboard-welcome">Welcome back,</p>
          <h1 className="page-title dashboard-company">{tenant?.companyName || 'Your Business'} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your business today.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard label="Total Sales" value={formatINR(stats.totalSales)} icon={SalesIcon} color="primary" />
        <StatsCard label="Total Invoices" value={stats.totalInvoices} icon={InvoiceIcon} color="success" />
        <StatsCard label="Total Customers" value={stats.totalCustomers} icon={UsersIcon} color="purple" />
        <StatsCard label="Total Products" value={stats.totalProducts} icon={ProductsIcon} color="warning" />
      </div>

      <div className="dashboard-grid">
        <Card title="Sales Overview" className="dashboard-chart-card">
          {salesTrend.every((m) => m.amount === 0) ? (
            <div className="empty-state-text">No invoices yet — create one to see trends here</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--gray-500)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--gray-500)' }} axisLine={false} tickLine={false}
                       tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`} />
                <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }} />
                <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2.5} fill="url(#salesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Invoice Status" className="dashboard-donut-card">
          {totalInvoiceCount === 0 ? (
            <div className="empty-state-text">No invoices yet</div>
          ) : (
            <div className="donut-wrapper">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={DONUT_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-legend">
                {statusBreakdown.map((d) => (
                  <div key={d.name} className="donut-legend-row">
                    <span className="donut-dot" style={{ background: DONUT_COLORS[d.name] }} />
                    <span className="donut-legend-label">{d.name}</span>
                    <span className="donut-legend-value">{d.value} ({((d.value / totalInvoiceCount) * 100).toFixed(1)}%)</span>
                  </div>
                ))}
                <div className="donut-total">Total: {totalInvoiceCount} Invoices</div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="dashboard-grid-2">
        <Card title="Recent Invoices" className="dashboard-recent-card" headerActions={
          <span className="card-link" onClick={() => navigate('/invoices')}>View All Invoices →</span>
        }>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr><td colSpan={5} className="empty-state-text">No invoices found</td></tr>
                ) : (
                  recentInvoices.map((inv) => (
                    <tr key={inv.id} className="clickable-row" onClick={() => navigate(`/invoices/${inv.id}`)}>
                      <td className="invoice-number">{inv.invoiceNumber}</td>
                      <td>{inv.customer?.name || '—'}</td>
                      <td>{formatDate(inv.invoiceDate)}</td>
                      <td className="amount">{formatINR(inv.totalAmount)}</td>
                      <td><Badge color={getStatusColor(inv.paymentStatus)}>{inv.paymentStatus}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="dashboard-side-col">
          <Card title="Quick Actions">
            <div className="quick-actions-grid">
              <button className="quick-action" onClick={() => navigate('/invoices')}>
                <span className="quick-action-icon qa-blue"><PlusInvoiceIcon /></span>
                Create Invoice
              </button>
              <button className="quick-action" onClick={() => navigate('/customers')}>
                <span className="quick-action-icon qa-green"><PlusUserIcon /></span>
                Add Customer
              </button>
              <button className="quick-action" onClick={() => navigate('/products')}>
                <span className="quick-action-icon qa-orange"><PlusBoxIcon /></span>
                Add Product
              </button>
              <button className="quick-action" onClick={() => navigate('/payments')}>
                <span className="quick-action-icon qa-purple"><PaymentIcon /></span>
                View Payments
              </button>
            </div>
          </Card>

          <Card title="Recent Activity">
            <div className="activity-feed">
              {recentInvoices.length === 0 ? (
                <div className="empty-state-text">No activity yet</div>
              ) : (
                recentInvoices.map((inv) => (
                  <div key={inv.id} className="activity-row">
                    <span className="activity-dot" />
                    <div className="activity-text">
                      <div>
                        Invoice <strong>#{inv.invoiceNumber}</strong> created for {inv.customer?.name || 'customer'}
                      </div>
                      <div className="activity-time">{timeAgo(inv.createdAt)}</div>
                    </div>
                    <div className="activity-amount">{formatINR(inv.totalAmount)}</div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}