import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { invoiceService } from '../../api/services';
import { useTenant } from '../../context/TenantContext';
import { formatINR, formatDate, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import './InvoiceDetail.css';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendMethod, setSendMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const res = await invoiceService.getById(id);
      setInvoice(res.data);
      if (res.data?.customer) {
        setEmail(res.data.customer.email || '');
        setPhone(res.data.customer.phone || '');
      }
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [id]);

  // ─── Send Invoice ────────────────────────────────────────────
  const handleSendInvoice = async () => {
    setSending(true);
    try {
      const payload = {
        method: sendMethod,
        email: sendMethod === 'email' ? email : undefined,
        phone: sendMethod === 'whatsapp' ? phone : undefined,
        message: message,
      };

      const res = await invoiceService.send(id, payload);
      toast.success(`✅ Invoice sent successfully via ${sendMethod}!`);
      setShowSendModal(false);
      
      if (res.data?.shareLink) {
        toast.success(`🔗 Share Link: ${res.data.shareLink}`);
      }
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setSending(false);
    }
  };

  // ─── Download PDF ────────────────────────────────────────────
  const handleDownloadPDF = async () => {
    try {
      const res = await invoiceService.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoice?.invoiceNumber || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('📥 Invoice downloaded successfully!');
    } catch (err) {
      toast.error(getErrorMsg(err));
    }
  };

  const getStatusColor = (status) => {
    const map = {
      'PAID': 'success',
      'UNPAID': 'danger',
      'PARTIAL': 'warning',
      'CANCELLED': 'danger',
      'PENDING': 'warning'
    };
    return map[status] || 'gray';
  };

  if (loading) {
    return (
      <div className="loading-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="empty-state">
        <h2>Invoice not found</h2>
        <Button onClick={() => navigate('/invoices')}>Back to Invoices</Button>
      </div>
    );
  }

  const customer = invoice.customer || {};
  const customerName = customer?.name || invoice?.customerName || 'Unknown Customer';
  const customerGst = customer?.gstNumber || 'N/A';
  const customerPhone = customer?.phone || '—';
  const customerEmail = customer?.email || '—';
  const customerAddress = customer?.address || '';
  const customerCity = customer?.city || '';
  const customerState = customer?.state || '';
  const customerPincode = customer?.pincode || '';

  const fullAddress = [
    customerAddress,
    customerCity,
    customerState,
    customerPincode
  ].filter(Boolean).join(', ');

  const items = invoice.items || [];
  const subtotal = invoice.subtotal || invoice.totalAmount || 0;
  const taxAmount = invoice.totalGst || 0;
  const totalAmount = invoice.totalAmount || 0;

  return (
    <div className="invoice-detail-page">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="invoice-detail-header">
        <div>
          <h1 className="page-title">Invoice #{invoice.invoiceNumber}</h1>
          <p className="page-subtitle">
            {formatDate(invoice.invoiceDate)} • {customerName}
          </p>
        </div>
        <div className="header-actions">
          {/* ✅ SEND BUTTON - WAPAS ADD KAR DIYA */}
          <Button 
            variant="primary" 
            onClick={() => setShowSendModal(true)}
            disabled={sending}
          >
            {sending ? <Spinner size="sm" /> : '✉️ Send'}
          </Button>
          <Button variant="secondary" onClick={handleDownloadPDF}>
            📥 PDF
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            🖨️ Print
          </Button>
          <Button variant="secondary" onClick={() => navigate('/invoices')}>
            ← Back
          </Button>
        </div>
      </div>

      {/* ─── Status Bar ────────────────────────────────────────── */}
      <div className="invoice-status-bar">
        <Badge color={getStatusColor(invoice.paymentStatus)} size="lg">
          {invoice.paymentStatus || 'PENDING'}
        </Badge>
        {invoice.status === 'CANCELLED' && (
          <Badge color="danger" size="lg">CANCELLED</Badge>
        )}
        {invoice.viewedAt && (
          <span className="view-status">👁️ Viewed on {formatDate(invoice.viewedAt)}</span>
        )}
      </div>

      {/* ─── Invoice Content ────────────────────────────────────── */}
      <div className="invoice-content">
        <div className="invoice-box">
          
          {/* ─── Header: Company & Invoice Info ────────────────── */}
          <div className="invoice-header-box">
            <div className="company-details">
              <h2>{tenant?.companyName || 'Company Name'}</h2>
              <p>{tenant?.address || ''}</p>
              <p>{tenant?.city || ''} {tenant?.state || ''} - {tenant?.pincode || ''}</p>
              <p><strong>GST:</strong> {tenant?.gstNumber || 'N/A'}</p>
              <p><strong>Email:</strong> {tenant?.email || ''}</p>
              <p><strong>Phone:</strong> {tenant?.phone || ''}</p>
            </div>
            <div className="invoice-meta">
              <h3>INVOICE</h3>
              <p><strong>Invoice No:</strong> {invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> {formatDate(invoice.invoiceDate)}</p>
              <p><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          {/* ─── Bill To: Customer Details ────────────────────── */}
          <div className="customer-details">
            <h4>BILL TO:</h4>
            <div className="customer-info-grid">
              <div className="customer-info-item">
                <span className="label">NAME</span>
                <span className="value"><strong>{customerName}</strong></span>
              </div>
              <div className="customer-info-item">
                <span className="label">GST</span>
                <span className="value">{customerGst}</span>
              </div>
              <div className="customer-info-item">
                <span className="label">PHONE</span>
                <span className="value">{customerPhone}</span>
              </div>
              <div className="customer-info-item">
                <span className="label">EMAIL</span>
                <span className="value">{customerEmail}</span>
              </div>
              <div className="customer-info-item full-width">
                <span className="label">ADDRESS</span>
                <span className="value">{fullAddress || '—'}</span>
              </div>
            </div>
          </div>

          {/* ─── Items Table ────────────────────────────────────── */}
          <div className="invoice-items">
            <table className="items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>DESCRIPTION</th>
                  <th>HSN</th>
                  <th>QTY</th>
                  <th>UNIT</th>
                  <th>PRICE</th>
                  <th>GST%</th>
                  <th>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-items">No items in this invoice</td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.product?.name || item.productName || 'N/A'}</td>
                      <td>{item.product?.hsn || item.hsn || '-'}</td>
                      <td>{item.quantity}</td>
                      <td>{item.product?.unit || item.unit || '-'}</td>
                      <td>{formatINR(item.unitPrice || item.price || 0)}</td>
                      <td>{item.gstRate || 0}%</td>
                      <td>{formatINR(item.totalAmount || item.amount || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ─── Totals ────────────────────────────────────────── */}
          <div className="invoice-totals">
            <div className="totals-box">
              <div className="total-row">
                <span>Subtotal:</span>
                <span className="amount">{formatINR(subtotal)}</span>
              </div>
              <div className="total-row">
                <span>GST:</span>
                <span className="amount">{formatINR(taxAmount)}</span>
              </div>
              <div className="total-row grand-total">
                <span>Grand Total:</span>
                <span className="amount">{formatINR(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* ─── Notes ──────────────────────────────────────────── */}
          {invoice.notes && (
            <div className="invoice-notes">
              <h4>Notes:</h4>
              <p>{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Send Modal ────────────────────────────────────────── */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="✉️ Send Invoice to Client"
        size="md"
      >
        <div className="send-invoice-modal">
          <div className="form-group">
            <label className="form-label">Send Via</label>
            <div className="send-method-toggle">
              <button
                className={`method-btn ${sendMethod === 'email' ? 'active' : ''}`}
                onClick={() => setSendMethod('email')}
              >
                📧 Email
              </button>
              <button
                className={`method-btn ${sendMethod === 'whatsapp' ? 'active' : ''}`}
                onClick={() => setSendMethod('whatsapp')}
              >
                💬 WhatsApp
              </button>
              <button
                className={`method-btn ${sendMethod === 'link' ? 'active' : ''}`}
                onClick={() => setSendMethod('link')}
              >
                🔗 Share Link
              </button>
            </div>
          </div>

          {sendMethod === 'email' && (
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
              />
            </div>
          )}

          {sendMethod === 'whatsapp' && (
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          )}

          {sendMethod === 'link' && (
            <div className="form-group">
              <label className="form-label">Shareable Link</label>
              <div className="share-link-box">
                <input
                  type="text"
                  className="form-input"
                  value={`${window.location.origin}/share/invoice/${invoice.id}`}
                  readOnly
                />
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/share/invoice/${invoice.id}`
                    );
                    toast.success('📋 Link copied!');
                  }}
                >
                  📋 Copy
                </Button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Personal Message (Optional)</label>
            <textarea
              className="form-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              placeholder="Dear Sir, Please find attached invoice #..."
            />
          </div>

          <div className="preview-box">
            <p><strong>Invoice:</strong> #{invoice.invoiceNumber}</p>
            <p><strong>Amount:</strong> {formatINR(invoice.totalAmount)}</p>
            <p><strong>Client:</strong> {customerName}</p>
            <p><strong>Status:</strong> {invoice.paymentStatus}</p>
          </div>

          <div className="modal-footer">
            <Button variant="secondary" onClick={() => setShowSendModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendInvoice} loading={sending}>
              {sending ? 'Sending...' : '📤 Send Invoice'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}