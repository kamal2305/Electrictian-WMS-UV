import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import {
  FaBriefcase, FaUsers, FaBoxes, FaFileInvoiceDollar,
  FaChartBar, FaPlus, FaArrowRight, FaCheckCircle,
  FaClock, FaBolt
} from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler);

const statusBadge = (status) => {
  const map = {
    completed: 'badge-success',
    'in-progress': 'badge-info',
    pending: 'badge-warning',
    cancelled: 'badge-danger',
    overdue: 'badge-danger'
  };
  return `badge ${map[status] || 'badge-muted'}`;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalJobs: 0,
    activeJobs: 0,
    completedJobs: 0,
    totalElectricians: 0,
    totalMaterials: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    recentJobs: [],
    electricianPerformance: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards = [
    { label: 'Total Jobs', value: data.totalJobs, icon: FaBriefcase, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', link: '/jobs', change: '+12% this mo' },
    { label: 'Active Jobs', value: data.activeJobs, icon: FaClock, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', link: '/jobs', change: 'Live in field' },
    { label: 'Electricians', value: data.totalElectricians, icon: FaUsers, color: '#10b981', bg: 'rgba(16,185,129,0.15)', link: '/electricians', change: 'Certified crew' },
    { label: 'Materials SKU', value: data.totalMaterials, icon: FaBoxes, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', link: '/materials', change: 'Inventory tracked' },
    { label: 'Pending Invoices', value: data.pendingInvoices || 0, icon: FaFileInvoiceDollar, color: '#a855f7', bg: 'rgba(168,85,247,0.15)', link: '/invoices', change: 'Awaiting clearance' },
    { label: 'Jobs Completed', value: data.completedJobs, icon: FaCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)', link: '/jobs', change: '100% verified' },
  ];

  const quickActions = [
    { label: 'Dispatch Job', sub: 'Assign crew to field ticket', icon: FaBriefcase, to: '/jobs/create', color: '#6366f1' },
    { label: 'Onboard Electrician', sub: 'Register new technician', icon: FaUsers, to: '/electricians/create', color: '#06b6d4' },
    { label: 'Generate Invoice', sub: 'Itemized billing & PDF export', icon: FaFileInvoiceDollar, to: '/invoices/create', color: '#10b981' },
    { label: 'New Client CRM', sub: 'Add customer & GST details', icon: FaUsers, to: '/customers/create', color: '#f59e0b' },
    { label: 'Analytics Hub', sub: 'Financial & performance trends', icon: FaChartBar, to: '/analytics', color: '#a855f7' },
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0f121d' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#94a3b8' : '#64748b',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'Inter', size: 11 } }
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Synchronizing operations telemetry...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* High-Tech Hero Operations Banner */}
      <div className="dashboard-hero-banner glow-accent">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '4px 10px', background: 'var(--primary-dim)', borderRadius: 20, border: '1px solid rgba(99,102,241,0.3)', fontSize: 11, fontWeight: 700, color: 'var(--primary-hover)' }}>
              <FaBolt /> OPERATIONS CONTROL CENTER
            </div>
            <h1 className="dashboard-hero-title">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}
            </h1>
            <p className="dashboard-hero-sub">
              Workforce status: <span style={{ color: 'var(--success)', fontWeight: 600 }}>Active</span> · {data.activeJobs} Jobs in progress across field technicians.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/jobs/create" className="btn btn-primary">
              <FaPlus /> <span>New Job Dispatch</span>
            </Link>
            <Link to="/analytics" className="btn btn-secondary">
              <FaChartBar /> <span>BI Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color, bg, link, change }) => (
          <div
            className="stat-card"
            key={label}
            onClick={() => navigate(link)}
            title={`View ${label}`}
          >
            <div className="stat-icon" style={{ background: bg, color }}>
              <Icon />
            </div>
            <div className="stat-card-label">{label}</div>
            <div className="stat-card-value" style={{ color }}>
              {value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4, fontWeight: 500 }}>
              {change}
            </div>
          </div>
        ))}
      </div>

      {/* Bento Grid: Quick Commands & Performance Visualization */}
      <div className="bento-grid">
        {/* Bento Column 1: Quick Command Hub */}
        <div className="bento-col-4">
          <div className="bento-tile" style={{ padding: 22, height: '100%' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Quick Commands</h3>
              <span className="badge badge-info">Fast Track</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Instant shortcuts to trigger core workflows
            </p>
            <div className="command-pill-grid">
              {quickActions.map(({ label, sub, icon: Icon, to, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="command-pill-item"
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.boxShadow = `0 4px 14px ${color}25`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="command-pill-icon" style={{ background: `${color}18`, color }}>
                    <Icon />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 500 }}>{sub}</span>
                  </div>
                  <FaArrowRight style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-dim)' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bento Column 2: Electrician Performance Tile */}
        <div className="bento-col-8">
          <div className="bento-tile" style={{ padding: 22, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Electrician Performance</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Completed jobs distribution per technician
                </p>
              </div>
              <Link to="/reports/attendance" className="btn btn-secondary btn-sm">
                Attendance Log <FaArrowRight style={{ fontSize: 10 }} />
              </Link>
            </div>

            <div style={{ flex: 1, minHeight: 220, position: 'relative', marginTop: 12 }}>
              {data.electricianPerformance?.length > 0 ? (
                <Bar
                  data={{
                    labels: data.electricianPerformance.map(e => e.name),
                    datasets: [
                      {
                        label: 'Jobs Completed',
                        data: data.electricianPerformance.map(e => e.completedJobs || 0),
                        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.8)' : 'rgba(79, 70, 229, 0.85)',
                        hoverBackgroundColor: isDark ? '#818cf8' : '#6366f1',
                        borderRadius: 8,
                        borderSkipped: false
                      }
                    ]
                  }}
                  options={chartOptions}
                />
              ) : (
                <div className="empty-state" style={{ padding: '30px 10px' }}>
                  <div className="empty-state-icon"><FaChartBar /></div>
                  <p style={{ fontSize: 13 }}>No technician performance records for this period</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Row 2: Live Activity & Recent Jobs Feed */}
      <div className="table-container glow-accent">
        <div className="section-header" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="pulse-indicator"></span>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>Recent Job Dispatches</h2>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Live updates from technician field activity</span>
            </div>
          </div>
          <Link to="/jobs" className="btn btn-secondary btn-sm">
            All Jobs Registry <FaArrowRight style={{ fontSize: 10 }} />
          </Link>
        </div>

        {data.recentJobs?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Client</th>
                  <th>Assigned Crew</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.recentJobs.slice(0, 8).map(job => (
                  <tr key={job._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FaBolt style={{ color: 'var(--primary)', fontSize: 12 }} />
                        {job.title}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {job.client?.name || 'Standard Client'}
                    </td>
                    <td>
                      {job.assignedTo?.length > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {job.assignedTo.slice(0, 2).map(e => (
                            <span key={e._id} className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                              {e.name?.[0]}
                            </span>
                          ))}
                          {job.assignedTo.length > 2 && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                              +{job.assignedTo.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: 12, fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={statusBadge(job.status)}>
                        {job.status?.replace('-', ' ')}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        color: job.priority === 'high' ? 'var(--danger)' : job.priority === 'medium' ? 'var(--warning)' : 'var(--text-dim)'
                      }}>
                        {job.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '48px 20px' }}>
            <div className="empty-state-icon"><FaBriefcase /></div>
            <h3>No jobs active yet</h3>
            <p>Dispatch your first work ticket to start monitoring your crew.</p>
            <Link to="/jobs/create" className="btn btn-primary btn-sm" style={{ marginTop: 14 }}>
              <FaPlus /> Create Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;