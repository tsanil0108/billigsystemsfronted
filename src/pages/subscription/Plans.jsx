import React from 'react';
import { formatINR } from '../../utils/helpers';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export default function Plans({ plans, currentPlan, onUpgrade, loading }) {
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
    return currentPlan?.id === planId;
  };

  return (
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
            <Button
              variant={plan.name === 'PRO' ? 'success' : 'primary'}
              onClick={() => onUpgrade(plan.id)}
              loading={loading}
              className="plan-btn"
            >
              Upgrade to {plan.name}
            </Button>
          )}
          {plan.name === 'FREE_TRIAL' && isCurrentPlan(plan.id) && (
            <p className="plan-note">You're on free trial</p>
          )}
        </div>
      ))}
    </div>
  );
}