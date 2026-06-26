import React from 'react';
import { formatINR } from '../../utils/helpers';
import Table from '../../components/common/Table';

export default function GSTR1Report({ data, period }) {
  const columns = [
    { key: 'invoiceNumber', label: 'Invoice No.' },
    { key: 'invoiceDate', label: 'Date' },
    { key: 'customerName', label: 'Customer' },
    { key: 'customerGst', label: 'GST' },
    { 
      key: 'taxableAmount', 
      label: 'Taxable',
      render: (row) => formatINR(row.taxableAmount)
    },
    { 
      key: 'cgst', 
      label: 'CGST',
      render: (row) => formatINR(row.cgst)
    },
    { 
      key: 'sgst', 
      label: 'SGST',
      render: (row) => formatINR(row.sgst)
    },
    { 
      key: 'total', 
      label: 'Total',
      render: (row) => formatINR(row.total)
    },
  ];

  const summary = data ? {
    totalInvoices: data.totalInvoices || 0,
    totalTaxable: data.totalTaxableAmount || 0,
    totalCgst: data.totalCgst || 0,
    totalSgst: data.totalSgst || 0,
    totalTax: data.totalTax || 0,
  } : null;

  return (
    <div className="gstr1-report">
      <div className="summary-cards">
        <div className="summary-card">
          <span className="summary-label">Total Invoices</span>
          <span className="summary-value">{summary?.totalInvoices || 0}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total Taxable</span>
          <span className="summary-value">{formatINR(summary?.totalTaxable || 0)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total CGST</span>
          <span className="summary-value">{formatINR(summary?.totalCgst || 0)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total SGST</span>
          <span className="summary-value">{formatINR(summary?.totalSgst || 0)}</span>
        </div>
        <div className="summary-card highlight">
          <span className="summary-label">Total Tax</span>
          <span className="summary-value">{formatINR(summary?.totalTax || 0)}</span>
        </div>
      </div>

      <Table
        columns={columns}
        data={data?.invoices || []}
        emptyMessage="No invoices found for this period"
      />
    </div>
  );
}