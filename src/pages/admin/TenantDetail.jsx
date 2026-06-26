import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/services';
import { formatINR, formatDateLong, getStatusColor, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useParams, useNavigate } from 'react-router-dom';
import './TenantDetail.css';

export default function TenantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadTenant();
  }, [id]);

  const loadTenant = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTenantDetail(id);
      setTenant(res.data);
    } catch (err) {
      toast.error(getErrorMsg(err));
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!window.confirm(`Are you sure you want to suspend ${tenant?.companyName}?`)) return;
    setActionLoading(true);
    try {
      await adminService.suspendTenant(id);
      toast.success('Tenant suspended successfully');
      loadTenant();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      await adminService.activateTenant(id);
      toast.success('Tenant activated successfully');
      loadTenant();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async (paymentId) => {
    const reason = prompt('Enter refund reason:');
    if (!reason) return;
    
    if (!window.confirm(`Are you sure you want to refund this payment?`)) return;
    
    setActionLoading(true);
    try {
      await adminService.refund(paymentId, { reason });
      toast.success('Refund processed successfully');
      loadTenant();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="empty-state">
        <h3>Tenant not found</h3>
        <p>The tenant you are looking for does not exist.</p>
        <Button variant="primary" onClick={() => navigate('/admin')}>
          Back to Admin
        </Button>
      </div>
    );
  }

  const isActive = tenant.status === 'ACTIVE' || tenant.status === 'TRIAL';

  return (
    <div className="tenant-detail">
      <div className="page-header">
        <div>
          <h1 className="page-title">{tenant.companyName}</h1>
          <p className="page-subtitle">Tenant Details & Management</p>
        </div>
        <div className="actions">
          <Button variant="secondary" onClick={() => navigate('/admin')}>
            ← Back to Tenants
          </Button>
          {isActive ? (
            <Button 
              variant="danger" 
              onClick={handleSuspend} 
              loading={actionLoading}
              disabled={actionLoading}
            >
              Suspend Tenant
            </Button>
          ) : (
            <Button 
              variant="success" 
              onClick={handleActivate} 
              loading={actionLoading}
              disabled={actionLoading}
            >
              Activate Tenant
            </Button>
          )}
        </div>
      </div>

      <div className="tenant-detail-grid">
        {/* Company Information */}
        <Card title="Company Information">
          <div className="info-row">
            <span className="info-label">Company Name</span>
            <span className="info-value">{tenant.companyName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{tenant.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Phone</span>
            <span className="info-value">{tenant.phone || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">GST Number</span>
            <span className="info-value">{tenant.gstNumber || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Address</span>
            <span className="info-value">
              {tenant.address ? (
                <>
                  {tenant.address}
                  {tenant.city && `, ${tenant.city}`}
                  {tenant.state && `, ${tenant.state}`}
                  {tenant.pincode && ` - ${tenant.pincode}`}
                </>
              ) : '—'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Status</span>
            <span className="info-value">
              <Badge color={getStatusColor(tenant.status)} size="lg">
                {tenant.status}
              </Badge>
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Created</span>
            <span className="info-value">{formatDateLong(tenant.createdAt)}</span>
          </div>
        </Card>

        {/* Subscription Information */}
        <Card title="Subscription Details">
          <div className="info-row">
            <span className="info-label">Current Plan</span>
            <span className="info-value">
              <Badge color="primary" size="lg">
                {tenant.planName || 'No Plan'}
              </Badge>
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Subscription Status</span>
            <span className="info-value">
              <Badge color={getStatusColor(tenant.subscriptionStatus)}>
                {tenant.subscriptionStatus || '—'}
              </Badge>
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Start Date</span>
            <span className="info-value">
              {tenant.subscriptionStartDate ? formatDateLong(tenant.subscriptionStartDate) : '—'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Expiry Date</span>
            <span className="info-value">
              {tenant.subscriptionEndDate ? formatDateLong(tenant.subscriptionEndDate) : '—'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Total Revenue</span>
            <span className="info-value" style={{ color: 'var(--success)', fontWeight: 700 }}>
              {formatINR(tenant.totalRevenue || 0)}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Total Users</span>
            <span className="info-value">{tenant.userCount || 0}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Total Invoices</span>
            <span className="info-value">{tenant.invoiceCount || 0}</span>
          </div>
        </Card>
      </div>

      {/* Recent Payments */}
      {tenant.payments && tenant.payments.length > 0 && (
        <Card title="Recent Payments">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Gateway</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenant.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="amount">{formatINR(payment.amount)}</td>
                    <td>
                      <Badge color={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td>{payment.gateway || '—'}</td>
                    <td>{formatDateLong(payment.createdAt)}</td>
                    <td>
                      {payment.status === 'SUCCESS' && payment.refundStatus !== 'REFUNDED' && (
                        <Button 
                          size="sm" 
                          variant="warning" 
                          onClick={() => handleRefund(payment.id)}
                          disabled={actionLoading}
                        >
                          Refund
                        </Button>
                      )}
                      {payment.refundStatus === 'REFUNDED' && (
                        <Badge color="info">Refunded</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="quick-actions">
          <Button 
            variant="secondary" 
            onClick={() => window.open(`/admin/tenants/${id}/invoices`, '_blank')}
          >
            View All Invoices
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => window.open(`/admin/tenants/${id}/users`, '_blank')}
          >
            View All Users
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => window.open(`/admin/tenants/${id}/edit`, '_blank')}
          >
            Edit Tenant
          </Button>
        </div>
      </Card>
    </div>
  );
}