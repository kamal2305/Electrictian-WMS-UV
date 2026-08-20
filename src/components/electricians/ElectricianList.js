import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { FaPlus, FaSearch, FaUserTie, FaPhone, FaEnvelope, FaBriefcase, FaEdit, FaTrash } from 'react-icons/fa';

const ElectricianList = () => {
  const [electricians, setElectricians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filtered = electricians.filter(e =>
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.phone?.includes(searchTerm) ||
    e.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Electricians & Field Technicians</h1>
          <div className="page-title-sub">Manage workforce profiles, specializations, contact details, and job logs</div>
        </div>
        <Link to="/electricians/create" className="btn btn-primary">
          <FaPlus /> Add New Electrician
        </Link>
      </div>

      <div className="filters-bar">
        <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
          <FaSearch className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search by name, specialization, phone, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading technicians...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon"><FaUserTie /></div>
          <h3>No Electricians Found</h3>
          <p>{searchTerm ? 'Try adjusting your search criteria' : 'Add your first electrician to assign jobs and track attendance'}</p>
          {!searchTerm && (
            <Link to="/electricians/create" className="btn btn-primary" style={{ marginTop: 16 }}>
              <FaPlus /> Add New Electrician
            </Link>
          )}
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(elec => (
            <div key={elec._id} className="card electrician-card">
              <div className="electrician-avatar">
                {elec.name ? elec.name.slice(0, 2) : 'EL'}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{elec.name}</h3>
              <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500, marginBottom: 12 }}>
                {elec.specialization || 'General Electrician'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-muted)', marginBottom: 18, textAlign: 'left' }}>
                {elec.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaPhone style={{ color: 'var(--primary)', fontSize: 11 }} />
                    <span style={{ color: 'var(--text)' }}>{elec.phone}</span>
                  </div>
                )}
                {elec.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaEnvelope style={{ color: 'var(--accent)', fontSize: 11 }} />
                    <span>{elec.email}</span>
                  </div>
                )}
                {elec.experience !== undefined && (
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    Experience: <b style={{ color: 'var(--text)' }}>{elec.experience} yrs</b>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to={`/jobs/electrician/${elec._id}`} className="btn btn-outline btn-sm">
                  <FaBriefcase /> Assigned Jobs
                </Link>
                <div className="action-buttons">
                  <Link to={`/electricians/${elec._id}/edit`} className="btn btn-secondary btn-sm" title="Edit">
                    <FaEdit />
                  </Link>
                  <button onClick={() => handleDelete(elec._id, elec.name)} className="btn btn-danger btn-sm" title="Delete">
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