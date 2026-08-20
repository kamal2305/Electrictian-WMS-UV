import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { FaSave, FaShieldAlt } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile, error } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialization: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        specialization: user.specialization || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const result = await updateProfile(formData);
      if (result?.success) {
        toast.success('Profile updated successfully');
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <div className="page-container" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <div className="page-title-sub">Manage your account information and contact preferences</div>
        </div>
      </div>

      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>{user?.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
              <FaShieldAlt style={{ marginRight: 4 }} /> {user?.role}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</span>
          </div>
        </div>
      </div>

      <div className="profile-form card">
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Personal Information</h3>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={onChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <small style={{ color: 'var(--text-dim)', fontSize: 11 }}>Email cannot be changed directly.</small>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              placeholder="+91 98765 43210"
            />
          </div>

          {user?.role === 'electrician' && (
            <div className="form-group">
              <label>Specialization / Expertise</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={onChange}
                placeholder="e.g. Commercial 3-Phase, Solar Inverters"
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <FaSave /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;