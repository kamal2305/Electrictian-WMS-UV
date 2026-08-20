import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/axios';
import TimeLogButton from '../timelogs/TimeLogButton';
import TimeLogList from '../timelogs/TimeLogList';
import MaterialForm from '../materials/MaterialForm';
import MaterialList from '../materials/MaterialList';
import { FaArrowLeft, FaEdit, FaMapMarkerAlt, FaCalendarAlt, FaTrash, FaFileInvoiceDollar, FaUserTie } from 'react-icons/fa';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const fetchJobDetails = useCallback(async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data.data);
    } catch (err) {
      toast.error('Error fetching job details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.put(`/jobs/${id}/status`, { status: newStatus });
      fetchJobDetails();
      toast.success('Job status updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating job status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted successfully');
      navigate('/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting job');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading job details...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-container">
        <div className="empty-state card">
          <h3>Job Not Found</h3>
          <Link to="/jobs" className="btn btn-secondary" style={{ marginTop: 16 }}>Back to Jobs</Link>
        </div>
      </div>
    );
  }

  const assignedList = job.assignedTo || job.assignedElectricians || [];
  const isAssigned = assignedList.some(e => (e._id || e) === user?.id);
  const canUpdateStatus = user?.role === 'admin' || isAssigned;

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase().replace(' ', '-');
    if (s === 'completed') return 'badge-success';
    if (s === 'in-progress') return 'badge-info';
    if (s === 'not-started') return 'badge-warning';
    if (s === 'cancelled') return 'badge-danger';
    return 'badge-muted';
  };

  return (
    <div className="page-container" style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
            <FaArrowLeft /> Back to Jobs
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1>{job.title}</h1>
            <span className={`badge ${getStatusBadge(job.status)}`}>{job.status}</span>
          </div>
        </div>
        <div className="action-buttons">
          {user?.role === 'admin' && (
            <>
              <Link to={`/invoices/create?jobId=${job._id}`} className="btn btn-primary">
                <FaFileInvoiceDollar /> Generate Bill
              </Link>
              <Link to={`/jobs/${id}/edit`} className="btn btn-secondary">
                <FaEdit /> Edit
              </Link>
              <button onClick={handleDelete} className="btn btn-danger">
                <FaTrash /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info Overview Cards */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Site & Schedule</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaMapMarkerAlt style={{ color: 'var(--warning)' }} />
              <span>{job.location || 'No location specified'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaCalendarAlt style={{ color: 'var(--accent)' }} />
              <span>Start: {new Date(job.startDate).toLocaleDateString('en-IN')}</span>
            </div>
            {job.dueDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FaCalendarAlt style={{ color: 'var(--danger)' }} />
                <span>Due: {new Date(job.dueDate).toLocaleDateString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Client Info</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FaUserTie style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: 600 }}>{job.client?.name || 'N/A'}</span>
            </div>
            {job.client?.phone && <div style={{ color: 'var(--text-muted)' }}>Ph: {job.client.phone}</div>}
            {job.client?.address && <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>{job.client.address}</div>}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>Status & Action</div>
          {canUpdateStatus && (
            <div style={{ marginBottom: 10 }}>
              <select
                value={job.status}
                onChange={e => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                style={{ padding: '6px 10px', fontSize: 13 }}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}
          {isAssigned && user?.role === 'electrician' && (
            <TimeLogButton jobId={id} />
          )}
        </div>
      </div>

      {/* Description */}
      {job.description && (
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Scope of Work</div>
          <p style={{ fontSize: 14, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{job.description}</p>
        </div>
      )}

      {/* Electricians */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Assigned Team</div>
        {assignedList.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>No electricians assigned yet.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {assignedList.map(e => (
              <div key={e._id || e} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{e.name ? e.name[0] : 'E'}</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{e.name || 'Electrician'}</div>
                  {e.email && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.email}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs for Timelogs & Materials */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`btn btn-sm ${activeTab === 'details' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timelogs')}
            className={`btn btn-sm ${activeTab === 'timelogs' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Time Logs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`btn btn-sm ${activeTab === 'materials' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Materials & Parts
          </button>
        </div>

        {activeTab === 'timelogs' && <TimeLogList jobId={id} />}
        {activeTab === 'materials' && (
          <div>
            {user?.role === 'electrician' && isAssigned && (
              <MaterialForm jobId={id} onMaterialAdded={fetchJobDetails} />
            )}
            <MaterialList jobId={id} />
          </div>
        )}
        {activeTab === 'details' && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Switch to <b>Time Logs</b> to review check-ins, or <b>Materials</b> to inspect parts used on site.
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;