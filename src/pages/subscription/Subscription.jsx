import React, { useState, useEffect } from 'react';
import { subscriptionsService } from '../../api/services';  // ✅ Fixed: subscriptionsService
import { formatINR, formatDateLong, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import './Subscription.css';

export default function Subscription() {
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [mockUpgrading, setMockUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, currentRes] = await Promise.all([
        subscriptionsService.getPlans(),  // ✅ Fixed
        subscriptionsService.getCurrent().catch(() => ({ data: null })),  // ✅ Fixed
      ]);
      setPlans(plansRes.data || []);
      setCurrent(currentRes.data);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpgrade = async (planId) => {
    setUpgrading(true);
    try {
      const res = await subscriptionsService.upgrade({ planId, billingCycle: 'MONTHLY' });  // ✅ Fixed
      toast.success('Upgrade initiated!');
      // In production, redirect to Razorpay checkout
      console.log('Razorpay order:', res.data);
      loadData();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setUpgrading(false);
    }
  };

  // TEST-ONLY: bypasses Razorpay entirely and activates the plan directly.
  const handleMockUpgrade = async (planId) => {
    setMockUpgrading(true);
    try {
      await subscriptionsService.mockUpgrade({ planId, billingCycle: 'MONTHLY' });
      toast.success('Plan activated (mock payment)!');
      loadData();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setMockUpgrading(false);
    }
  };

  // Helper function for status color
  const getStatusColor = (status) => {
    const map = {
      'ACTIVE': 'success',
      'PENDING': 'warning',
      'EXPIRED': 'danger',
      'CANCELLED': 'danger',
      'TRIAL': 'info',
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

  const getPlanColor = (name) => {
    const map = {
      'FREE_TRIAL': 'gray',
      'BASIC': 'info',
      'STANDARD': 'primary',
      'PRO': 'success',
      'ENTERPRISE': 'purple',
    };
    return map[name] || 'primary';
  };

  const getPlanPrice = (plan) => {
    if (plan.name === 'FREE_TRIAL') return 'Free';
    return formatINR(plan.priceMonthly) + '/mo';
  };

  const isCurrentPlan = (planId) => {
    return current?.plan?.id === planId;
  };

  return (
    <div className="subscription-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscription</h1>
          <p className="page-subtitle">Manage your plan and billing</p>
        </div>
      </div>

      {current && (
        <Card title="Current Plan">
          <div className="current-plan">
            <div className="plan-info">
              <div className="plan-badge">
                <Badge color={getPlanColor(current.plan?.name)} size="lg">
                  {current.plan?.name || 'No Plan'}
                </Badge>
                <Badge color={getStatusColor(current.status)} size="lg">
                  {current.status}
                </Badge>
              </div>
              <p className="plan-dates">
                Started: {formatDateLong(current.startDate)} &nbsp;|&nbsp; 
                Expires: {formatDateLong(current.endDate)}
              </p>
            </div>
          </div>
        </Card>
      )}

      <h2 className="plans-title">Choose Your Plan</h2>
      <div className="plans-grid">
        {plans.map(plan => (
          <div 
            key={plan.id} 
            className={`plan-card ${isCurrentPlan(plan.id) ? 'current' : ''}`}
          >
            <div className="plan-header">
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">{getPlanPrice(plan)}</div>
              {isCurrentPlan(plan.id) && (
                <Badge color="success">Current</Badge>
              )}
            </div>
            <ul className="plan-features">
              <li>Max Users: {plan.maxUsers || 'Unlimited'}</li>
              <li>Invoices: {plan.maxInvoicesPerMonth || 'Unlimited'}/mo</li>
              <li>{plan.inventoryEnabled ? '✅' : '❌'} Inventory</li>
              <li>{plan.gstReportsEnabled ? '✅' : '❌'} GST Reports</li>
              <li>{plan.whatsappEnabled ? '✅' : '❌'} WhatsApp</li>
              <li>{plan.apiAccessEnabled ? '✅' : '❌'} API Access</li>
              <li>{plan.whiteLabelEnabled ? '✅' : '❌'} White Label</li>
            </ul>
            {!isCurrentPlan(plan.id) && plan.name !== 'FREE_TRIAL' && (
              <>
                <Button
                  variant={plan.name === 'PRO' ? 'success' : 'primary'}
                  onClick={() => handleUpgrade(plan.id)}
                  loading={upgrading}
                  className="plan-btn"
                >
                  Upgrade to {plan.name}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleMockUpgrade(plan.id)}
                  loading={mockUpgrading}
                  className="plan-btn"
                  style={{ marginTop: '8px' }}
                >
                  Mock Upgrade (Test)
                </Button>
              </>
            )}
            {plan.name === 'FREE_TRIAL' && isCurrentPlan(plan.id) && (
              <p className="plan-note">You're on free trial</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}