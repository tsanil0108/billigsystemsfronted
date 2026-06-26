import React, { useState } from 'react';
import { subscriptionService } from '../../api/services';
import { formatINR, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './Checkout.css';
export default function Checkout({ plan, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('MONTHLY');
  const navigate = useNavigate();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await subscriptionService.upgrade({
        planId: plan.id,
        billingCycle: billingCycle,
      });
      
      // In production, integrate Razorpay checkout here
      // For demo, we'll just show success
      toast.success('Payment initiated!');
      onSuccess();
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const getPrice = () => {
    if (billingCycle === 'YEARLY' && plan.priceYearly) {
      return plan.priceYearly;
    }
    return plan.priceMonthly;
  };

  return (
    <Card title="Checkout">
      <div className="checkout-details">
        <div className="checkout-plan">
          <h3>{plan.name}</h3>
          <p className="checkout-price">{formatINR(getPrice())}</p>
          <p className="checkout-cycle">{billingCycle === 'YEARLY' ? 'Annual' : 'Monthly'}</p>
        </div>

        <div className="checkout-billing">
          <label className="form-label">Billing Cycle</label>
          <div className="billing-options">
            <button
              type="button"
              className={`billing-option ${billingCycle === 'MONTHLY' ? 'active' : ''}`}
              onClick={() => setBillingCycle('MONTHLY')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`billing-option ${billingCycle === 'YEARLY' ? 'active' : ''}`}
              onClick={() => setBillingCycle('YEARLY')}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="checkout-features">
          <h4>What's included:</h4>
          <ul>
            <li>✅ Max Users: {plan.maxUsers || 'Unlimited'}</li>
            <li>✅ Invoices: {plan.maxInvoicesPerMonth || 'Unlimited'}/mo</li>
            {plan.inventoryEnabled && <li>✅ Inventory Management</li>}
            {plan.gstReportsEnabled && <li>✅ GST Reports</li>}
            {plan.whatsappEnabled && <li>✅ WhatsApp Integration</li>}
            {plan.apiAccessEnabled && <li>✅ API Access</li>}
            {plan.whiteLabelEnabled && <li>✅ White Label</li>}
          </ul>
        </div>

        <div className="checkout-total">
          <span>Total</span>
          <span className="checkout-total-amount">{formatINR(getPrice())}</span>
        </div>

        <div className="checkout-actions">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePayment} loading={loading}>
            Proceed to Payment
          </Button>
        </div>
      </div>
    </Card>
  );
}