import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaEdit, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFileInvoiceDollar } from 'react-icons/fa';

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [custRes, invRes] = await Promise.all([
          api.get(`/customers/${id}`),
          api.get(`/invoices?customer=${id}`)
        ]);

        if (custRes.data.success) {
          setCustomer(custRes.data.data);
        }
        if (invRes.data.success) {
          setInvoices(invRes.data.data);
        }
      } catch (err) {
        toast.error('Failed to load customer details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading customer details...</span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="page-container">
        <div className="empty-state card">
          <h3>Customer not found</h3>
          <Link to="/customers" className="btn btn-secondary" style={{ marginTop: 16 }}>
            Back to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <Link to="/customers" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
            <FaArrowLeft /> Back to Customers
          </Link>
          <h1>{customer.name}</h1>
          <div className="page-title-sub">{customer.company || 'Individual Client'}</div>
        </div>
        <div className="action-buttons">
          <Link to={`/customers/${customer._id}/edit`} className="btn btn-secondary">
            <FaEdit /> Edit Customer
          </Link>
          <Link to={`/invoices/create?customerId=${customer._id}`} className="btn btn-primary">
            <FaFileInvoiceDollar /> Create Invoice
          </Link>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Contact Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            {customer.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FaPhone style={{ color: 'var(--primary)' }} />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FaEnvelope style={{ color: 'var(--accent)' }} />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <FaMapMarkerAlt style={{ color: 'var(--warning)', marginTop: 3 }} />
                <span>{customer.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Tax & Company</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Company: </span>
              <span style={{ fontWeight: 500 }}>{customer.company || 'N/A'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>GSTIN / Tax ID: </span>
              <span style={{ fontWeight: 500 }}>{customer.gstin || 'Not registered'}</span>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Billing Summary</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
            {invoices.length} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 'normal' }}>Invoices</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            Total Invoiced: ₹{invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {customer.notes && (
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Notes</div>
          <p style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{customer.notes}</p>
        </div>
      )}

      {/* Invoices List */}
      <div className="table-container">
        <div className="section-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2>Invoices for this Customer</h2>
          <Link to={`/invoices/create?customerId=${customer._id}`} className="btn btn-outline btn-sm">
            <FaFileInvoiceDollar /> Create New Bill
          </Link>
        </div>
        {invoices.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 20px' }}>
            <p>No invoices created for this customer yet.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{inv.invoiceNumber}</td>
                  <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${inv.status?.toLowerCase().replace(' ', '-')}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>{inv.paymentMethod || 'N/A'}</td>
                  <td style={{ fontWeight: 600 }}>₹{Number(inv.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <Link to={`/invoices/${inv._id}`} style={{ color: 'var(--primary)', fontSize: 13 }}>
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
