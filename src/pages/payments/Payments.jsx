import React, { useState, useEffect } from 'react';
import { paymentsService } from '../../api/services';  // ✅ Fixed: paymentsService
import { formatINR, formatDateLong, getStatusColor, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import './Payments.css';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentsService.getMyPayments();  // ✅ Fixed
      setPayments(res.data || []);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const columns = [
    { 
      key: 'amount', 
      label: 'Amount',
      render: (row) => <span className="amount">{formatINR(row.amount)}</span>
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => <Badge color={getStatusColor(row.status)}>{row.status}</Badge>
    },
    { 
      key: 'gatewayOrderId', 
      label: 'Order ID',
      render: (row) => row.gatewayOrderId || '—'
    },
    { 
      key: 'gatewayPaymentId', 
      label: 'Payment ID',
      render: (row) => row.gatewayPaymentId || '—'
    },
    { 
      key: 'createdAt', 
      label: 'Date',
      render: (row) => formatDateLong(row.createdAt)
    },
  ];

  return (
    <div className="payments-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Your payment history</p>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={payments}
          loading={loading}
          emptyMessage="No payments found"
        />
      </Card>
    </div>
  );
}