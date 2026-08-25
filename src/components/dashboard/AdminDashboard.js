import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { toast } from 'react-toastify';


const AdminDashboard = () => {
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
        <span>Synchronizing operations telemetry...</span>
      </div>
    );
  }

  // Format currency in INR / standard format
  const formattedRevenue = `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`;

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. Top Metrics Row (Stitch 4-Card Grid) */}
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
          <div style={{
            position: 'absolute',
            right: -16,
            top: -16,
            width: 96,
            height: 96,
            background: 'rgba(255, 180, 168, 0.08)',
            borderRadius: '50%',
            filter: 'blur(20px)'
          }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>ACTIVE WORK ORDERS</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 22 }}>assignment</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, zIndex: 2, marginTop: 4 }}>
            <span className="font-display-stat" style={{ color: 'var(--text-primary)' }}>{data.activeJobs || 0}</span>
            <span className="font-data-mono" style={{ color: 'var(--accent)', fontSize: 12 }}>+12%</span>
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
          <div style={{
            position: 'absolute',
            right: -16,
            top: -16,
            width: 96,
            height: 96,
            background: 'rgba(255, 180, 171, 0.08)',
            borderRadius: '50%',
            filter: 'blur(20px)'
          }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>LOW STOCK ALERTS</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="pulse-indicator" style={{ background: 'var(--danger)', boxShadow: '0 0 0 rgba(255, 180, 171, 0.7)' }}></span>
              <span className="material-symbols-outlined" style={{ color: 'var(--danger)', fontSize: 22 }}>warning</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, zIndex: 2, marginTop: 4 }}>
            <span className="font-display-stat" style={{ color: 'var(--danger)' }}>{data.totalMaterials > 0 ? '4' : '0'}</span>
            <span className="font-data-mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>Items Critical</span>
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
          <div style={{
            position: 'absolute',
            right: -16,
            top: -16,
            width: 96,
            height: 96,
            background: 'rgba(190, 209, 52, 0.08)',
            borderRadius: '50%',
            filter: 'blur(20px)'
          }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>STAFF ON SITE</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 22 }}>engineering</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, zIndex: 2, marginTop: 4 }}>
            <span className="font-display-stat" style={{ color: 'var(--text-primary)' }}>{data.totalElectricians || 0}</span>
            <span className="font-data-mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>Active Technicians</span>
          </div>
        </div>

        {/* Metric 4: Monthly Revenue */}
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
          <div style={{
            position: 'absolute',
            right: -16,
            top: -16,
            width: 96,
            height: 96,
            background: 'rgba(191, 208, 79, 0.08)',
            borderRadius: '50%',
            filter: 'blur(20px)'
          }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>TOTAL REVENUE</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--teal)', fontSize: 22 }}>payments</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, zIndex: 2, marginTop: 4 }}>
            <span className="font-display-stat" style={{ color: 'var(--text-primary)', fontSize: 26 }}>{formattedRevenue}</span>
            <span className="font-data-mono" style={{ color: 'var(--accent)', fontSize: 12 }}>+5.4%</span>
          </div>
        </div>
      </div>

      {/* 2. Main Grid Layout (Left: Chart & Activity, Right: Command Center & Alerts) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 24
      }}>
        {/* Left Column (8 Spans) */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Inventory & Flow Chart Overview */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Workforce & Inventory Velocity
                </h2>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live dispatch & throughput trends</span>
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
                      color: chartRange === range ? '#690000' : 'var(--text)',
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

            {/* SVG Wave Flow Chart (Stitch styled) */}
            <div style={{ height: 180, width: '100%', position: 'relative', marginTop: 8 }}>
              <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 800 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="stitchGradPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffb4a8" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#ffb4a8" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="stitchGradSecondary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bed134" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#bed134" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="45" x2="800" y2="45" stroke="var(--border)" strokeOpacity="0.3" strokeDasharray="4 4" />
                <line x1="0" y1="90" x2="800" y2="90" stroke="var(--border)" strokeOpacity="0.3" strokeDasharray="4 4" />
                <line x1="0" y1="135" x2="800" y2="135" stroke="var(--border)" strokeOpacity="0.3" strokeDasharray="4 4" />

                {/* Primary Wave */}
                <path
                  d="M0,140 Q100,110 200,120 T400,90 T600,120 T800,70 L800,180 L0,180 Z"
                  fill="url(#stitchGradPrimary)"
                />
                <path
                  d="M0,140 Q100,110 200,120 T400,90 T600,120 T800,70"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                />

                {/* Secondary Wave */}
                <path
                  d="M0,90 Q150,60 300,80 T500,50 T700,70 T800,30 L800,180 L0,180 Z"
                  fill="url(#stitchGradSecondary)"
                />
                <path
                  d="M0,90 Q150,60 300,80 T500,50 T700,70 T800,30"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                />
              </svg>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', color: 'var(--text-muted)', fontSize: 11 }} className="font-data-mono">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>

          {/* Recent Live Activity Feed (Stitch Stream) */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="live-beacon"></span>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Recent Live Activity
                </h2>
              </div>
              <Link to="/jobs" style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em' }} className="font-label-caps">
                VIEW ALL JOBS
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Activity Item 1: Dispatched */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                transition: 'var(--transition-fast)'
              }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255, 180, 168, 0.15)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>inventory_2</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Received 500x Copper Wire Spools (12 AWG)
                  </span>
                  <span className="font-data-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    PO-2026-8991 • Dock 4 Inventory
                  </span>
                </div>
                <span className="font-data-mono" style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                  2m ago
                </span>
              </div>

              {/* Activity Item 2: Job Dispatch */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                transition: 'var(--transition-fast)'
              }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(190, 209, 52, 0.15)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>local_shipping</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Dispatched 12 Transformers to Substation Site C
                  </span>
                  <span className="font-data-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    WO-9921-A • Assigned Crew
                  </span>
                </div>
                <span className="font-data-mono" style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                  15m ago
                </span>
              </div>

              {/* Activity Item 3: Maintenance Flag */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                transition: 'var(--transition-fast)'
              }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255, 180, 171, 0.15)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>build</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Voltage anomaly detected at Sector 4 Panel
                  </span>
                  <span className="font-data-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Inspection required • Technician flagged
                  </span>
                </div>
                <span className="font-data-mono" style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                  1h ago
                </span>
              </div>

              {/* Activity Item 4: Audit */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                transition: 'var(--transition-fast)'
              }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(191, 208, 79, 0.15)',
                  color: 'var(--teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>done_all</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Inventory Audit Completed (Aisle 12-14)
                  </span>
                  <span className="font-data-mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Variance: 0.02% • Verified OK
                  </span>
                </div>
                <span className="font-data-mono" style={{ fontSize: 11, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                  3h ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Spans) */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Command Center Panel */}
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span className="font-title-md" style={{ color: 'var(--text-primary)', marginBottom: 4 }}>
              Command Center
            </span>

            {/* Primary Action */}
            <Link
              to="/jobs/create"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_box</span>
              <span>New Work Order</span>
            </Link>

            {/* Secondary Action: Scan */}
            <Link
              to="/materials"
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>qr_code_scanner</span>
              <span>Scan Barcode / SKU</span>
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
                <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 20 }}>input</span>
                <span className="font-label-caps">Receive Stock</span>
              </Link>

              <Link
                to="/jobs"
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
                <span className="material-symbols-outlined" style={{ color: 'var(--teal)', fontSize: 20 }}>output</span>
                <span className="font-label-caps">Dispatch Crew</span>
              </Link>
            </div>
          </div>

          {/* Critical Alerts Panel */}
          <div style={{
            background: 'rgba(255, 180, 171, 0.08)',
            border: '1px solid rgba(255, 180, 171, 0.25)',
            borderRadius: 'var(--radius)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 14
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--danger)', fontSize: 22 }}>warning</span>
              <span className="font-title-md" style={{ color: 'var(--danger)', fontSize: 15 }}>Critical Alerts</span>
            </div>

            {/* Alert 1 */}
            <div style={{
              background: 'var(--bg-elevated)',
              borderLeft: '3px solid var(--danger)',
              padding: 12,
              borderRadius: '0 var(--radius-xs) var(--radius-xs) 0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="font-data-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)' }}>SKU-BRK-400A</span>
                <span className="font-data-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>Zone 4A</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
                High-Voltage Breakers stock depleted below critical threshold (2 units left).
              </p>
              <Link to="/materials" className="font-label-caps" style={{ display: 'inline-block', marginTop: 8, fontSize: 10, color: 'var(--primary)' }}>
                REORDER NOW →
              </Link>
            </div>

            {/* Alert 2 */}
            <div style={{
              background: 'var(--bg-elevated)',
              borderLeft: '3px solid var(--accent)',
              padding: 12,
              borderRadius: '0 var(--radius-xs) var(--radius-xs) 0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="font-data-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>SYS-ENV-WARN</span>
                <span className="font-data-mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>Panel 2</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, lineHeight: 1.4 }}>
                Temperature anomaly detected in Section B (Batteries). Current: 28°C.
              </p>
              <Link to="/analytics" className="font-label-caps" style={{ display: 'inline-block', marginTop: 8, fontSize: 10, color: 'var(--accent)' }}>
                ACKNOWLEDGE →
              </Link>
            </div>
          </div>

          {/* Logistics Network Status Mini Card */}
          <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-title-md" style={{ fontSize: 14, color: 'var(--text-primary)' }}>Main Operations Hub</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 16 }}>cloud</span>
                <span className="font-data-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Live Telemetry</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span className="live-beacon"></span>
              <span className="font-data-mono" style={{ fontSize: 11, color: 'var(--accent)' }}>
                Logistics Network 100% Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;