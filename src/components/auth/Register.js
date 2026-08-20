import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { FaBolt } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', password2: '', role: 'admin' });
  const [loading, setLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.password2) { toast.error('Passwords do not match'); return; }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const result = await register({ name: formData.name, email: formData.email, password: formData.password, role: formData.role });
      if (result?.success) {
        toast.success('Account created! Welcome to ElectroTrack.');
        navigate('/dashboard');
      } else { toast.error(result?.message || 'Registration failed'); }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-brand">
        <div className="auth-brand-logo"><FaBolt /></div>
        <h1>ElectroTrack</h1>
        <p>Start managing your electrical business the smarter way</p>
      </div>
      <div className="auth-form-panel">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p>Get started with ElectroTrack WMS</p>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={onChange} placeholder="John Smith" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={onChange} placeholder="john@company.com" required />
            </div>
            <div className="form-group">
              <label>Account Role</label>
              <select name="role" value={formData.role} onChange={onChange}>
                <option value="admin">Admin</option>
                <option value="electrician">Electrician</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={onChange} placeholder="Min 6 chars" required />
              </div>
              <div className="form-group">
                <label>Confirm</label>
                <input type="password" name="password2" value={formData.password2} onChange={onChange} placeholder="Re-enter" required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account...</> : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;