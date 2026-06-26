import React, { useState } from 'react';
import { gstService } from '../../api/services';
import { formatINR, getErrorMsg } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Spinner from '../../components/common/Spinner';
import './GSTReports.css';

export default function GSTReports() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await gstService.getGSTR1(year, month);
      setReport(res.data);
    } catch (err) {
      toast.error(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="gst-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">GST Reports</h1>
          <p className="page-subtitle">GSTR-1 and GSTR-3B reports</p>
        </div>
      </div>

      <Card>
        <div className="filter-section">
          <div className="filter-group">
            <label className="form-label">Year</label>
            <select
              className="form-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Month</label>
            <select
              className="form-select"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString('en', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" onClick={fetchReport} className="filter-btn">
            Generate Report
          </Button>
        </div>
      </Card>

      {loading && (
        <div className="loading-center">
          <Spinner size="lg" />
        </div>
      )}

      {report && !loading && (
        <>
          <div className="summary-cards">
            <div className="summary-card">
              <span className="summary-label">Total Invoices</span>
              <span className="summary-value">{report.totalInvoices}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Total Taxable</span>
              <span className="summary-value">{formatINR(report.totalTaxableAmount)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Total CGST</span>
              <span className="summary-value">{formatINR(report.totalCgst)}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Total SGST</span>
              <span className="summary-value">{formatINR(report.totalSgst)}</span>
            </div>
            <div className="summary-card highlight">
              <span className="summary-label">Total Tax</span>
              <span className="summary-value">{formatINR(report.totalTax)}</span>
            </div>
          </div>

          <Card title={`GSTR-1 - ${report.period}`}>
            <Table
              columns={columns}
              data={report.invoices || []}
              emptyMessage="No invoices found for this period"
            />
          </Card>
        </>
      )}
    </div>
  );
}