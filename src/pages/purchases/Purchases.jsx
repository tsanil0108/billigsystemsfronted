import React, { useState, useEffect, useMemo } from 'react';
import { purchasesService } from '../../api/services';  // ✅ Fixed: purchasesService
import { formatINR, formatDate, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import CreatePurchaseModal from './CreatePurchaseModal';
import './Purchases.css';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);

  // Filters
  const [searchVendor, setSearchVendor] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await purchasesService.getAll();  // ✅ Fixed
      setPurchases(res.data || []);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this purchase? Stock will be reversed.')) return;
    try {
      await purchasesService.delete(id);  // ✅ Fixed
      toast.success('Purchase deleted. Stock reversed.');
      loadData();
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  const clearFilters = () => {
    setSearchVendor('');
    setSearchProduct('');
    setFromDate('');
    setToDate('');
  };

  // Client-side filtering
  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const vendorMatch = !searchVendor ||
        (p.vendorName || '').toLowerCase().includes(searchVendor.toLowerCase());
      const productMatch = !searchProduct ||
        (p.product?.name || '').toLowerCase().includes(searchProduct.toLowerCase());
      const from = fromDate ? new Date(p.inwardDate) >= new Date(fromDate) : true;
      const to = toDate ? new Date(p.inwardDate) <= new Date(toDate) : true;
      return vendorMatch && productMatch && from && to;
    });
  }, [purchases, searchVendor, searchProduct, fromDate, toDate]);

  // Total of filtered
  const totalAmount = useMemo(() =>
    filtered.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0),
    [filtered]
  );

  const hasFilters = searchVendor || searchProduct || fromDate || toDate;

  const columns = [
    {
      key: 'product.name',
      label: 'Product',
      render: (row) => (
        <span className="product-name-cell">{row.product?.name || '—'}</span>
      )
    },
    { 
      key: 'quantity', 
      label: 'Qty',
      render: (row) => `${row.quantity} ${row.product?.unit || ''}`
    },
    {
      key: 'purchasePrice',
      label: 'Unit Price',
      render: (row) => formatINR(row.purchasePrice)
    },
    {
      key: 'totalAmount',
      label: 'Total',
      render: (row) => <strong>{formatINR(row.totalAmount)}</strong>
    },
    { 
      key: 'vendorName', 
      label: 'Vendor', 
      render: (row) => row.vendorName || '—' 
    },
    { 
      key: 'invoiceNumber', 
      label: 'Invoice No.', 
      render: (row) => row.invoiceNumber || '—' 
    },
    {
      key: 'inwardDate',
      label: 'Date',
      render: (row) => formatDate(row.inwardDate)
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      render: (row) => (
        <div className="actions">
          <Button size="sm" variant="secondary" onClick={() => setEditingPurchase(row)}>
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
    <div className="purchases-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Purchases</h1>
          <p className="page-subtitle">Manage stock inward / purchase entries</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Add Purchase
        </Button>
      </div>

      {/* ── Filters ── */}
      <Card className="filter-card">
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Search Product</label>
            <input
              type="text"
              className="form-input"
              placeholder="Product name..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Search Vendor</label>
            <input
              type="text"
              className="form-input"
              placeholder="Vendor name..."
              value={searchVendor}
              onChange={(e) => setSearchVendor(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">From Date</label>
            <input
              type="date"
              className="form-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">To Date</label>
            <input
              type="date"
              className="form-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          {hasFilters && (
            <div className="filter-group filter-clear">
              <label className="filter-label">&nbsp;</label>
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* Summary bar */}
        <div className="purchases-summary-bar">
          <span className="summary-count">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
            {hasFilters && ` (filtered from ${purchases.length})`}
          </span>
          <span className="summary-total">
            Total: <strong>{formatINR(totalAmount)}</strong>
          </span>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage={hasFilters ? 'No purchases match your filters' : 'No purchases found'}
        />
      </Card>

      {/* Add Modal */}
      <CreatePurchaseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />

      {/* Edit Modal */}
      {editingPurchase && (
        <CreatePurchaseModal
          isOpen={true}
          onClose={() => setEditingPurchase(null)}
          onSuccess={loadData}
          editData={editingPurchase}
        />
      )}
    </div>
  );
}