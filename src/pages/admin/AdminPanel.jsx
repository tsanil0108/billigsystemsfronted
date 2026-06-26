import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/services';
import { formatINR, formatDateLong, getStatusColor, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import StatsCard from '../../components/common/StatsCard';
import './AdminPanel.css';

export default function AdminPanel() {
  const [tenants, setTenants] = useState([]);
  const [payments, setPayments] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tenantsRes, paymentsRes, revenueRes] = await Promise.all([
        adminService.getTenants(),
        adminService.getPayments(),
        adminService.getRevenue(),
      ]);
      setTenants(tenantsRes.data || []);
      setPayments(paymentsRes.data || []);
      setRevenue(revenueRes.data);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSuspend = async (id) => {
    if (!window.confirm('Suspend this tenant?')) return;
    try {
      await adminService.suspendTenant(id);
      toast.success('Tenant suspended');
      loadData();
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  const handleActivate = async (id) => {
    try {
      await adminService.activateTenant(id);
      toast.success('Tenant activated');
      loadData();
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  const tenantColumns = [
    { key: 'companyName', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'planName', label: 'Plan', render: (row) => row.planName || '—' },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => <Badge color={getStatusColor(row.status)}>{row.status}</Badge>
    },
    { 
      key: 'totalRevenue', 
      label: 'Revenue',
      render: (row) => formatINR(row.totalRevenue)
    },
    { 
      key: 'subscriptionEndDate', 
      label: 'Expires',
      render: (row) => row.subscriptionEndDate ? formatDateLong(row.subscriptionEndDate) : '—'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="actions">
          {row.status === 'ACTIVE' ? (
            <Button size="sm" variant="danger" onClick={() => handleSuspend(row.tenantId)}>
              Suspend
            </Button>
          ) : (
            <Button size="sm" variant="success" onClick={() => handleActivate(row.tenantId)}>
              Activate
            </Button>
          )}
        </div>
      )
    }
  ];

  const paymentColumns = [
    { 
      key: 'amount', 
      label: 'Amount',
      render: (row) => formatINR(row.amount)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => <Badge color={getStatusColor(row.status)}>{row.status}</Badge>
    },
    { key: 'tenantId', label: 'Tenant ID' },
    { 
      key: 'createdAt', 
      label: 'Date',
      render: (row) => formatDateLong(row.createdAt)
    },
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="page-subtitle">Manage all tenants and platform revenue</p>
        </div>
      </div>

      {revenue && (
        <div className="stats-grid">
          <StatsCard
            label="Total Revenue"
            value={formatINR(revenue.totalRevenue)}
            color="success"
          />
          <StatsCard
            label="Total Tenants"
            value={revenue.totalTenants}
            color="primary"
          />
        </div>
      )}

      <Card title="All Tenants">
        <Table
          columns={tenantColumns}
          data={tenants}
          loading={loading}
          emptyMessage="No tenants found"
        />
      </Card>

      <Card title="All Payments">
        <Table
          columns={paymentColumns}
          data={payments}
          loading={loading}
          emptyMessage="No payments found"
        />
      </Card>
    </div>
  );
}