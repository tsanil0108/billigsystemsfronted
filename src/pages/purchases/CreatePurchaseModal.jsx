import React, { useState, useEffect } from 'react';
import { purchasesService, productService } from '../../api/services';  // ✅ Fixed: purchasesService
import { formatINR, todayISO, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import './CreatePurchaseModal.css';

export default function CreatePurchaseModal({ isOpen, onClose, onSuccess, editData }) {
  const isEdit = !!editData;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    productId: '',
    quantity: 1,
    purchasePrice: '',
    vendorName: '',
    invoiceNumber: '',
    inwardDate: todayISO(),
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      if (isEdit && editData) {
        loadEditData();
      }
    }
  }, [isOpen, editData]);

  const loadProducts = async () => {
    try {
      const res = await productService.getAll();
      setProducts(res.data || []);
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  const loadEditData = () => {
    if (!editData) return;
    
    setForm({
      productId: editData.product?.id || '',
      quantity: editData.quantity || 1,
      purchasePrice: editData.purchasePrice || '',
      vendorName: editData.vendorName || '',
      invoiceNumber: editData.invoiceNumber || '',
      inwardDate: editData.inwardDate || todayISO(),
      notes: editData.notes || '',
    });
  };

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;

    // Jab product select ho, purchase price auto-fill karo
    if (e.target.name === 'productId') {
      const selected = products.find(p => p.id === Number(value));
      setForm({
        ...form,
        productId: value,
        purchasePrice: selected?.purchasePrice || '',
      });
      return;
    }

    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.productId) {
      toast.error('Please select a product');
      return;
    }
    if (!form.quantity || form.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (!form.purchasePrice || form.purchasePrice <= 0) {
      toast.error('Purchase price must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productId: Number(form.productId),
        quantity: Number(form.quantity),
        purchasePrice: parseFloat(form.purchasePrice),
        vendorName: form.vendorName,
        invoiceNumber: form.invoiceNumber,
        inwardDate: form.inwardDate,
        notes: form.notes,
      };

      if (isEdit) {
        await purchasesService.update(editData.id, payload);  // ✅ Fixed
        toast.success('Purchase updated successfully!');
      } else {
        await purchasesService.create(payload);  // ✅ Fixed
        toast.success('Purchase added successfully! Stock updated.');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      productId: '',
      quantity: 1,
      purchasePrice: '',
      vendorName: '',
      invoiceNumber: '',
      inwardDate: todayISO(),
      notes: '',
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get selected product details for display
  const selectedProduct = products.find(p => p.id === Number(form.productId));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Purchase' : 'Add Purchase / Stock Inward'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="purchase-form">
          {/* Product Selection */}
          <div className="form-group">
            <label className="form-label">Product <span className="required">*</span></label>
            <select
              name="productId"
              className="form-select"
              value={form.productId}
              onChange={handleChange}
              required
            >
              <option value="">Select product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current Stock: {p.stockQuantity || 0} {p.unit || 'units'})
                </option>
              ))}
            </select>
          </div>

          {/* Product Info Display */}
          {selectedProduct && (
            <div className="product-info-box">
              <div className="product-info-grid">
                <div className="product-info-item">
                  <span className="product-info-label">HSN Code</span>
                  <span className="product-info-value">{selectedProduct.hsn || '—'}</span>
                </div>
                <div className="product-info-item">
                  <span className="product-info-label">Unit</span>
                  <span className="product-info-value">{selectedProduct.unit || '—'}</span>
                </div>
                <div className="product-info-item">
                  <span className="product-info-label">Current Stock</span>
                  <span className="product-info-value" style={{ 
                    color: (selectedProduct.stockQuantity || 0) <= (selectedProduct.lowStockThreshold || 5) 
                      ? 'var(--danger)' 
                      : 'var(--success)'
                  }}>
                    {selectedProduct.stockQuantity || 0} {selectedProduct.unit || 'units'}
                  </span>
                </div>
                <div className="product-info-item">
                  <span className="product-info-label">Selling Price</span>
                  <span className="product-info-value">{formatINR(selectedProduct.sellingPrice)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quantity & Price */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity <span className="required">*</span></label>
              <input
                type="number"
                name="quantity"
                className="form-input"
                min="1"
                step="1"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={handleChange}
                required
              />
              {selectedProduct && (
                <span className="form-hint">
                  After purchase: {(selectedProduct.stockQuantity || 0) + Number(form.quantity || 0)} units
                </span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Price (₹) <span className="required">*</span></label>
              <input
                type="number"
                name="purchasePrice"
                className="form-input"
                min="0.01"
                step="0.01"
                placeholder="Enter purchase price"
                value={form.purchasePrice}
                onChange={handleChange}
                required
              />
              {selectedProduct && form.purchasePrice && (
                <span className="form-hint">
                  Total: {formatINR(Number(form.purchasePrice) * Number(form.quantity || 0))}
                </span>
              )}
            </div>
          </div>

          {/* Vendor Details */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Vendor Name</label>
              <input
                type="text"
                name="vendorName"
                className="form-input"
                placeholder="Enter vendor name"
                value={form.vendorName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor Invoice No.</label>
              <input
                type="text"
                name="invoiceNumber"
                className="form-input"
                placeholder="VEND-INV-001"
                value={form.invoiceNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Purchase Date</label>
            <input
              type="date"
              name="inwardDate"
              className="form-input"
              value={form.inwardDate}
              onChange={handleChange}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              className="form-textarea"
              placeholder="Additional notes about this purchase..."
              value={form.notes}
              onChange={handleChange}
              rows="2"
            />
          </div>

          {/* Summary */}
          {selectedProduct && form.quantity && form.purchasePrice && (
            <div className="purchase-summary">
              <h4>Purchase Summary</h4>
              <div className="summary-row">
                <span>Product</span>
                <span>{selectedProduct.name}</span>
              </div>
              <div className="summary-row">
                <span>Quantity</span>
                <span>{form.quantity} {selectedProduct.unit || 'units'}</span>
              </div>
              <div className="summary-row">
                <span>Unit Price</span>
                <span>{formatINR(form.purchasePrice)}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount</span>
                <span>{formatINR(Number(form.purchasePrice) * Number(form.quantity))}</span>
              </div>
              <div className="summary-row stock-after">
                <span>Stock After Purchase</span>
                <span style={{ 
                  fontWeight: 600,
                  color: ((selectedProduct.stockQuantity || 0) + Number(form.quantity)) <= (selectedProduct.lowStockThreshold || 5)
                    ? 'var(--danger)'
                    : 'var(--success)'
                }}>
                  {(selectedProduct.stockQuantity || 0) + Number(form.quantity)} {selectedProduct.unit || 'units'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? 'Update Purchase' : 'Add Purchase'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}