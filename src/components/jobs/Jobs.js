import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import {
  FaPlus, FaSearch, FaEdit
} from 'react-icons/fa';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/jobs';
      const params = new URLSearchParams();
      if (statusTab !== 'all') {
        const mappedStatus = statusTab === 'in-progress' ? 'In Progress' : statusTab === 'completed' ? 'Completed' : 'Not Started';
        params.append('status', mappedStatus);
      }
      if (priorityFilter) params.append('priority', priorityFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data.success) {
        setJobs(res.data.data);
      }
    } catch (err) {
      toast.error('Error fetching work orders');
    } finally {
      setLoading(false);
    }
  }, [statusTab, priorityFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = jobs.filter(job => {
    const term = searchTerm.toLowerCase();
    const title = (job.title || '').toLowerCase();
    const client = (job.client?.name || '').toLowerCase();
    const loc = (job.location || '').toLowerCase();
    return title.includes(term) || client.includes(term) || loc.includes(term);
  });

  const getPriorityColor = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p === 'high' || p === 'urgent' || p === 'critical') return 'var(--danger)';
    if (p === 'medium') return 'var(--primary)';
    return 'var(--text-dim)';
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Work Orders & Dispatch
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0', maxWidth: 600 }}>
            Live ticket registry, field technician deployments, site locations, and execution status.
          </p>
        </div>

        {user?.role === 'admin' && (
          <Link
            to="/jobs/create"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_box</span>
            <span>New Work Order</span>
          </Link>
        )}
      </div>

      {/* Filter Tabs & Search Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        paddingBottom: 12,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {/* Status Filter Tabs (Stitch Pills) */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'in-progress', label: 'In Progress', icon: true },
            { key: 'pending', label: 'Pending Dispatch' },
            { key: 'completed', label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className="font-label-caps"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: statusTab === tab.key ? 'var(--primary)' : 'var(--bg-card)',
                color: statusTab === tab.key ? 'var(--primary-text)' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {tab.icon && <span className="live-beacon" style={{ width: 5, height: 5 }}></span>}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Priority Selector */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            minWidth: 260
          }}>
            <FaSearch style={{ color: 'var(--text-muted)', fontSize: 12 }} />
            <input
              type="text"
              placeholder="Search work order, site, client..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: 'var(--text)',
                padding: 0,
                width: '100%'
              }}
            />
          </div>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: 12,
              width: 'auto'
            }}
          >
            <option value="">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Work Orders Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading work order telemetry...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 12 }}>assignment</span>
          <h3>No Work Orders Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 400, margin: '8px auto 16px' }}>
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first work order ticket to dispatch crew.'}
          </p>
          <Link to="/jobs/create" className="btn btn-primary btn-sm">
            <FaPlus /> New Work Order
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20
        }}>
          {filteredJobs.map(job => {
            const priorityColor = getPriorityColor(job.priority);
            const isCompleted = (job.status || '').toLowerCase() === 'completed';
            const isInProgress = (job.status || '').toLowerCase() === 'in-progress' || (job.status || '').toLowerCase() === 'in progress';

            return (
              <div
                key={job._id}
                className="card"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'var(--transition)'
                }}
              >
                {/* Top Priority Accent Line (Stitch styled) */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: priorityColor
                }}></div>

                {/* Ticket Header: Code + Priority + Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="font-data-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                        WO-{job._id.slice(-5).toUpperCase()}
                      </span>
                      <span
                        className="font-label-caps"
                        style={{
                          fontSize: 9,
                          color: priorityColor,
                          background: `${priorityColor}15`,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-xs)',
                          border: `1px solid ${priorityColor}35`
                        }}
                      >
                        {job.priority || 'NORMAL'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {job.title}
                    </h3>
                  </div>

                  {/* Status Chip */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-xs)',
                    background: isInProgress ? 'rgba(190, 209, 52, 0.12)' : isCompleted ? 'rgba(191, 208, 79, 0.12)' : 'rgba(255, 180, 168, 0.12)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {isInProgress && <span className="live-beacon" style={{ width: 5, height: 5 }}></span>}
                    <span className="font-label-caps" style={{
                      fontSize: 10,
                      color: isInProgress ? 'var(--accent)' : isCompleted ? 'var(--teal)' : 'var(--primary)'
                    }}>
                      {job.status || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Location / Site */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--primary)' }}>location_on</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {job.location || job.siteAddress || 'Site Location Assigned'}
                  </span>
                </div>

                {/* Assigned Technicians */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {job.assignedTo && job.assignedTo.length > 0 ? (
                      <>
                        <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                          {job.assignedTo[0].name?.[0] || 'T'}
                        </div>
                        <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                          {job.assignedTo[0].name}
                          {job.assignedTo.length > 1 && ` (+${job.assignedTo.length - 1})`}
                        </span>
                      </>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Unassigned Crew
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
                    <span className="font-data-mono" style={{ fontSize: 11 }}>
                      {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Scheduled'}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                  <Link
                    to={`/jobs/${job._id}`}
                    style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    View Details →
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to={`/jobs/${job._id}/edit`}
                      className="btn btn-secondary btn-sm"
                      title="Edit Work Order"
                    >
                      <FaEdit />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Jobs;