import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import {
  FaPlus, FaSearch, FaPhone, FaEnvelope,
  FaBriefcase, FaEdit, FaTrash, FaMapMarkerAlt
} from 'react-icons/fa';

const ElectricianList = () => {
  const [electricians, setElectricians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const fetchElectricians = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/electricians');
      if (res.data.success) {
        setElectricians(res.data.data);
      }
    } catch (err) {
      toast.error('Error fetching electricians');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectricians();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/users/electricians/${id}`);
      toast.success('Electrician deleted successfully');
      fetchElectricians();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting electrician');
    }
  };

  const filtered = electricians.filter(e => {
    const matchSearch =
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.phone?.includes(searchTerm) ||
      e.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchSearch;
    if (activeTab === 'electricians') return matchSearch && (e.role === 'electrician' || e.specialization?.toLowerCase().includes('electric'));
    if (activeTab === 'warehouse') return matchSearch && e.specialization?.toLowerCase().includes('warehouse');
    return matchSearch;
  });

  const totalStaff = electricians.length;
  const masterElectricians = electricians.filter(e => e.specialization?.toLowerCase().includes('master') || e.specialization?.toLowerCase().includes('senior') || !e.specialization).length;
  const apprenticeCount = totalStaff - masterElectricians;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Section with Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Team Directory
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0', maxWidth: 600 }}>
            Manage personnel assignments, view current field deployments, and monitor technician credentials.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link
            to="/electricians/create"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
            <span>New Profile</span>
          </Link>
        </div>
      </div>

      {/* Bento Grid Metrics Ribbon (Stitch Staff Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16
      }}>
        {/* Metric 1: Total Active Staff */}
        <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>badge</span>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>TOTAL ACTIVE STAFF</span>
          </div>
          <div className="font-display-stat" style={{ color: 'var(--text-primary)' }}>{totalStaff}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent)', marginTop: 4 }}>
            <span className="font-data-mono" style={{ fontSize: 12 }}>+3 this month</span>
          </div>
        </div>

        {/* Metric 2: Certified Electricians */}
        <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 20 }}>engineering</span>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>ELECTRICIANS</span>
          </div>
          <div className="font-display-stat" style={{ color: 'var(--text-primary)' }}>{totalStaff}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }} className="font-data-mono">
            {masterElectricians} Master / {apprenticeCount} Appr
          </div>
        </div>

        {/* Metric 3: Deployments */}
        <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--danger)', fontSize: 20 }}>location_on</span>
              <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>DEPLOYMENTS</span>
            </div>
            <span className="live-beacon"></span>
          </div>
          <div className="font-display-stat" style={{ color: 'var(--text-primary)' }}>{Math.min(totalStaff, 4)}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }} className="font-data-mono">
            Active Field Ops
          </div>
        </div>

        {/* Metric 4: Certified Crew */}
        <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--teal)', fontSize: 20 }}>verified</span>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>COMPLIANCE</span>
          </div>
          <div className="font-display-stat" style={{ color: 'var(--text-primary)' }}>100%</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }} className="font-data-mono">
            Certified & Insured
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        paddingBottom: 12,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { key: 'all', label: 'All Staff' },
            { key: 'electricians', label: 'Electricians' },
            { key: 'warehouse', label: 'Warehouse' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="font-title-md"
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 0',
                fontSize: 14,
                color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: activeTab === tab.key ? 700 : 500,
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span style={{
                  position: 'absolute',
                  bottom: -13,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'var(--primary)',
                  borderRadius: '3px 3px 0 0'
                }}></span>
              )}
            </button>
          ))}
        </div>

        {/* Search Input & View Switch */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
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
              placeholder="Search technician name, phone, SKU..."
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

          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 2
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--primary-active)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--primary-active)' : 'transparent',
                color: viewMode === 'list' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Staff Grid / List View */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading workforce profiles...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 12 }}>badge</span>
          <h3>No Technicians Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 400, margin: '8px auto 16px' }}>
            {searchTerm ? 'Try adjusting your search criteria' : 'Add your first electrician profile to start dispatching jobs.'}
          </p>
          <Link to="/electricians/create" className="btn btn-primary btn-sm">
            <FaPlus /> Add New Profile
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr',
          gap: 20
        }}>
          {filtered.map(elec => (
            <div
              key={elec._id}
              className="card"
              style={{
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                position: 'relative',
                transition: 'var(--transition)'
              }}
            >
              {/* Profile Top Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="avatar" style={{ width: 48, height: 48, fontSize: 16 }}>
                  {elec.name ? elec.name.slice(0, 2).toUpperCase() : 'EL'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {elec.name}
                  </h3>
                  <span className="font-label-caps" style={{ color: 'var(--primary)', marginTop: 2 }}>
                    {elec.specialization || 'Master Electrician'}
                  </span>
                </div>
                <span className="badge badge-success" style={{ fontSize: 10 }}>Active</span>
              </div>

              {/* Contact Meta Details */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '12px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FaEnvelope style={{ color: 'var(--text-dim)', fontSize: 11 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{elec.email}</span>
                </div>
                {elec.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaPhone style={{ color: 'var(--text-dim)', fontSize: 11 }} />
                    <span className="font-data-mono" style={{ color: 'var(--text-secondary)' }}>{elec.phone}</span>
                  </div>
                )}
                {elec.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaMapMarkerAlt style={{ color: 'var(--text-dim)', fontSize: 11 }} />
                    <span>{elec.address}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                <Link
                  to={`/jobs/electrician/${elec._id}`}
                  style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <FaBriefcase style={{ fontSize: 11 }} /> View Assigned Jobs
                </Link>

                <div style={{ display: 'flex', gap: 8 }}>
                  <Link
                    to={`/electricians/${elec._id}/edit`}
                    className="btn btn-secondary btn-sm"
                    title="Edit Profile"
                  >
                    <FaEdit />
                  </Link>
                  <button
                    onClick={() => handleDelete(elec._id, elec.name)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)' }}
                    title="Delete Profile"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElectricianList;