import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaBolt, FaUsers, FaClock, FaChartBar, FaFileInvoiceDollar, FaArrowRight, FaCheck } from 'react-icons/fa';

const features = [
  { icon: FaUsers, label: 'Role-Based Access', desc: 'Admin and electrician roles with fine-grained permissions', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { icon: FaClock, label: 'Real-Time Tracking', desc: 'Check-in/out time tracking per job with attendance reports', color: '#22d3ee', bg: 'rgba(34,211,238,0.15)' },
  { icon: FaChartBar, label: 'Visual Analytics', desc: 'Revenue charts, job trends, and electrician performance', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { icon: FaFileInvoiceDollar, label: 'PDF Invoicing', desc: 'Professional invoices with PDF export, payment tracking', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
];

const highlights = ['Customer Management', 'PDF Invoice Export', 'Labour & Material Tracking', 'Attendance Reports', 'Inventory Control', 'Multi-role Access'];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-badge">
          <FaBolt /> ElectroTrack WMS
        </div>
        <h1>
          Manage Your <span>Electrical</span> Workforce
        </h1>
        <p>
          Streamline job assignments, track time, manage materials, and generate professional invoices — all in one premium platform.
        </p>
        <div className="home-buttons">
          {!isAuthenticated ? (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started Free <FaArrowRight style={{ fontSize: 12 }} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Go to Dashboard <FaArrowRight style={{ fontSize: 12 }} />
            </Link>
          )}
        </div>
        {/* Highlights */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 40 }}>
          {highlights.map(h => (
            <span key={h} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, fontSize: 12, color: 'var(--text-muted)' }}>
              <FaCheck style={{ color: 'var(--success)', fontSize: 10 }} /> {h}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="home-features">
        <h2>Everything You Need</h2>
        <p>From job dispatch to invoice delivery — ElectroTrack handles it all</p>
        <div className="features-grid">
          {features.map(({ icon: Icon, label, desc, color, bg }) => (
            <div className="feature-card" key={label}>
              <div className="feature-icon" style={{ background: bg, color }}>
                <Icon />
              </div>
              <h3>{label}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;