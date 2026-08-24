import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import {
  FaBriefcase, FaCheckCircle, FaBoxes, FaClock,
  FaBolt, FaMapMarkerAlt, FaCalendarAlt, FaPlus, FaArrowRight
} from 'react-icons/fa';
import './Dashboard.css';

const ElectricianDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    activeJobs: [],
    completedJobs: [],
    totalMaterials: 0,
    hoursLogged: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [materialForm, setMaterialForm] = useState({
    name: '',
    quantity: '',
    unit: '',
    description: ''
  });

  const fetchDashboardData = useCallback(async () => {
    if (!user || !user.id) {
      setLoading(true);
      return;
    }

    const lastFetchTime = sessionStorage.getItem('lastElectricianDashboardFetch');
    if (lastFetchTime && (Date.now() - parseInt(lastFetchTime) < 30000)) {
      const cachedData = sessionStorage.getItem(`electricianDashboardData_${user.id}`);
      if (cachedData) {
        try {
          setDashboardData(JSON.parse(cachedData));
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error parsing cached dashboard data:', error);
        }
      }
    }

    try {
      setLoading(true);
      const response = await api.get(`/dashboard/electrician/${user.id}/stats`);
      if (response.data && response.data.success && response.data.data) {
        if (!window.materialRepairCalled && !sessionStorage.getItem('materialRepairCompleted')) {
          try {
            window.materialRepairCalled = true;
            const repairResponse = await api.post(`/dashboard/electrician/${user.id}/repair-materials`);
            if (repairResponse.data && repairResponse.data.success) {
              sessionStorage.setItem('materialRepairCompleted', 'true');
              if (repairResponse.data.data && repairResponse.data.data.totalMaterials !== undefined) {
                response.data.data.totalMaterials = repairResponse.data.data.totalMaterials;
              }
            }
          } catch (repairError) {
            console.error('Error verifying material usage data');
          }
        }

        const formattedData = {
          activeJobs: response.data.data.activeJobs || [],
          completedJobs: response.data.data.completedJobs || [],
          totalMaterials: response.data.data.totalMaterials || 0,
          hoursLogged: response.data.data.hoursLogged || 0
        };

        try {
          sessionStorage.setItem(`electricianDashboardData_${user.id}`, JSON.stringify(formattedData));
          sessionStorage.setItem('lastDashboardFetch', new Date().getTime().toString());
        } catch (error) {
          console.error('Error storing dashboard data in sessionStorage:', error);
        }

        setDashboardData(formattedData);
      } else {
        setDashboardData({
          activeJobs: [],
          completedJobs: [],
          totalMaterials: 0,
          hoursLogged: 0
        });
      }
    } catch (error) {
      console.error('Dashboard data error:', error);
      toast.error('Error fetching technician metrics');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    if (user && user.id) {
      const cachedDashboardData = sessionStorage.getItem(`electricianDashboardData_${user.id}`);
      const lastFetch = sessionStorage.getItem('lastElectricianDashboardFetch');
      const cacheAge = lastFetch ? Date.now() - Number(lastFetch) : Infinity;
      const cacheFresh = cacheAge < 60000;

      if (cachedDashboardData && cacheFresh) {
        try {
          const parsedData = JSON.parse(cachedDashboardData);
          setDashboardData(parsedData);
          setLoading(false);
        } catch (error) {
          fetchDashboardData();
        }
      } else {
        fetchDashboardData();
      }
    } else {
      const cachedUser = localStorage.getItem('userData');
      if (cachedUser) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          if (parsedUser && parsedUser.id && isMounted) {
            setDashboardData(prev => ({ ...prev, loading: true }));
            api.get(`/dashboard/electrician/${parsedUser.id}/stats`)
              .then(response => {
                if (response.data && response.data.success && response.data.data && isMounted) {
                  setDashboardData({
                    activeJobs: response.data.data.activeJobs || [],
                    completedJobs: response.data.data.completedJobs || [],
                    totalMaterials: response.data.data.totalMaterials || 0,
                    hoursLogged: response.data.data.hoursLogged || 0
                  });
                }
                if (isMounted) setLoading(false);
              })
              .catch(() => {
                if (isMounted) setLoading(false);
              });
          }
        } catch (err) {
          console.error('Error parsing cached user data', err);
        }
      }
    }

    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData, user]);

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) {
      toast.error('Please select a job first');
      return;
    }

    const quantity = parseFloat(materialForm.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid positive quantity');
      return;
    }

    if (!materialForm.name || !materialForm.name.trim()) {
      toast.error('Please enter a material name');
      return;
    }

    if (!materialForm.unit || !materialForm.unit.trim()) {
      toast.error('Please enter a unit of measurement');
      return;
    }

    try {
      const materialData = {
        name: materialForm.name.trim(),
        quantity: quantity,
        unit: materialForm.unit.trim(),
        description: materialForm.description,
        job: selectedJob._id,
        addedBy: user.id
      };

      const materialResponse = await api.post(`/jobs/${selectedJob._id}/materials`, materialData);
      if (materialResponse.data && materialResponse.data.success) {
        try {
          const usageData = {
            materialId: materialResponse.data.data._id,
            electricianId: user.id,
            quantity: quantity,
            notes: materialForm.description || 'Added from dashboard'
          };
          await api.post(`/jobs/${selectedJob._id}/material-usage`, usageData);
        } catch (usageError) {
          console.error('Error adding material usage record:', usageError);
        }

        toast.success('Material logged successfully');
        setMaterialForm({
          name: '',
          quantity: '',
          unit: '',
          description: ''
        });
        fetchDashboardData();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error adding material. Please verify inputs.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Syncing field workstation...</span>
      </div>
    );
  }

  const statCards = [
    { label: 'Active Assigned Jobs', value: dashboardData.activeJobs?.length || 0, icon: FaBriefcase, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    { label: 'Completed Tickets', value: dashboardData.completedJobs?.length || 0, icon: FaCheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    { label: 'Materials Consumed', value: dashboardData.totalMaterials, icon: FaBoxes, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'Total Hours Logged', value: `${dashboardData.hoursLogged}h`, icon: FaClock, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  ];

  return (
    <div className="dashboard-container">
      {/* Field Workstation Hero */}
      <div className="dashboard-hero-banner glow-accent">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '4px 10px', background: 'var(--primary-dim)', borderRadius: 20, border: '1px solid rgba(99,102,241,0.3)', fontSize: 11, fontWeight: 700, color: 'var(--primary-hover)' }}>
              <FaBolt /> FIELD TECHNICIAN STATION
            </div>
            <h1 className="dashboard-hero-title">
              Welcome Back, {user?.name}
            </h1>
            <p className="dashboard-hero-sub">
              You currently have <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{dashboardData.activeJobs?.length || 0} active jobs</span> in your queue.
            </p>
          </div>
          <Link to="/jobs" className="btn btn-primary">
            <FaBriefcase /> <span>My Full Job Queue</span>
          </Link>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="stats-grid">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: bg, color }}>
              <Icon />
            </div>
            <div className="stat-card-label">{label}</div>
            <div className="stat-card-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Bento Grid: Active Jobs Queue + Material Usage Station */}
      <div className="bento-grid">
        {/* Active Jobs Queue */}
        <div className="bento-col-7" style={{ gridColumn: selectedJob ? 'span 7' : 'span 12' }}>
          <div className="bento-tile" style={{ padding: 24, height: '100%' }}>
            <div className="flex items-center justify-between mb-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="pulse-indicator"></span>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Active Job Queue</h3>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Click a job to log materials</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {dashboardData.activeJobs && dashboardData.activeJobs.length > 0 ? (
                dashboardData.activeJobs.map(job => {
                  const isSelected = selectedJob?._id === job._id;
                  return (
                    <div
                      key={job._id}
                      className="card"
                      style={{
                        padding: 16,
                        borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                        background: isSelected ? 'var(--primary-dim)' : 'var(--bg-card)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{job.title}</h4>
                        <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                          {job.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FaMapMarkerAlt style={{ color: 'var(--accent)' }} /> {job.location || 'Site Location'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FaCalendarAlt /> Due: {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                        <span style={{ fontSize: 11, color: isSelected ? 'var(--primary-hover)' : 'var(--text-dim)', fontWeight: 600 }}>
                          {isSelected ? '✓ Selected for material logging' : 'Click to select'}
                        </span>
                        <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm" onClick={e => e.stopPropagation()}>
                          View Details <FaArrowRight style={{ fontSize: 10 }} />
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state" style={{ padding: '36px 20px' }}>
                  <p>No active jobs currently assigned to you.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Job Material Logging Station */}
        {selectedJob && (
          <div className="bento-col-5" style={{ gridColumn: 'span 5' }}>
            <div className="bento-tile glow-accent" style={{ padding: 24, height: '100%' }}>
              <div className="flex items-center justify-between mb-2">
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Log Materials</h3>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedJob(null)}
                >
                  Close
                </button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                Adding items to <strong style={{ color: 'var(--text-primary)' }}>{selectedJob.title}</strong>
              </p>

              <form onSubmit={handleMaterialSubmit}>
                <div className="form-group">
                  <label>Material Name / SKU</label>
                  <input
                    type="text"
                    placeholder="e.g., 2.5mm Copper Cable, MCB 16A"
                    value={materialForm.name}
                    onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="e.g. 10"
                      value={materialForm.quantity}
                      onChange={(e) => setMaterialForm({ ...materialForm, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <input
                      type="text"
                      placeholder="meters, pcs, coils"
                      value={materialForm.unit}
                      onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Usage Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Where/how this material was installed..."
                    value={materialForm.description}
                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  <FaPlus /> Submit Material Log
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Completed Jobs History */}
      <div className="bento-tile" style={{ padding: 24, marginTop: 24 }}>
        <div className="section-header" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recently Completed Work</h3>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Archived tickets</span>
        </div>
        {dashboardData.completedJobs && dashboardData.completedJobs.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {dashboardData.completedJobs.slice(0, 4).map(job => (
              <div key={job._id} className="card" style={{ padding: 18 }}>
                <div className="flex items-center justify-between mb-1">
                  <h4 style={{ fontSize: 14, fontWeight: 700 }}>{job.title}</h4>
                  <span className="badge badge-success">Done</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  <FaMapMarkerAlt style={{ color: 'var(--accent)', marginRight: 4 }} /> {job.location || 'Completed on site'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-dim)' }}>
                  <span>{job.completedAt ? new Date(job.completedAt).toLocaleDateString() : 'Completed'}</span>
                  <Link to={`/jobs/${job._id}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No completed jobs recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default ElectricianDashboard;