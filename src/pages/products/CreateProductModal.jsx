import React, { useState } from 'react';
import { productService } from '../../api/services';
import { getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import './CreateProductModal.css';

const GST_RATES = [0, 5, 12, 18, 28];

const BILLING_TYPES = [
  {
    value: 'SIMPLE',
    title: 'Simple (Qty x Price)',
    desc: 'Normal items sold by piece/box/packet — e.g. groceries, electronics.',
    defaultUnit: 'PCS',
  },
  {
    value: 'DIMENSION',
    title: 'By Size (L x W)',
    desc: 'Sold by area — e.g. plywood, glass, marble, tiles. Rate is per sqft/sqm.',
    defaultUnit: 'SQFT',
  },
  {
    value: 'WEIGHT',
    title: 'By Weight',
    desc: 'Sold by weight — e.g. steel, cement, produce. Rate is per kg/ton.',
    defaultUnit: 'KG',
  },
];

const UNIT_OPTIONS = {
  SIMPLE: ['PCS', 'BOX', 'PKT', 'LTR', 'DOZEN'],
  DIMENSION: ['SQFT', 'SQM'],
  WEIGHT: ['KG', 'TON', 'GRAM'],
};

const PRICE_LABEL = {
  SIMPLE: 'Selling Price (per piece)',
  DIMENSION: 'Rate (per sqft/sqm)',
  WEIGHT: 'Rate (per kg/ton)',
};

export default function CreateProductModal({ isOpen, onClose, onSuccess, editData }) {
  const isEdit = !!editData;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: editData?.name || '',
    description: editData?.description || '',
    hsn: editData?.hsn || '',
    billingType: editData?.billingType || 'SIMPLE',
    unit: editData?.unit || 'PCS',
    sellingPrice: editData?.sellingPrice || '',
    purchasePrice: editData?.purchasePrice || '',
    gstRate: editData?.gstRate ?? 18,
    stockQuantity: editData?.stockQuantity || 0,
    lowStockThreshold: editData?.lowStockThreshold || 5,
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'number' ? value : value });
  };

  const selectBillingType = (value) => {
    const meta = BILLING_TYPES.find((b) => b.value === value);
    setForm({ ...form, billingType: value, unit: meta.defaultUnit });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        sellingPrice: Number(form.sellingPrice),
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : null,
        gstRate: Number(form.gstRate),
        stockQuantity: Number(form.stockQuantity) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
      };

      if (isEdit) {
        await productService.update(editData.id, payload);
        toast.success('Product updated successfully');
      } else {
        await productService.create(payload);
        toast.success('Product created successfully');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add New Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label className="form-label">How is this item billed? <span className="required">*</span></label>
          <div className="billing-type-group">
            {BILLING_TYPES.map((bt) => (
              <div
                key={bt.value}
                className={`billing-type-card ${form.billingType === bt.value ? 'active' : ''}`}
                onClick={() => selectBillingType(bt.value)}
              >
                <div className="bt-title">{bt.title}</div>
                <div className="bt-desc">{bt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Product Name <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Plywood 19mm BWP"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">HSN Code</label>
            <input
              type="text"
              name="hsn"
              className="form-input"
              placeholder="4412"
              value={form.hsn}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input
            type="text"
            name="description"
            className="form-input"
            placeholder="Product description"
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Unit</label>
            <select
              name="unit"
              className="form-select"
              value={form.unit}
              onChange={handleChange}
            >
              {UNIT_OPTIONS[form.billingType].map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">GST Rate</label>
            <select
              name="gstRate"
              className="form-select"
              value={form.gstRate}
              onChange={handleChange}
            >
              {GST_RATES.map((rate) => (
                <option key={rate} value={rate}>{rate}%</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{PRICE_LABEL[form.billingType]} <span className="required">*</span></label>
            <input
              type="number"
              name="sellingPrice"
              className="form-input"
              placeholder={form.billingType === 'SIMPLE' ? '150.00' : form.billingType === 'DIMENSION' ? '85.00' : '60.00'}
              value={form.sellingPrice}
              onChange={handleChange}
              step="0.01"
              required
            />
            {form.billingType === 'DIMENSION' && (
              <div className="price-hint">Amount = pieces × length × width × this rate</div>
            )}
            {form.billingType === 'WEIGHT' && (
              <div className="price-hint">Amount = weight × this rate</div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Price</label>
            <input
              type="number"
              name="purchasePrice"
              className="form-input"
              placeholder="110.00"
              value={form.purchasePrice}
              onChange={handleChange}
              step="0.01"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Stock Quantity</label>
            <input
              type="number"
              name="stockQuantity"
              className="form-input"
              placeholder="0"
              value={form.stockQuantity}
              onChange={handleChange}
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Low Stock Alert</label>
            <input
              type="number"
              name="lowStockThreshold"
              className="form-input"
              placeholder="5"
              value={form.lowStockThreshold}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}