import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    totalElectricians: 0,
    totalMaterials: 0,
    lowStockCount: 0,
    lowStockItems: [],
    totalRevenue: 0,
    pendingRevenue: 0,
    pendingInvoices: 0,
    recentJobs: [],
    electricianPerformance: [],
    liveActivities: [],
    weeklyVelocity: []
  });
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState('30D');

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Synchronizing live operations telemetry...</span>
      </div>
    );
  }

  // Format currency in INR
  const formattedRevenue = `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`;
  const formattedPending = `₹${(data.pendingRevenue || 0).toLocaleString('en-IN')}`;

  // Helper for human-readable time diff
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Top Metrics Row (Live Database Telemetry) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20
      }}>
        {/* Metric 1: Active Work Orders */}
        <div
          className="card"
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/jobs')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>ACTIVE WORK ORDERS</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 22 }}>assignment</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, zIndex: 2, marginTop: 4 }}>
            <span className="font-display-stat" style={{ color: 'var(--text-primary)' }}>{data.activeJobs || 0}</span>
            <span className="font-data-mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              {data.totalJobs} Total Orders
            </span>
          </div>
        </div>

        {/* Metric 2: Low Stock Alerts */}
        <div
          className="card"
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/materials')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>LOW STOCK ALERTS</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {data.lowStockCount > 0 && <span className="pulse-indicator" style={{ background: 'var(--danger)' }}></span>}
              <span className="material-symbols-outlined" style={{ color: data.lowStockCount > 0 ? 'var(--danger)' : 'var(--success)', fontSize: 22 }}>
                {data.lowStockCount > 0 ? 'warning' : 'check_circle'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, zIndex: 2, marginTop: 4 }}>
            <span className="font-display-stat" style={{ color: data.lowStockCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {data.lowStockCount || 0}
            </span>
            <span className="font-data-mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              {data.lowStockCount > 0 ? 'SKUs Need Reorder' : 'Inventory Optimal'}
            </span>
          </div>
        </div>

        {/* Metric 3: Staff on Site */}
        <div
          className="card"
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/electricians')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>FIELD TECHNICIANS</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 22 }}>engineering</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, zIndex: 2, marginTop: 4 }}>
            <span className="font-display-stat" style={{ color: 'var(--text-primary)' }}>{data.totalElectricians || 0}</span>
            <span className="font-data-mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>Active Crew</span>
          </div>
        </div>

        {/* Metric 4: Total Collected Revenue */}
        <div
          className="card"
          style={{
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/invoices')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>COLLECTED REVENUE</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--teal)', fontSize: 22 }}>payments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, zIndex: 2, marginTop: 4 }}>
            <span className="font-display-stat" style={{ color: 'var(--text-primary)', fontSize: 26 }}>{formattedRevenue}</span>
            <span className="font-data-mono" style={{ color: 'var(--warning)', fontSize: 11 }}>
              {formattedPending} Pending
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Grid Layout (Left: Chart & Activity, Right: Command Center & Alerts) */}
      <div className="admin-grid-layout">
        {/* Left Column (Main Area) */}
        <div className="admin-grid-main">
          {/* Inventory & Flow Chart Overview */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Workforce & Dispatch Velocity
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live ticket creation and fulfillment telemetry</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['7D', '30D', '3M'].map(range => (
                  <button
                    key={range}
                    onClick={() => setChartRange(range)}
                    className="font-label-caps"
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-xs)',
                      background: chartRange === range ? 'var(--primary)' : 'var(--bg-elevated)',
                      color: chartRange === range ? 'var(--primary-text)' : 'var(--text)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)'
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Dynamic Flow Chart */}
            <div style={{ height: 180, width: '100%', position: 'relative', marginTop: 8 }}>
              <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 800 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="stitchGradPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="45" x2="800" y2="45" stroke="var(--border)" strokeOpacity="0.3" strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="800" y2="90" stroke="var(--border)" strokeOpacity="0.3" strokeDasharray="4 4" />
                <line x1="0" y1="135" x2="800" y2="135" stroke="var(--border)" strokeOpacity="0.3" strokeDasharray="4 4" />

                {/* Primary Wave Curve */}
                <path
                  d="M0,130 Q200,90 400,110 T800,60 L800,180 L0,180 Z"
                  fill="url(#stitchGradPrimary)"
                />
                <path
                  d="M0,130 Q200,90 400,110 T800,60"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', color: 'var(--text-muted)', fontSize: 11 }} className="font-data-mono">
                <span>Completed: {data.completedJobs || 0}</span>
                <span>Active: {data.activeJobs || 0}</span>
                <span>Pending: {data.pendingJobs || 0}</span>
                <span>Total: {data.totalJobs || 0}</span>
              </div>
            </div>
          </div>

          {/* Recent Live Activity Stream (100% Real Database Records) */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="live-beacon"></span>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Live Operations Stream
                </h2>
              </div>
              <Link to="/jobs" style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em' }} className="font-label-caps">
                VIEW ALL JOBS
              </Link>
            </div>

            {data.liveActivities && data.liveActivities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.liveActivities.map((act) => (
                  <Link
                    key={act.id}
                    to={act.link || '#'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 14px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'var(--transition-fast)',
                      textDecoration: 'none'
                    }}
                  >
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-card)',
                      color: act.color || 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid var(--border)'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{act.icon || 'info'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {act.title}
                      </span>
                      <span className="font-data-mono" style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {act.subtitle}
                      </span>
                    </div>
                    <span className="font-data-mono" style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                      {formatTimeAgo(act.timestamp)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', fontSize: 13 }}>
                No recent activity recorded yet. Create a work order or log hours to see real-time updates.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Side Area: Command Actions & Live Alerts) */}
        <div className="admin-grid-side">
          {/* Command Center Panel */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="font-title-md" style={{ color: 'var(--text-primary)', marginBottom: 4 }}>
              Command Actions
            </span>

            {/* Primary Action */}
            <Link
              to="/jobs/create"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_box</span>
              <span>New Work Order</span>
            </Link>

            {/* Secondary Action: Invoices */}
            <Link
              to="/invoices/create"
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>receipt_long</span>
              <span>Generate Invoice</span>
            </Link>

            {/* Sub Actions (2-Column Grid) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
              <Link
                to="/materials/create"
                className="btn btn-secondary"
                style={{
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  textAlign: 'center'
                }}
              >
                <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 20 }}>inventory_2</span>
                <span className="font-label-caps">Add SKU</span>
              </Link>

              <Link
                to="/reports/attendance"
                className="btn btn-secondary"
                style={{
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  textAlign: 'center'
                }}
              >
                <span className="material-symbols-outlined" style={{ color: 'var(--teal)', fontSize: 20 }}>calendar_today</span>
                <span className="font-label-caps">Timesheets</span>
              </Link>
            </div>
          </div>

          {/* Live Critical Stock Alerts from Database */}
          {data.lowStockItems && data.lowStockItems.length > 0 && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--danger)', fontSize: 20 }}>warning</span>
                <span className="font-title-md" style={{ color: 'var(--danger)', fontSize: 14 }}>Inventory Alerts</span>
              </div>

              {data.lowStockItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--bg-elevated)',
                    borderLeft: '3px solid var(--danger)',
                    padding: 12,
                    borderRadius: '0 var(--radius-xs) var(--radius-xs) 0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="font-data-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)' }}>
                      {item.sku || item.name}
                    </span>
                    <span className="font-data-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      Min: {item.minStock} {item.unit}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
                    Current stock depleted to <strong>{item.quantity} {item.unit}</strong>.
                  </p>
                  <Link to="/materials" className="font-label-caps" style={{ display: 'inline-block', marginTop: 8, fontSize: 10, color: 'var(--primary)' }}>
                    RESTOCK SKU →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Real Electrician Performance from DB */}
          {data.electricianPerformance && data.electricianPerformance.length > 0 && (
            <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-title-md" style={{ fontSize: 14, color: 'var(--text-primary)' }}>Technician Deployment</span>
                <Link to="/electricians" className="font-label-caps" style={{ fontSize: 10, color: 'var(--primary)' }}>
                  VIEW ALL
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.electricianPerformance.slice(0, 4).map(elec => (
                  <div
                    key={elec.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar" style={{ width: 26, height: 26, fontSize: 10 }}>
                        {elec.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{elec.name}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{elec.specialization}</span>
                      </div>
                    </div>
                    <div className="font-data-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
                      {elec.completedJobs} done
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;