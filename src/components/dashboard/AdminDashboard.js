import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { FaBriefcase, FaUsers, FaBoxes, FaFileInvoiceDollar, FaChartBar, FaPlus, FaArrowRight, FaCheckCircle, FaClock } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler);

const statusBadge = (status) => {
  const map = { completed: 'badge-success', 'in-progress': 'badge-info', pending: 'badge-warning', cancelled: 'badge-danger', overdue: 'badge-danger' };
  return `badge ${map[status] || 'badge-muted'}`;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ totalJobs: 0, activeJobs: 0, completedJobs: 0, totalElectricians: 0, totalMaterials: 0, totalRevenue: 0, pendingInvoices: 0, recentJobs: [], electricianPerformance: [], monthlyRevenue: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const statCards = [
    { label: 'Total Jobs', value: data.totalJobs, icon: FaBriefcase, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', link: '/jobs' },
    { label: 'Active Jobs', value: data.activeJobs, icon: FaClock, color: '#22d3ee', bg: 'rgba(34,211,238,0.15)', link: '/jobs' },
    { label: 'Electricians', value: data.totalElectricians, icon: FaUsers, color: '#10b981', bg: 'rgba(16,185,129,0.15)', link: '/electricians' },
    { label: 'Materials', value: data.totalMaterials, icon: FaBoxes, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', link: '/materials' },
    { label: 'Pending Invoices', value: data.pendingInvoices || 0, icon: FaFileInvoiceDollar, color: '#a855f7', bg: 'rgba(168,85,247,0.15)', link: '/invoices' },
    { label: 'Completed', value: data.completedJobs, icon: FaCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)', link: '/jobs' },
  ];

  const quickActions = [
    { label: 'New Job', icon: FaBriefcase, to: '/jobs/create', color: '#6366f1' },
    { label: 'Add Electrician', icon: FaUsers, to: '/electricians/create', color: '#22d3ee' },
    { label: 'New Invoice', icon: FaFileInvoiceDollar, to: '/invoices/create', color: '#10b981' },
    { label: 'Add Customer', icon: FaUsers, to: '/customers/create', color: '#f59e0b' },
    { label: 'Analytics', icon: FaChartBar, to: '/analytics', color: '#a855f7' },
  ];

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e2030', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div><span>Loading dashboard...</span></div>;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]} 👋</h1>
            <p>Here's what's happening with your workforce today</p>
          </div>
          <Link to="/jobs/create" className="btn btn-primary"><FaPlus /> New Job</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color, bg, link }) => (
          <div className="stat-card" key={label} onClick={() => navigate(link)} style={{ cursor: 'pointer' }}>
            <div className="stat-icon" style={{ background: bg, color }}><Icon /></div>
            <div className="stat-card-label">{label}</div>
            <div className="stat-card-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, marginBottom: 20 }}>
        {/* Quick Actions */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quickActions.map(({ label, icon: Icon, to, color }) => (
              <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text)', textDecoration: 'none', transition: 'var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: color + '20', color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon /></div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                <FaArrowRight style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)' }} />
              </Link>
            ))}
          </div>
        </div>

        {/* Revenue Chart (if data exists) */}
        <div className="analytics-chart-card" style={{ padding: 20 }}>
          <h3>Electrician Performance</h3>
          {data.electricianPerformance?.length > 0 ? (
            <Bar data={{
              labels: data.electricianPerformance.map(e => e.name),
              datasets: [{ label: 'Jobs Completed', data: data.electricianPerformance.map(e => e.completedJobs || 0), backgroundColor: 'rgba(99,102,241,0.7)', borderRadius: 6 }]
            }} options={chartOptions} />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><FaChartBar /></div>
              <p>No performance data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="table-container">
        <div className="section-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h2>Recent Jobs</h2>
          <Link to="/jobs" className="btn btn-secondary btn-sm">View All <FaArrowRight style={{ fontSize: 10 }} /></Link>
        </div>
        {data.recentJobs?.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Client</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Priority</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.recentJobs.slice(0, 8).map(job => (
                <tr key={job._id}>
                  <td style={{ fontWeight: 500 }}>{job.title}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{job.client?.name}</td>
                  <td>
                    {job.assignedTo?.length > 0 ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {job.assignedTo.slice(0, 2).map(e => (
                          <span key={e._id} className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>{e.name?.[0]}</span>
                        ))}
                        {job.assignedTo.length > 2 && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{job.assignedTo.length - 2}</span>}
                      </div>
                    ) : <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>Unassigned</span>}
                  </td>
                  <td><span className={statusBadge(job.status)} style={{ textTransform: 'capitalize' }}>{job.status?.replace('-', ' ')}</span></td>
                  <td>
                    <span style={{ fontSize: 11, fontWeight: 600, color: job.priority === 'high' ? 'var(--danger)' : job.priority === 'medium' ? 'var(--warning)' : 'var(--text-muted)' }}>
                      {job.priority?.toUpperCase()}
                    </span>
                  </td>
                  <td><Link to={`/jobs/${job._id}`} style={{ color: 'var(--primary)', fontSize: 12 }}>View →</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon"><FaBriefcase /></div>
            <h3>No jobs yet</h3>
            <p>Create your first job to get started</p>
            <Link to="/jobs/create" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}><FaPlus /> Create Job</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;