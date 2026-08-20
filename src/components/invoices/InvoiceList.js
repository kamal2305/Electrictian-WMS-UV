import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getBaseURL } from '../../config/axios';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaFileInvoiceDollar, FaDownload, FaTrash, FaEye, FaEdit } from 'react-icons/fa';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const url = statusFilter ? `/invoices?status=${statusFilter}` : '/invoices';
      const res = await api.get(url);
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const handleDelete = async (id, invNum) => {
    if (!window.confirm(`Are you sure you want to delete invoice #${invNum}?`)) return;
    try {
      await api.delete(`/invoices/${id}`);
      toast.success('Invoice deleted successfully');
      setInvoices(invoices.filter(i => i._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const handleDownloadPDF = async (id, invNum) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getBaseURL()}/invoices/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('PDF generation failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invNum}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Invoice PDF downloaded!');
    } catch (err) {
      toast.error('Failed to download invoice PDF');
    }
  };

  const filtered = invoices.filter(i => {
    const term = searchTerm.toLowerCase();
    const invNum = (i.invoiceNumber || '').toLowerCase();
    const clientName = (i.customer?.name || i.client?.name || '').toLowerCase();
    const jobTitle = (i.job?.title || '').toLowerCase();
    return invNum.includes(term) || clientName.includes(term) || jobTitle.includes(term);
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid') return 'badge-paid';
    if (s === 'partially paid') return 'badge-partially-paid';
    if (s === 'draft') return 'badge-draft';
    if (s === 'sent') return 'badge-sent';
    if (s === 'overdue') return 'badge-overdue';
    return 'badge-muted';
  };

  // Metrics
  const totalRevenue = invoices.reduce((sum, i) => i.status === 'Paid' ? sum + (i.totalAmount || 0) : sum, 0);
  const pendingAmount = invoices.reduce((sum, i) => i.status !== 'Paid' ? sum + (i.totalAmount || 0) : sum, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Invoices & Billing</h1>
          <div className="page-title-sub">Generate itemized bills, track payments, and export PDF invoices</div>
        </div>
        <Link to="/invoices/create" className="btn btn-primary">
          <FaPlus /> Create Invoice
        </Link>
      </div>

      {/* Quick metrics */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Total Invoices</div>
          <div className="stat-card-value" style={{ color: 'var(--primary)' }}>{invoices.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Paid Revenue</div>
          <div className="stat-card-value" style={{ color: 'var(--success)' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Pending / Unpaid</div>
          <div className="stat-card-value" style={{ color: 'var(--warning)' }}>₹{pendingAmount.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Filters bar */}
      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
          <FaSearch className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search by invoice #, customer, or job..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading invoices...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><FaFileInvoiceDollar /></div>
          <h3>No Invoices Found</h3>
          <p>{searchTerm || statusFilter ? 'Try clearing your filters' : 'Create your first invoice to bill customers for jobs'}</p>
          {!searchTerm && !statusFilter && (
            <Link to="/invoices/create" className="btn btn-primary" style={{ marginTop: 16 }}>
              <FaPlus /> Create Invoice
            </Link>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer / Client</th>
                <th>Related Job</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => (
                <tr key={inv._id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                    <Link to={`/invoices/${inv._id}`}>{inv.invoiceNumber}</Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{inv.customer?.name || inv.client?.name || 'N/A'}</div>
                    {(inv.customer?.phone || inv.client?.phone) && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inv.customer?.phone || inv.client?.phone}</div>
                    )}
                  </td>
                  <td>
                    {inv.job?.title ? (
                      <Link to={`/jobs/${inv.job._id}`} style={{ fontSize: 13, color: 'var(--text)' }}>
                        {inv.job.title}
                      </Link>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>Direct Bill</span>
                    )}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {inv.paymentMethod || '—'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: 15 }}>
                    ₹{Number(inv.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleDownloadPDF(inv._id, inv.invoiceNumber)}
                        className="btn btn-secondary btn-sm"
                        title="Download PDF"
                      >
                        <FaDownload style={{ color: 'var(--primary)' }} />
                      </button>
                      <Link to={`/invoices/${inv._id}`} className="btn btn-secondary btn-sm" title="View Details">
                        <FaEye />
                      </Link>
                      <Link to={`/invoices/${inv._id}/edit`} className="btn btn-secondary btn-sm" title="Edit">
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                        className="btn btn-danger btn-sm"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;