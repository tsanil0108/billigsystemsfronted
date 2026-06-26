import React, { useState, useEffect, useMemo } from 'react';
import { customerService, invoiceService } from '../../api/services';
import { formatDate, formatINR, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import StatsCard from '../../components/common/StatsCard';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import CreateCustomerModal from './CreateCustomerModal';
import './Customers.css';

// ─── Icons ──────────────────────────────────────────────────────
const TotalIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ActiveIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const InactiveIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
const ReceivableIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const [custRes, invRes] = await Promise.all([
        customerService.getAll(),
        invoiceService.getAll().catch(() => ({ data: [] })),
      ]);
      setCustomers(custRes.data || []);
      setInvoices(invRes.data || []);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.active !== false).length;
    const inactive = total - active;
    const receivable = invoices
      .filter((i) => i.paymentStatus !== 'PAID')
      .reduce((sum, i) => sum + (Number(i.totalAmount || 0) - Number(i.paidAmount || 0)), 0);
    return { total, active, inactive, receivable };
  }, [customers, invoices]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = async (query) => {
    setSearch(query);
    if (query.trim()) {
      try {
        const res = await customerService.search(query);
        setCustomers(res.data || []);
      } catch (err) {
        toast.error(getErrorMsg(err));
      }
    } else {
      loadCustomers();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerService.delete(id);
      toast.success('Customer deleted successfully');
      loadCustomers();
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  const columns = [
    { key: 'name', label: 'Name', width: '160px' },
    { key: 'email', label: 'Email', width: '200px' },
    { key: 'phone', label: 'Phone', width: '120px' },
    { 
      key: 'gstNumber', 
      label: 'GST',
      width: '140px',
      render: (row) => row.gstNumber || '—'
    },
    { 
      key: 'createdAt', 
      label: 'Added',
      width: '120px',
      render: (row) => formatDate(row.createdAt)
    },
    {
      key: 'active',
      label: 'Status',
      width: '90px',
      render: (row) => (
        <Badge color={row.active !== false ? 'success' : 'gray'}>
          {row.active !== false ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      render: (row) => (
        <div className="actions">
          <Button size="sm" variant="secondary" onClick={() => setEditingCustomer(row)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.id)}>
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your customer database</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Add Customer
        </Button>
      </div>

      <div className="stats-grid">
        <StatsCard label="Total Customers" value={stats.total} icon={TotalIcon} color="purple" />
        <StatsCard label="Active Customers" value={stats.active} icon={ActiveIcon} color="success" />
        <StatsCard label="Inactive Customers" value={stats.inactive} icon={InactiveIcon} color="danger" />
        <StatsCard label="Total Receivable" value={formatINR(stats.receivable)} icon={ReceivableIcon} color="warning" />
      </div>

      <Card>
        <div className="card-header">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search customers..."
          />
        </div>
        <Table
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="No customers found"
        />
      </Card>

      <CreateCustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadCustomers}
        editData={null}
      />

      {editingCustomer && (
        <CreateCustomerModal
          isOpen={true}
          onClose={() => setEditingCustomer(null)}
          onSuccess={loadCustomers}
          editData={editingCustomer}
        />
      )}
    </div>
  );
}