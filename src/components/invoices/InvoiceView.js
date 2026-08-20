import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaDownload, FaEdit, FaPrint, FaBolt } from 'react-icons/fa';

const InvoiceView = () => {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invRes, settRes] = await Promise.all([
          api.get(`/invoices/${id}`),
          api.get('/settings').catch(() => ({ data: { data: null } }))
        ]);

        if (invRes.data.success) setInvoice(invRes.data.data);
        if (settRes.data?.data) setSettings(settRes.data.data);
      } catch (err) {
        toast.error('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('PDF download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice?.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Invoice PDF downloaded!');
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading invoice...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="page-container">
        <div className="empty-state card">
          <h3>Invoice Not Found</h3>
          <Link to="/invoices" className="btn btn-secondary" style={{ marginTop: 16 }}>
            Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

  const currency = settings?.currencySymbol || '₹';
  const companyName = settings?.companyName || 'ElectroTrack WMS';
  const clientName = invoice.customer?.name || invoice.client?.name || 'N/A';
  const clientPhone = invoice.customer?.phone || invoice.client?.phone || '';
  const clientAddress = invoice.customer?.address || invoice.client?.address || '';

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      {/* Top Action Bar */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <Link to="/invoices" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
            <FaArrowLeft /> Back to Invoices
          </Link>
          <h1>Invoice #{invoice.invoiceNumber}</h1>
        </div>
        <div className="action-buttons">
          <button onClick={handleDownloadPDF} className="btn btn-primary">
            <FaDownload /> Download PDF
          </button>
          <button onClick={handlePrint} className="btn btn-secondary">
            <FaPrint /> Print
          </button>
          <Link to={`/invoices/${invoice._id}/edit`} className="btn btn-secondary">
            <FaEdit /> Edit
          </Link>
        </div>
      </div>

      {/* Invoice Document Card */}
      <div className="invoice-view-container">
        {/* Header Branding */}
        <div className="invoice-print-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div className="sidebar-logo" style={{ width: 34, height: 34, fontSize: 16 }}>
                <FaBolt color="#fff" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{companyName}</h2>
            </div>
            {settings?.companyAddress && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 300 }}>{settings.companyAddress}</div>
            )}
            {settings?.companyPhone && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Ph: {settings.companyPhone}</div>
            )}
            {settings?.companyGstin && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>GSTIN: {settings.companyGstin}</div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', letterSpacing: 1 }}>INVOICE</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>#{invoice.invoiceNumber}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Date: {new Date(invoice.createdAt).toLocaleDateString('en-IN')}
            </div>
            {invoice.dueDate && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
              </div>
            )}
            <div style={{ marginTop: 10 }}>
              <span className={`badge badge-${invoice.status?.toLowerCase().replace(' ', '-')}`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="invoice-body">
          {/* Bill To & Related info */}
          <div className="invoice-meta-grid">
            <div className="invoice-meta-section">
              <h4>BILL TO</h4>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{clientName}</div>
              {clientPhone && <div>Phone: {clientPhone}</div>}
              {clientAddress && <div>Address: {clientAddress}</div>}
            </div>
            <div className="invoice-meta-section">
              <h4>PAYMENT & JOB REFERENCE</h4>
              <div>Payment Method: <span style={{ fontWeight: 500 }}>{invoice.paymentMethod || 'Cash'}</span></div>
              {invoice.job && <div>Job Reference: <span style={{ fontWeight: 500 }}>{invoice.job.title}</span></div>}
              {invoice.transactionId && <div>Txn Ref: <span style={{ fontWeight: 500 }}>{invoice.transactionId}</span></div>}
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 24 }}>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, i) => (
                  <tr key={i}>
                    <td>{item.description}</td>
                    <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{currency}{Number(item.unitPrice).toFixed(2)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{currency}{Number(item.total || item.quantity * item.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Breakdown & Totals */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            <div>
              {invoice.notes && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Notes</div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{invoice.notes}</p>
                </div>
              )}
              {invoice.termsAndConditions && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Terms & Conditions</div>
                  <p style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'pre-wrap' }}>{invoice.termsAndConditions}</p>
                </div>
              )}
              {settings?.bankName && (
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Bank Account For Transfer</div>
                  <div style={{ fontSize: 12 }}>Bank: <b>{settings.bankName}</b></div>
                  <div style={{ fontSize: 12 }}>A/C: <b>{settings.accountNumber}</b></div>
                  <div style={{ fontSize: 12 }}>IFSC: <b>{settings.ifscCode}</b></div>
                  {settings.upiId && <div style={{ fontSize: 12, color: 'var(--accent)' }}>UPI: <b>{settings.upiId}</b></div>}
                </div>
              )}
            </div>

            <div>
              {Number(invoice.labourCost) > 0 && (
                <div className="invoice-summary-row">
                  <span style={{ color: 'var(--text-muted)' }}>Labour Cost:</span>
                  <span>{currency}{Number(invoice.labourCost).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.materialCost) > 0 && (
                <div className="invoice-summary-row">
                  <span style={{ color: 'var(--text-muted)' }}>Material Cost:</span>
                  <span>{currency}{Number(invoice.materialCost).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.transportCharge) > 0 && (
                <div className="invoice-summary-row">
                  <span style={{ color: 'var(--text-muted)' }}>Transport Charge:</span>
                  <span>{currency}{Number(invoice.transportCharge).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.serviceCharge) > 0 && (
                <div className="invoice-summary-row">
                  <span style={{ color: 'var(--text-muted)' }}>Service Charge:</span>
                  <span>{currency}{Number(invoice.serviceCharge).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.otherCharge) > 0 && (
                <div className="invoice-summary-row">
                  <span style={{ color: 'var(--text-muted)' }}>{invoice.otherChargeLabel || 'Other Charge'}:</span>
                  <span>{currency}{Number(invoice.otherCharge).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.discount) > 0 && (
                <div className="invoice-summary-row" style={{ color: 'var(--danger)' }}>
                  <span>Discount:</span>
                  <span>-{currency}{Number(invoice.discount).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.tax) > 0 && (
                <div className="invoice-summary-row">
                  <span style={{ color: 'var(--text-muted)' }}>GST/Tax ({invoice.taxRate}%):</span>
                  <span>{currency}{Number(invoice.tax).toFixed(2)}</span>
                </div>
              )}

              <div className="invoice-total-row">
                <span>Total Amount</span>
                <span>{currency}{Number(invoice.totalAmount).toFixed(2)}</span>
              </div>

              {Number(invoice.amountPaid) > 0 && (
                <div className="invoice-summary-row" style={{ color: 'var(--success)', marginTop: 8 }}>
                  <span>Amount Paid:</span>
                  <span>{currency}{Number(invoice.amountPaid).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
