import React from 'react';
import { formatINR, formatDateLong, getStatusColor } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';

export default function TenantsList({ tenants, onSuspend, onActivate, loading }) {
  const columns = [
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
          {row.status === 'ACTIVE' || row.status === 'TRIAL' ? (
            <Button size="sm" variant="danger" onClick={() => onSuspend(row.tenantId)}>
              Suspend
            </Button>
          ) : (
            <Button size="sm" variant="success" onClick={() => onActivate(row.tenantId)}>
              Activate
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={tenants}
      loading={loading}
      emptyMessage="No tenants found"
    />
  );
}