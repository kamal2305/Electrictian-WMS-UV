import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { FaBolt } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { email, password } = formData;
  const { login, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);
  useEffect(() => { if (error) toast.error(error); }, [error]);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const result = await login({ email, password });
      if (result?.success) {
        toast.success('Welcome back!');
        setTimeout(() => navigate('/dashboard'), 100);
      } else {
        toast.error(result?.message || 'Invalid credentials');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrapper">
      {/* Brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-logo"><FaBolt /></div>
        <h1>ElectroTrack</h1>
        <p>The complete workforce management platform for electrical businesses</p>
        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 320, position: 'relative', zIndex: 1 }}>
          {['Role-based access control', 'Real-time job tracking', 'PDF invoice generation', 'Material inventory'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p>Sign in to your ElectroTrack account</p>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" value={email} onChange={onChange} placeholder="admin@company.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" value={password} onChange={onChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</>
              ) : 'Sign In'}
            </button>
          </form>
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;