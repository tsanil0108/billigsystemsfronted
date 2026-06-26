import React, { useState, useEffect } from 'react';
import { invoiceService, customerService, productService } from '../../api/services';
import { formatINR, todayISO, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import './CreateInvoiceModal.css';

const PAYMENT_MODES = ['CASH', 'UPI', 'BANK_TRANSFER', 'CARD', 'CHEQUE'];

const emptyItem = () => ({
  productId: '',
  billingType: 'SIMPLE',
  unit: '',
  quantity: 1,
  length: '',
  width: '',
  weight: '',
  unitPrice: '',
  discountPercent: 0,
});

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerId: '',
    invoiceDate: todayISO(),
    dueDate: '',
    paymentMode: 'UPI',
    notes: '',
  });
  const [items, setItems] = useState([emptyItem()]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setItems([emptyItem()]);
      setForm((f) => ({ ...f, invoiceDate: todayISO() }));
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        customerService.getAll(),
        productService.getAll(),
      ]);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  const setItem = (index, key, value) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };

    // When product changes, snapshot its billingType/unit/price and reset type-specific fields
    if (key === 'productId') {
      const product = products.find((p) => p.id === Number(value));
      if (product) {
        newItems[index].billingType = product.billingType || 'SIMPLE';
        newItems[index].unit = product.unit || '';
        newItems[index].unitPrice = product.sellingPrice;
        newItems[index].length = '';
        newItems[index].width = '';
        newItems[index].weight = '';
        newItems[index].quantity = 1;
      }
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, emptyItem()]);

  const removeItem = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const calcLine = (item) => {
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discountPercent) || 0;
    const product = products.find((p) => p.id === Number(item.productId));
    const gstRate = product?.gstRate || 0;

    let lineAmt = 0;
    if (item.billingType === 'DIMENSION') {
      const qty = Number(item.quantity) || 0;
      const len = Number(item.length) || 0;
      const wid = Number(item.width) || 0;
      lineAmt = qty * len * wid * price;
    } else if (item.billingType === 'WEIGHT') {
      const wt = Number(item.weight) || 0;
      lineAmt = wt * price;
    } else {
      const qty = Number(item.quantity) || 0;
      lineAmt = qty * price;
    }

    const discAmt = lineAmt * disc / 100;
    const taxable = lineAmt - discAmt;
    const gstAmt = taxable * gstRate / 100;

    return { lineAmt, discAmt, taxable, gstAmt, total: taxable + gstAmt };
  };

  const subtotal = items.reduce((sum, it) => sum + calcLine(it).lineAmt, 0);
  const totalDisc = items.reduce((sum, it) => sum + calcLine(it).discAmt, 0);
  const totalGst = items.reduce((sum, it) => sum + calcLine(it).gstAmt, 0);
  const grandTotal = subtotal - totalDisc + totalGst;

  const validateItems = () => {
    for (const it of items) {
      if (!it.productId) return 'Please select a product for all items';
      if (it.billingType === 'DIMENSION' && (!it.length || !it.width)) {
        const p = products.find((p) => p.id === Number(it.productId));
        return `Enter length & width for "${p?.name || 'item'}"`;
      }
      if (it.billingType === 'WEIGHT' && !it.weight) {
        const p = products.find((p) => p.id === Number(it.productId));
        return `Enter weight for "${p?.name || 'item'}"`;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId) {
      toast.error('Please select a customer');
      return;
    }
    const err = validateItems();
    if (err) {
      toast.error(err);
      return;
    }

    setLoading(true);
    try {
      await invoiceService.create({
        customerId: Number(form.customerId),
        invoiceDate: form.invoiceDate,
        dueDate: form.dueDate || null,
        paymentMode: form.paymentMode,
        notes: form.notes,
        items: items.map((it) => ({
          productId: Number(it.productId),
          quantity: Number(it.quantity) || 1,
          length: it.billingType === 'DIMENSION' ? Number(it.length) : undefined,
          width: it.billingType === 'DIMENSION' ? Number(it.width) : undefined,
          weight: it.billingType === 'WEIGHT' ? Number(it.weight) : undefined,
          unitPrice: Number(it.unitPrice) || undefined,
          discountPercent: Number(it.discountPercent) || 0,
        })),
      });
      toast.success('Invoice created successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Invoice" size="xl">
      <form onSubmit={handleSubmit}>
        <div className="invoice-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Customer <span className="required">*</span></label>
              <select
                className="form-select"
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                required
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Mode</label>
              <select
                className="form-select"
                value={form.paymentMode}
                onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
              >
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Invoice Date</label>
              <input
                type="date"
                className="form-input"
                value={form.invoiceDate}
                onChange={(e) => setForm({ ...form, invoiceDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="items-section">
            <div className="items-header">
              <label className="form-label">Products / Items</label>
              <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                + Add Item
              </Button>
            </div>

            <div className="table-wrapper">
              <table className="table items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style={{ width: '170px' }}>Quantity / Size</th>
                    <th style={{ width: '100px' }}>Rate</th>
                    <th style={{ width: '80px' }}>Disc %</th>
                    <th style={{ width: '100px' }}>Amount</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, index) => {
                    const { total } = calcLine(it);
                    return (
                      <tr key={index}>
                        <td>
                          <select
                            className="form-select"
                            value={it.productId}
                            onChange={(e) => setItem(index, 'productId', e.target.value)}
                            required
                          >
                            <option value="">Select</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </td>

                        <td>
                          {it.billingType === 'DIMENSION' && (
                            <div className="dim-inputs">
                              <input
                                type="number" className="form-input dim-qty" min="1"
                                placeholder="Pcs" title="Number of pieces/sheets"
                                value={it.quantity}
                                onChange={(e) => setItem(index, 'quantity', e.target.value)}
                              />
                              <span className="dim-x">×</span>
                              <input
                                type="number" className="form-input dim-input" min="0.01" step="0.01"
                                placeholder={`L (${it.unit?.replace('SQ', '') || 'ft'})`}
                                value={it.length}
                                onChange={(e) => setItem(index, 'length', e.target.value)}
                              />
                              <span className="dim-x">×</span>
                              <input
                                type="number" className="form-input dim-input" min="0.01" step="0.01"
                                placeholder={`W (${it.unit?.replace('SQ', '') || 'ft'})`}
                                value={it.width}
                                onChange={(e) => setItem(index, 'width', e.target.value)}
                              />
                            </div>
                          )}

                          {it.billingType === 'WEIGHT' && (
                            <input
                              type="number" className="form-input" min="0.01" step="0.01"
                              placeholder={`Weight (${it.unit || 'kg'})`}
                              value={it.weight}
                              onChange={(e) => setItem(index, 'weight', e.target.value)}
                            />
                          )}

                          {it.billingType === 'SIMPLE' && (
                            <input
                              type="number"
                              className="form-input"
                              min="1"
                              placeholder={it.unit || 'Qty'}
                              value={it.quantity}
                              onChange={(e) => setItem(index, 'quantity', e.target.value)}
                            />
                          )}
                        </td>

                        <td>
                          <input
                            type="number"
                            className="form-input"
                            min="0"
                            step="0.01"
                            value={it.unitPrice}
                            onChange={(e) => setItem(index, 'unitPrice', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-input"
                            min="0"
                            max="100"
                            value={it.discountPercent}
                            onChange={(e) => setItem(index, 'discountPercent', e.target.value)}
                          />
                        </td>
                        <td className="item-total">{formatINR(total)}</td>
                        <td>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              ✕
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="totals-section">
              <div className="totals-row">
                <span className="totals-label">Sub Total</span>
                <span className="totals-value">{formatINR(subtotal)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">Discount</span>
                <span className="totals-value discount">-{formatINR(totalDisc)}</span>
              </div>
              <div className="totals-row">
                <span className="totals-label">GST</span>
                <span className="totals-value">{formatINR(totalGst)}</span>
              </div>
              <div className="totals-row grand-total">
                <span className="totals-label">Grand Total</span>
                <span className="totals-value">{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Thank you for your business…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Create Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
}
