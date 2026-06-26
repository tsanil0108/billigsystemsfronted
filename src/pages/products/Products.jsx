import React, { useState, useEffect, useMemo } from 'react';
import { productService } from '../../api/services';
import { formatINR, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import StatsCard from '../../components/common/StatsCard';
import CreateProductModal from './CreateProductModal';
import './Products.css';

// ─── Icons ──────────────────────────────────────────────────────
const TotalIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const LowStockIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const ValueIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>;
const OutOfStockIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.getAll();
      setProducts(res.data || []);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold).length;
    const outOfStock = products.filter((p) => !p.stockQuantity || p.stockQuantity <= 0).length;
    const inventoryValue = products.reduce((sum, p) => sum + Number(p.sellingPrice || 0) * Number(p.stockQuantity || 0), 0);
    return { total, lowStock, outOfStock, inventoryValue };
  }, [products]);

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearch = async (query) => {
    setSearch(query);
    if (query.trim()) {
      try {
        const res = await productService.search(query);
        setProducts(res.data || []);
      } catch (err) {
        toast.error(getErrorMsg(err));
      }
    } else {
      loadProducts();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.delete(id);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  const isLowStock = (product) => {
    return product.stockQuantity <= product.lowStockThreshold;
  };

  const BILLING_LABEL = { SIMPLE: 'Simple', DIMENSION: 'By Size', WEIGHT: 'By Weight' };
  const BILLING_COLOR = { SIMPLE: 'gray', DIMENSION: 'info', WEIGHT: 'warning' };

  const columns = [
    { key: 'name', label: 'Name', width: '160px' },
    { key: 'hsn', label: 'HSN', width: '100px' },
    {
      key: 'billingType',
      label: 'Billing Type',
      width: '110px',
      render: (row) => (
        <Badge color={BILLING_COLOR[row.billingType] || 'gray'}>
          {BILLING_LABEL[row.billingType] || 'Simple'}
        </Badge>
      )
    },
    { key: 'unit', label: 'Unit', width: '80px' },
    { 
      key: 'sellingPrice', 
      label: 'Rate',
      width: '120px',
      render: (row) => formatINR(row.sellingPrice)
    },
    { 
      key: 'gstRate', 
      label: 'GST',
      width: '80px',
      render: (row) => `${row.gstRate}%`
    },
    { 
      key: 'stockQuantity', 
      label: 'Stock',
      width: '100px',
      render: (row) => (
        <Badge color={isLowStock(row) ? 'danger' : 'success'}>
          {row.stockQuantity}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      render: (row) => (
        <div className="actions">
          <Button size="sm" variant="secondary" onClick={() => setEditingProduct(row)}>
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
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product inventory</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Add Product
        </Button>
      </div>

      <div className="stats-grid">
        <StatsCard label="Total Products" value={stats.total} icon={TotalIcon} color="primary" />
        <StatsCard label="Low Stock" value={stats.lowStock} icon={LowStockIcon} color="warning" />
        <StatsCard label="Out of Stock" value={stats.outOfStock} icon={OutOfStockIcon} color="danger" />
        <StatsCard label="Inventory Value" value={formatINR(stats.inventoryValue)} icon={ValueIcon} color="success" />
      </div>

      <Card>
        <div className="card-header">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search products..."
          />
        </div>
        <Table
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products found"
        />
      </Card>

      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadProducts}
        editData={null}
      />

      {editingProduct && (
        <CreateProductModal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          onSuccess={loadProducts}
          editData={editingProduct}
        />
      )}
    </div>
  );
}