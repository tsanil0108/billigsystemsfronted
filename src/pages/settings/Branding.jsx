
import React, { useState, useEffect } from 'react';
import { brandingService } from '../../api/services';
import { getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import './Branding.css';

export default function Branding() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    logoUrl: '',
    primaryColor: '#2563EB',
    secondaryColor: '#7C3AED',
    invoiceFooterText: '',
    termsAndConditions: '',
  });
  const [preview, setPreview] = useState({
    show: false,
    logoUrl: '',
    primaryColor: '#2563EB',
    secondaryColor: '#7C3AED',
    invoiceFooterText: '',
    termsAndConditions: '',
  });

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    setLoading(true);
    try {
      const res = await brandingService.get();
      const data = res.data || {};
      setForm({
        logoUrl: data.logoUrl || '',
        primaryColor: data.primaryColor || '#2563EB',
        secondaryColor: data.secondaryColor || '#7C3AED',
        invoiceFooterText: data.invoiceFooterText || '',
        termsAndConditions: data.termsAndConditions || '',
      });
      setPreview({
        show: false,
        logoUrl: data.logoUrl || '',
        primaryColor: data.primaryColor || '#2563EB',
        secondaryColor: data.secondaryColor || '#7C3AED',
        invoiceFooterText: data.invoiceFooterText || '',
        termsAndConditions: data.termsAndConditions || '',
      });
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Auto-update preview
    setPreview(prev => ({
      ...prev,
      [name]: value,
      show: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await brandingService.save(form);
      toast.success('Branding updated successfully!');
      setPreview(prev => ({ ...prev, show: true }));
      loadBranding();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('Are you sure you want to reset branding to default?')) return;
    setForm({
      logoUrl: '',
      primaryColor: '#2563EB',
      secondaryColor: '#7C3AED',
      invoiceFooterText: '',
      termsAndConditions: '',
    });
    setPreview({
      show: false,
      logoUrl: '',
      primaryColor: '#2563EB',
      secondaryColor: '#7C3AED',
      invoiceFooterText: '',
      termsAndConditions: '',
    });
    toast.success('Branding reset to default');
  };

  const togglePreview = () => {
    setPreview(prev => ({
      ...prev,
      show: !prev.show,
      logoUrl: form.logoUrl || prev.logoUrl,
      primaryColor: form.primaryColor || prev.primaryColor,
      secondaryColor: form.secondaryColor || prev.secondaryColor,
      invoiceFooterText: form.invoiceFooterText || prev.invoiceFooterText,
      termsAndConditions: form.termsAndConditions || prev.termsAndConditions,
    }));
  };

  if (loading) {
    return (
      <Card title="Branding">
        <div className="loading-center">
          <div className="spinner" />
        </div>
      </Card>
    );
  }

  return (
    <div className="branding-page">
      <div className="branding-header">
        <div>
          <h2 className="branding-title">Branding Settings</h2>
          <p className="branding-subtitle">Customize your invoice and app appearance</p>
        </div>
        <div className="branding-actions">
          <Button variant="secondary" onClick={togglePreview}>
            {preview.show ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button variant="danger" onClick={handleReset}>
            Reset Defaults
          </Button>
        </div>
      </div>

      <div className="branding-grid">
        {/* Form */}
        <div className="branding-form-wrapper">
          <Card>
            <form onSubmit={handleSubmit} className="branding-form">
              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <div className="logo-input-wrapper">
                  <input
                    type="text"
                    name="logoUrl"
                    className="form-input"
                    placeholder="https://cdn.example.com/logo.png"
                    value={form.logoUrl}
                    onChange={handleChange}
                  />
                  {form.logoUrl && (
                    <div className="logo-preview-small">
                      <img 
                        src={form.logoUrl} 
                        alt="Logo preview" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="logo-error">Invalid URL</span>';
                        }}
                      />
                    </div>
                  )}
                </div>
                <span className="form-hint">Enter a valid image URL for your company logo</span>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Primary Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      name="primaryColor"
                      className="form-input color-picker"
                      value={form.primaryColor}
                      onChange={handleChange}
                    />
                    <span className="color-hex">{form.primaryColor}</span>
                  </div>
                  <span className="form-hint">Main brand color for buttons and headers</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Secondary Color</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      name="secondaryColor"
                      className="form-input color-picker"
                      value={form.secondaryColor}
                      onChange={handleChange}
                    />
                    <span className="color-hex">{form.secondaryColor}</span>
                  </div>
                  <span className="form-hint">Accent color for highlights and badges</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Invoice Footer Text</label>
                <input
                  type="text"
                  name="invoiceFooterText"
                  className="form-input"
                  placeholder="Thank you for your business!"
                  value={form.invoiceFooterText}
                  onChange={handleChange}
                />
                <span className="form-hint">Text that appears at the bottom of every invoice</span>
              </div>

              <div className="form-group">
                <label className="form-label">Terms & Conditions</label>
                <textarea
                  name="termsAndConditions"
                  className="form-textarea"
                  placeholder="Terms and conditions for your invoices..."
                  value={form.termsAndConditions}
                  onChange={handleChange}
                  rows="3"
                />
                <span className="form-hint">Legal terms that appear on invoices</span>
              </div>

              <div className="branding-form-actions">
                <Button type="submit" variant="primary" loading={saving}>
                  Save Branding
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Preview */}
        {preview.show && (
          <div className="branding-preview-wrapper">
            <Card title="Live Preview">
              <div className="preview-container">
                {/* Header with Logo */}
                <div className="preview-header" style={{ borderBottomColor: preview.primaryColor }}>
                  <div className="preview-logo-area">
                    {preview.logoUrl ? (
                      <img 
                        src={preview.logoUrl} 
                        alt="Company Logo" 
                        className="preview-logo"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<span class="preview-logo-placeholder">Logo</span>';
                        }}
                      />
                    ) : (
                      <span className="preview-logo-placeholder">Your Logo</span>
                    )}
                  </div>
                  <div className="preview-company">
                    <h3 style={{ color: preview.primaryColor }}>Your Company Name</h3>
                    <p>GST: 27ABCDE1234F1Z5</p>
                    <p>123, Business Street, City - 110001</p>
                  </div>
                </div>

                {/* Invoice Title */}
                <div className="preview-invoice-title" style={{ 
                  background: preview.primaryColor,
                  color: '#fff'
                }}>
                  <h2>TAX INVOICE</h2>
                  <span>INV-2024-0001</span>
                </div>

                {/* Invoice Details */}
                <div className="preview-details">
                  <div className="preview-detail-row">
                    <span className="preview-detail-label">Date</span>
                    <span className="preview-detail-value">23 Jun 2024</span>
                  </div>
                  <div className="preview-detail-row">
                    <span className="preview-detail-label">Due Date</span>
                    <span className="preview-detail-value">07 Jul 2024</span>
                  </div>
                  <div className="preview-detail-row">
                    <span className="preview-detail-label">Payment Mode</span>
                    <span className="preview-detail-value">UPI</span>
                  </div>
                </div>

                {/* Items Table */}
                <table className="preview-items">
                  <thead style={{ background: preview.primaryColor, color: '#fff' }}>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Product 1</td>
                      <td>2</td>
                      <td>₹150.00</td>
                      <td>₹300.00</td>
                    </tr>
                    <tr>
                      <td>Product 2</td>
                      <td>1</td>
                      <td>₹250.00</td>
                      <td>₹250.00</td>
                    </tr>
                  </tbody>
                </table>

                {/* Totals */}
                <div className="preview-totals">
                  <div className="preview-total-row">
                    <span>Sub Total</span>
                    <span>₹550.00</span>
                  </div>
                  <div className="preview-total-row">
                    <span>Discount</span>
                    <span>-₹50.00</span>
                  </div>
                  <div className="preview-total-row">
                    <span>GST (18%)</span>
                    <span>₹90.00</span>
                  </div>
                  <div className="preview-total-row grand-total" style={{ borderTopColor: preview.primaryColor }}>
                    <span>Grand Total</span>
                    <span style={{ color: preview.primaryColor }}>₹590.00</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="preview-footer" style={{ 
                  borderTopColor: preview.primaryColor,
                  color: preview.secondaryColor 
                }}>
                  <p>{preview.invoiceFooterText || 'Thank you for your business!'}</p>
                  {preview.termsAndConditions && (
                    <div className="preview-terms">
                      <strong>Terms:</strong> {preview.termsAndConditions}
                    </div>
                  )}
                </div>

                <div className="preview-badge" style={{ 
                  background: preview.primaryColor,
                  color: '#fff'
                }}>
                  <span>Powered by BillMaster</span>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}