import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceService } from '../../api/services';
import { formatINR, formatDate, getStatusColor, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import StatsCard from '../../components/common/StatsCard';
import Spinner from '../../components/common/Spinner';
import CreateInvoiceModal from './CreateInvoiceModal';
import './Invoices.css';

// Icons
const InvoiceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const PaidIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const PendingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const TotalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
  </svg>
);

export default function Invoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    revenue: 0,
  });

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getAll();
      const data = res.data || [];
      setInvoices(data);
      
      // Calculate stats
      const total = data.length;
      const paid = data.filter(i => i.paymentStatus === 'PAID');
      const pending = data.filter(i => i.paymentStatus === 'UNPAID' || i.paymentStatus === 'PARTIAL');
      const revenue = paid.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
      
      setStats({
        total,
        paid: paid.length,
        pending: pending.length,
        revenue,
      });
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleSearch = async (query) => {
    setSearch(query);
    if (query.trim()) {
      // Client-side search
      const filtered = invoices.filter(inv =>
        inv.invoiceNumber?.toLowerCase().includes(query.toLowerCase()) ||
        inv.customer?.name?.toLowerCase().includes(query.toLowerCase())
      );
      setInvoices(filtered);
    } else {
      loadInvoices();
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await invoiceService.markPaid(id, { paymentMode: 'CASH', amount: 0 });
      toast.success('Invoice marked as paid');
      loadInvoices();
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      await invoiceService.cancel(id);
      toast.success('Invoice cancelled');
      loadInvoices();
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowCreateModal(true);
  };

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice No.',
      render: (row) => (
        <span 
          className="invoice-number clickable"
          onClick={() => navigate(`/invoices/${row.id}`)}
        >
          {row.invoiceNumber}
        </span>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (row) => row.customer?.name || '—'
    },
    {
      key: 'invoiceDate',
      label: 'Date',
      render: (row) => formatDate(row.invoiceDate)
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (row) => formatDate(row.dueDate)
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (row) => <span className="amount">{formatINR(row.totalAmount)}</span>
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      render: (row) => (
        <div className="status-badges">
          <Badge color={getStatusColor(row.paymentStatus)}>
            {row.paymentStatus}
          </Badge>
          {row.status === 'CANCELLED' && (
            <Badge color="danger" size="sm">CANCELLED</Badge>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="actions">
          <Button 
            size="sm" 
            variant="secondary" 
            onClick={() => navigate(`/invoices/${row.id}`)}
          >
            View
          </Button>
          {row.status !== 'CANCELLED' && (
            <>
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => handleEdit(row)}
              >
                Edit
              </Button>
              {row.paymentStatus !== 'PAID' && (
                <Button 
                  size="sm" 
                  variant="success" 
                  onClick={() => handleMarkPaid(row.id)}
                >
                  Paid
                </Button>
              )}
              <Button 
                size="sm" 
                variant="danger" 
                onClick={() => handleCancel(row.id)}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  const filteredInvoices = search.trim() 
    ? invoices 
    : invoices;

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">Manage all your sales invoices</p>
        </div>
        <Button variant="primary" onClick={() => {
          setEditingInvoice(null);
          setShowCreateModal(true);
        }}>
          + Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatsCard
          label="Total Invoices"
          value={stats.total}
          icon={TotalIcon}
          color="primary"
        />
        <StatsCard
          label="Paid"
          value={stats.paid}
          icon={PaidIcon}
          color="success"
        />
        <StatsCard
          label="Pending"
          value={stats.pending}
          icon={PendingIcon}
          color="warning"
        />
        <StatsCard
          label="Total Revenue"
          value={formatINR(stats.revenue)}
          icon={InvoiceIcon}
          color="purple"
        />
      </div>

      {/* Invoices Table */}
      <Card>
        <div className="card-header">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by invoice no. or customer..."
          />
          <div className="card-actions">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={loadInvoices}
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : '↻ Refresh'}
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredInvoices}
            emptyMessage="No invoices found"
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingInvoice(null);
        }}
        onSuccess={loadInvoices}
        editData={editingInvoice}
      />
    </div>
  );
}