import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFileInvoiceDollar, FaTrash, FaEdit } from 'react-icons/fa';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted successfully');
      setCustomers(customers.filter(c => c._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Customer Management</h1>
          <div className="page-title-sub">Manage client contacts, billing addresses, and invoice history</div>
        </div>
        <Link to="/customers/create" className="btn btn-primary">
          <FaPlus /> Add Customer
        </Link>
      </div>

      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1 }}>
          <FaSearch className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading customers...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><FaUser /></div>
          <h3>No Customers Found</h3>
          <p>{searchTerm ? 'Try adjusting your search criteria' : 'Add your first customer to start tracking invoices and jobs'}</p>
          {!searchTerm && (
            <Link to="/customers/create" className="btn btn-primary" style={{ marginTop: 16 }}>
              <FaPlus /> Add Customer
            </Link>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(customer => (
            <div key={customer._id} className="card customer-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: 16 }}>
                    {customer.name?.slice(0, 2)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{customer.name}</h3>
                    {customer.company && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{customer.company}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Link to={`/customers/${customer._id}/edit`} className="btn btn-secondary btn-sm" style={{ padding: '6px 10px' }} title="Edit">
                    <FaEdit />
                  </Link>
                  <button onClick={() => handleDelete(customer._id, customer.name)} className="btn btn-danger btn-sm" style={{ padding: '6px 10px' }} title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, flex: 1 }}>
                {customer.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaPhone style={{ color: 'var(--primary)', fontSize: 12 }} />
                    <span style={{ color: 'var(--text)' }}>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaEnvelope style={{ color: 'var(--accent)', fontSize: 12 }} />
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <FaMapMarkerAlt style={{ color: 'var(--warning)', fontSize: 12, marginTop: 3 }} />
                    <span>{customer.address}</span>
                  </div>
                )}
                {customer.gstin && (
                  <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4, width: 'fit-content' }}>
                    GSTIN: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{customer.gstin}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to={`/customers/${customer._id}`} style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                  View Full Profile →
                </Link>
                <Link to={`/invoices/create?customerId=${customer._id}`} className="btn btn-outline btn-sm">
                  <FaFileInvoiceDollar /> New Bill
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerList;
