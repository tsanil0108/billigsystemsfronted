import React from 'react';
import { formatDate, formatINR, getStatusColor } from '../../../utils/helpers';
import Badge from '../../../components/common/Badge';
import Card from '../../../components/common/Card';
import './RecentInvoices.css';

export default function RecentInvoices({ invoices, loading }) {
  if (loading) {
    return <div className="loading-center"><div className="spinner" /></div>;
  }

  return (
    <Card title="Recent Invoices">
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice No.</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices?.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-state-text">No invoices found</td>
              </tr>
            ) : (
              invoices?.map((inv) => (
                <tr key={inv.id}>
                  <td className="invoice-number">{inv.invoiceNumber}</td>
                  <td>{inv.customer?.name}</td>
                  <td>{formatDate(inv.invoiceDate)}</td>
                  <td className="amount">{formatINR(inv.totalAmount)}</td>
                  <td>
                    <Badge color={getStatusColor(inv.paymentStatus)}>
                      {inv.paymentStatus}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}