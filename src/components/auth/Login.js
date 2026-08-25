import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { toast } from 'react-toastify';
import {
  FaBolt,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaChartLine,
  FaTools,
  FaFileInvoiceDollar,
  FaBoxes,
} from 'react-icons/fa';
import './Auth.css';

const FEATURES = [
  {
    icon: <FaChartLine />,
    cls: 'indigo',
    title: 'Real-time Analytics',
    desc: 'Live job & revenue dashboards',
  },
  {
    icon: <FaTools />,
    cls: 'cyan',
    title: 'Job Tracking',
    desc: 'Assign, monitor & close jobs',
  },
  {
    icon: <FaFileInvoiceDollar />,
    cls: 'purple',
    title: 'PDF Invoicing',
    desc: 'Auto-generate professional invoices',
  },
  {
    icon: <FaBoxes />,
    cls: 'green',
    title: 'Material Inventory',
    desc: 'Track stock levels in real time',
  },
];

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { email, password } = formData;
  const { login, isAuthenticated, error } = useAuth();
  const navigate = useNavigate();

  useDocumentTitle('Sign In', 'Sign in to access your ElectroTrack WMS operations dashboard.');

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
    <div className="auth-page">
      {/* Ambient background */}
      <div className="auth-orbs">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>
      <div className="auth-grid" />

      {/* ── LEFT brand panel ── */}
      <div className="auth-left">
        <div className="auth-brand-mark">
          <div className="auth-brand-icon"><FaBolt /></div>
          <span className="auth-brand-name">ElectroTrack</span>
        </div>

        <h1 className="auth-headline">
          Power your <span>electrical</span> business
        </h1>
        <p className="auth-sub">
          The complete workforce management platform built for modern electrical contractors.
        </p>

        <div className="auth-features">
          {FEATURES.map(f => (
            <div className="auth-feature-item" key={f.title}>
              <div className={`auth-feature-icon ${f.cls}`}>{f.icon}</div>
              <div className="auth-feature-text">
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="auth-stats">
          <div className="auth-stat-item">
            <span className="auth-stat-value">99%</span>
            <span className="auth-stat-label">Uptime</span>
          </div>
          <div className="auth-stat-item">
            <span className="auth-stat-value">2k+</span>
            <span className="auth-stat-label">Jobs Tracked</span>
          </div>
          <div className="auth-stat-item">
            <span className="auth-stat-value">50+</span>
            <span className="auth-stat-label">Teams</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT form panel ── */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-avatar"><FaBolt /></div>
            <h2 className="auth-card-title">Welcome back</h2>
            <p className="auth-card-subtitle">Sign in to your ElectroTrack account</p>
          </div>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label htmlFor="login-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FaEnvelope /></span>
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  placeholder="admin@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FaLock /></span>
                <input
                  id="login-password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={onChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="auth-btn auth-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <><span className="auth-spinner" /> Signing in...</>
              ) : (
                <><FaSignInAlt /> Sign In</>
              )}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div className="auth-card-footer">
            Don't have an account?
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;