import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSave } from 'react-icons/fa';

const JobForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'Pending',
    priority: 'Medium',
    client: { name: '', phone: '', email: '', address: '' },
    assignedTo: []
  });

  const [customers, setCustomers] = useState([]);
  const [electricians, setElectricians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        setFetching(true);
        const [elecRes, custRes] = await Promise.all([
          api.get('/users/electricians').catch(() => ({ data: { data: [] } })),
          api.get('/customers').catch(() => ({ data: { data: [] } }))
        ]);

        if (elecRes.data?.data) setElectricians(elecRes.data.data);
        if (custRes.data?.data) setCustomers(custRes.data.data);

        if (isEditMode) {
          const res = await api.get(`/jobs/${id}`);
          if (res.data.success) {
            const job = res.data.data;
            setFormData({
              title: job.title || '',
              description: job.description || '',
              location: job.location || '',
              startDate: job.startDate ? new Date(job.startDate).toISOString().split('T')[0] : '',
              dueDate: job.dueDate ? new Date(job.dueDate).toISOString().split('T')[0] : '',
              status: job.status || 'Pending',
              priority: job.priority || 'Medium',
              client: job.client || { name: '', phone: '', email: '', address: '' },
              assignedTo: (job.assignedTo || job.assignedElectricians || []).map(e => e._id || e)
            });
          }
        }
      } catch (err) {
        toast.error('Error fetching job details');
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id, isEditMode]);

  const handleCustomerSelect = (customerId) => {
    const c = customers.find(item => item._id === customerId);
    if (c) {
      setFormData(prev => ({
        ...prev,
        client: {
          name: c.name || '',
          phone: c.phone || '',
          email: c.email || '',
          address: c.address || ''
        },
        location: prev.location || c.address || ''
      }));
    }
  };

  const handleElectricianToggle = (elecId) => {
    setFormData(prev => {
      const exists = prev.assignedTo.includes(elecId);
      return {
        ...prev,
        assignedTo: exists ? prev.assignedTo.filter(e => e !== elecId) : [...prev.assignedTo, elecId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Job title is required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        client: {
          name: formData.client.name.trim() || 'General Client',
          phone: formData.client.phone || '',
          email: formData.client.email || '',
          address: formData.client.address || formData.location || ''
        }
      };

      if (isEditMode) {
        await api.put(`/jobs/${id}`, payload);
        toast.success('Job updated successfully');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job created successfully');
      }
      navigate('/jobs');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading form...</span>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 880 }}>
      <div className="page-header">
        <div>
          <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
            <FaArrowLeft /> Back to Jobs
          </Link>
          <h1>{isEditMode ? 'Edit Job Assignment' : 'Create New Job'}</h1>
          <div className="page-title-sub">Specify site tasks, client information, and assign electricians</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-card card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>1. Job Overview</h3>
          
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 3-Phase Panel Upgrade & Breaker Testing"
              required
            />
          </div>

          <div className="form-group">
            <label>Detailed Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Scope of work, safety requirements, tools required..."
            />
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High / Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label>Site Location / Area</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Building B, 4th Floor"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Due Date / Target Completion</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Client details */}
        <div className="form-card card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>2. Client / Customer Details</h3>

          {customers.length > 0 && (
            <div className="form-group">
              <label>Import from Registered Customer</label>
              <select onChange={e => handleCustomerSelect(e.target.value)} defaultValue="">
                <option value="">-- Choose customer to auto-fill --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>{c.name} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-grid-2">
            <div className="form-group">
              <label>Client Name</label>
              <input
                type="text"
                value={formData.client.name}
                onChange={e => setFormData({ ...formData, client: { ...formData.client, name: e.target.value } })}
                placeholder="Client or Company Name"
              />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="text"
                value={formData.client.phone}
                onChange={e => setFormData({ ...formData, client: { ...formData.client, phone: e.target.value } })}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.client.email}
                onChange={e => setFormData({ ...formData, client: { ...formData.client, email: e.target.value } })}
                placeholder="client@company.com"
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.client.address}
                onChange={e => setFormData({ ...formData, client: { ...formData.client, address: e.target.value } })}
                placeholder="Site address"
              />
            </div>
          </div>
        </div>

        {/* Assigned Electricians */}
        <div className="form-card card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>3. Assign Electricians</h3>
          
          {electricians.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No electricians registered yet. You can add them under Electricians menu.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {electricians.map(e => {
                const isAssigned = formData.assignedTo.includes(e._id);
                return (
                  <div
                    key={e._id}
                    onClick={() => handleElectricianToggle(e._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: isAssigned ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: isAssigned ? 'var(--primary-dim)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={() => {}}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13, color: isAssigned ? 'var(--text)' : 'var(--text-muted)' }}>
                        {e.name}
                      </div>
                      {e.specialization && (
                        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{e.specialization}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 40 }}>
          <Link to="/jobs" className="btn btn-secondary btn-lg">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : isEditMode ? 'Update Job' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;