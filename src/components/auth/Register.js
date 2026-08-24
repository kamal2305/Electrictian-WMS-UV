import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import {
  FaBolt,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUserShield,
  FaHardHat,
  FaUserPlus,
} from 'react-icons/fa';
import './Auth.css';

/* Password strength helper */
const getStrength = pwd => {
  if (!pwd) return { score: 0, label: '' };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
  const labels = ['', 'Weak', 'Medium', 'Strong'];
  return { score, label: labels[score] };
};

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', password2: '', role: 'admin',
  });
  const [showPwd, setShowPwd]   = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading]   = useState(false);

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (isAuthenticated) navigate('/dashboard'); }, [isAuthenticated, navigate]);

  const onChange = useCallback(
    e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })),
    []
  );

  const onSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match'); return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      if (result?.success) {
        toast.success('Account created! Welcome to ElectroTrack.');
        navigate('/dashboard');
      } else {
        toast.error(result?.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const strength = getStrength(formData.password);

  const strengthClass = seg => {
    if (seg > strength.score) return '';
    if (strength.score === 1) return 'active-weak';
    if (strength.score === 2) return 'active-medium';
    return 'active-strong';
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
          Start managing smarter, <span>today</span>
        </h1>
        <p className="auth-sub">
          Join hundreds of electrical teams who use ElectroTrack to run jobs,
          track materials, and invoice clients — all in one place.
        </p>

        <div className="auth-features">
          {[
            { icon: '⚡', title: 'Instant setup', desc: 'Live in under 5 minutes' },
            { icon: '🔒', title: 'Role-based access', desc: 'Admin & electrician views' },
            { icon: '📊', title: 'Real-time dashboards', desc: 'Always up-to-date analytics' },
            { icon: '📄', title: 'Auto invoicing', desc: 'PDF invoices in one click' },
          ].map(f => (
            <div className="auth-feature-item" key={f.title}>
              <div className="auth-feature-icon indigo"
                style={{ fontSize: 18 }}>{f.icon}</div>
              <div className="auth-feature-text">
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="auth-stats">
          <div className="auth-stat-item">
            <span className="auth-stat-value">Free</span>
            <span className="auth-stat-label">to get started</span>
          </div>
          <div className="auth-stat-item">
            <span className="auth-stat-value">&lt;5m</span>
            <span className="auth-stat-label">setup time</span>
          </div>
          <div className="auth-stat-item">
            <span className="auth-stat-value">24/7</span>
            <span className="auth-stat-label">availability</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT form panel ── */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-avatar"><FaUserPlus /></div>
            <h2 className="auth-card-title">Create account</h2>
            <p className="auth-card-subtitle">Get started with ElectroTrack WMS</p>
          </div>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            {/* Full name */}
            <div className="auth-field">
              <label htmlFor="reg-name">Full Name</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FaUser /></span>
                <input
                  id="reg-name"
                  className="auth-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  placeholder="John Smith"
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label htmlFor="reg-email">Email Address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon"><FaEnvelope /></span>
                <input
                  id="reg-email"
                  className="auth-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  placeholder="john@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Role pills */}
            <div className="auth-field">
              <label>Account Role</label>
              <div className="auth-role-pills">
                <label className="auth-role-pill">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={onChange}
                  />
                  <div className="auth-role-pill-label">
                    <FaUserShield className="role-icon" />
                    Admin
                  </div>
                </label>
                <label className="auth-role-pill">
                  <input
                    type="radio"
                    name="role"
                    value="electrician"
                    checked={formData.role === 'electrician'}
                    onChange={onChange}
                  />
                  <div className="auth-role-pill-label">
                    <FaHardHat className="role-icon" />
                    Electrician
                  </div>
                </label>
              </div>
            </div>

            {/* Passwords row */}
            <div className="auth-field-row">
              <div className="auth-field">
                <label htmlFor="reg-password">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><FaLock /></span>
                  <input
                    id="reg-password"
                    className="auth-input"
                    type={showPwd ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={onChange}
                    placeholder="Min 6 chars"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPwd(v => !v)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {/* Strength bar */}
                {formData.password && (
                  <>
                    <div className="auth-strength-bar">
                      {[1, 2, 3].map(s => (
                        <div key={s} className={`auth-strength-seg ${strengthClass(s)}`} />
                      ))}
                    </div>
                    <span className="auth-strength-label">{strength.label}</span>
                  </>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="reg-password2">Confirm</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon"><FaLock /></span>
                  <input
                    id="reg-password2"
                    className="auth-input"
                    type={showPwd2 ? 'text' : 'password'}
                    name="password2"
                    value={formData.password2}
                    onChange={onChange}
                    placeholder="Re-enter"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPwd2(v => !v)}
                    aria-label={showPwd2 ? 'Hide password' : 'Show password'}
                  >
                    {showPwd2 ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="auth-btn auth-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <><span className="auth-spinner" /> Creating account...</>
              ) : (
                <><FaUserPlus /> Create Account</>
              )}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <div className="auth-card-footer">
            Already have an account?
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;