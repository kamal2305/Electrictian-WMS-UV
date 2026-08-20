import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaBriefcase, FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let url = '/jobs';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      toast.error('Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter]);

  const filteredJobs = jobs.filter(job => {
    const term = searchTerm.toLowerCase();
    const title = (job.title || '').toLowerCase();
    const client = (job.client?.name || '').toLowerCase();
    const loc = (job.location || '').toLowerCase();
    return title.includes(term) || client.includes(term) || loc.includes(term);
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase().replace(' ', '-');
    if (s === 'completed') return 'badge-success';
    if (s === 'in-progress') return 'badge-info';
    if (s === 'not-started' || s === 'pending') return 'badge-warning';
    if (s === 'cancelled') return 'badge-danger';
    return 'badge-muted';
  };

  const getPriorityColor = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high') return 'var(--danger)';
    if (p === 'medium') return 'var(--warning)';
    return 'var(--text-muted)';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Jobs Management</h1>
          <div className="page-title-sub">Track work orders, site assignments, schedules, and deliverables</div>
        </div>
        {user?.role === 'admin' && (
          <Link to="/jobs/create" className="btn btn-primary">
            <FaPlus /> Create New Job
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
          <FaSearch className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search by job title, client, or location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading jobs...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><FaBriefcase /></div>
          <h3>No Jobs Found</h3>
          <p>{searchTerm || statusFilter ? 'Try clearing your search filters' : 'Create your first job assignment to get started'}</p>
          {user?.role === 'admin' && !searchTerm && !statusFilter && (
            <Link to="/jobs/create" className="btn btn-primary" style={{ marginTop: 16 }}>
              <FaPlus /> Create New Job
            </Link>
          )}
        </div>
      ) : (
        <div className="grid-2">
          {filteredJobs.map(job => (
            <div key={job._id} className="card job-card">
              <div className="job-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={`badge ${getStatusBadge(job.status)}`}>
                      {job.status}
                    </span>
                    {job.priority && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: getPriorityColor(job.priority), textTransform: 'uppercase' }}>
                        ● {job.priority}
                      </span>
                    )}
                  </div>
                  <h3 className="job-card-title">{job.title}</h3>
                </div>
                <Link to={`/jobs/${job._id}`} className="btn btn-secondary btn-sm">
                  View Details →
                </Link>
              </div>

              {job.description && (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {job.description}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 12 }}>
                {job.client?.name && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--text)', fontWeight: 500 }}>Client:</span>
                    <span>{job.client.name}</span>
                    {job.client.phone && <span style={{ color: 'var(--text-dim)' }}>({job.client.phone})</span>}
                  </div>
                )}
                {job.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaMapMarkerAlt style={{ color: 'var(--warning)', fontSize: 12 }} />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.dueDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaCalendarAlt style={{ color: 'var(--accent)', fontSize: 12 }} />
                    <span>Due: {new Date(job.dueDate).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Assigned Electricians */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaUsers style={{ color: 'var(--primary)', fontSize: 13 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Assigned:</span>
                  {job.assignedTo?.length > 0 ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      {job.assignedTo.map(e => (
                        <span key={e._id || e} className="avatar" style={{ width: 24, height: 24, fontSize: 10 }} title={e.name || 'Electrician'}>
                          {e.name ? e.name[0] : 'E'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>None</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {user?.role === 'admin' && (
                    <Link to={`/invoices/create?jobId=${job._id}`} className="btn btn-outline btn-sm" title="Generate Bill for this Job">
                      Bill Job
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;