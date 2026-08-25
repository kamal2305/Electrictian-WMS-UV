import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import './Home.css';

const INDEX_SECTIONS = [
  {
    num: '01 — DISPATCH',
    title: 'Role-Based Workforce Dispatch',
    desc: 'Admin, dispatcher, and electrician roles with fine-grained security and live dispatch capabilities.'
  },
  {
    num: '02 — TELEMETRY',
    title: 'Real-Time Shift & GPS Telemetry',
    desc: 'Check-in/out time tracking per job ticket combined with automated attendance reporting.'
  },
  {
    num: '03 — ANALYTICS',
    title: 'Operational BI Analytics',
    desc: 'Bento charts, revenue trends, and electrician performance leaderboards built for executives.'
  },
  {
    num: '04 — BILLING',
    title: 'Itemized PDF Invoicing',
    desc: 'Enterprise invoices with PDF streaming, GST tax splits, and integrated payment tracking.'
  }
];

const DATA_BLOCKS = [
  {
    icon: 'groups',
    tag: 'CUSTOMER CRM',
    metric: '360°',
    desc: 'Complete client history and GSTIN management.'
  },
  {
    icon: 'inventory_2',
    tag: 'SKU TRACKING',
    metric: 'Live',
    desc: 'Labour & Material tracking with low-stock alerts.'
  },
  {
    icon: 'assignment',
    tag: 'SHIFT REPORTS',
    metric: 'Auto',
    desc: 'Automated attendance and operational shift reports.'
  }
];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useDocumentTitle(
    'Enterprise Electrician Workforce Management',
    'Modern workforce management platform for electrical contractors. Real-time dispatching, live inventory telemetry, automated PDF invoicing, and technician attendance tracking.'
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-up');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      {/* ── Navigation Shell ── */}
      <nav className="home-nav">
        <Link to="/" className="home-nav-brand">
          <span className="home-brand-title">ElectroTrack WMS</span>
        </Link>

        <div className={`home-nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#solutions" className="home-nav-link active" onClick={() => setMobileMenuOpen(false)}>Solutions</a>
          <a href="#technology" className="home-nav-link" onClick={() => setMobileMenuOpen(false)}>Technology</a>
          <a href="#data-proof" className="home-nav-link" onClick={() => setMobileMenuOpen(false)}>Company</a>
          <a href="#solutions" className="home-nav-link" onClick={() => setMobileMenuOpen(false)}>Insights</a>
          <a href="#footer" className="home-nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</a>
        </div>

        <div className="home-nav-actions">
          <ThemeToggle />
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Console <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
            </Link>
          )}

          <button
            className="home-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* ── Hero Section (Asymmetric 8/4 Grid) ── */}
      <section className="home-hero-section">
        <div className="home-hero-grid">
          <div className="home-hero-content reveal-up">
            <h1 className="font-display-xl home-hero-headline">
              Master Your <br /> Electrical Operations
            </h1>
            <p className="font-body-lg home-hero-subtext">
              Next-generation Workforce &amp; Management System built for electrical contracting firms, field technicians, and rapid dispatch teams.
            </p>
            <div className="home-hero-ctas">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Deploy Workforce Free
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Sign In to Console
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Launch Operations Console
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </Link>
              )}
            </div>
          </div>

          <div className="home-hero-metrics reveal-up" style={{ transitionDelay: '150ms' }}>
            <div className="home-metric-block">
              <span className="font-label-caps home-metric-label">System Reliability</span>
              <div className="font-data-metric home-metric-value">100%</div>
              <span className="font-body-md home-metric-desc">Tracking uptime</span>
            </div>

            <div className="home-metric-block">
              <span className="font-label-caps home-metric-label">Live Dispatch</span>
              <div className="font-data-metric home-metric-value">&lt; 1s</div>
              <span className="font-body-md home-metric-desc">Update latency</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem / Solution Split Section ── */}
      <section className="home-solution-section" id="solutions">
        <div className="home-solution-grid">
          <div className="home-solution-left reveal-up">
            <h2 className="font-headline-lg">Enterprise-Grade Workforce Stack</h2>
            <p className="font-body-lg">
              Every tool needed to dispatch, monitor, track materials, and bill with precision, engineered into a single source of operational truth.
            </p>
          </div>

          <div className="home-index-list reveal-up" style={{ transitionDelay: '100ms' }}>
            {INDEX_SECTIONS.map((sec) => (
              <div key={sec.num} className="home-index-row">
                <div className="font-label-caps home-index-number">{sec.num}</div>
                <div className="home-index-content">
                  <div className="home-index-title-wrap">
                    <h3 className="home-index-title">{sec.title}</h3>
                    <span className="material-symbols-outlined home-index-arrow">arrow_forward</span>
                  </div>
                  <p className="font-body-md home-index-desc">{sec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Data-as-Brand Full-Width Section ── */}
      <section className="home-databrand-section" id="data-proof">
        <div className="home-databrand-inner reveal-up">
          {DATA_BLOCKS.map((item) => (
            <div key={item.tag} className="home-databrand-card">
              <span className="material-symbols-outlined home-databrand-icon">{item.icon}</span>
              <span className="font-label-caps home-databrand-tag">{item.tag}</span>
              <div className="font-display-lg home-databrand-metric">{item.metric}</div>
              <p className="font-body-md home-databrand-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Abstract Interface Feature Showcase Banner ── */}
      <section className="home-showcase-section" id="technology">
        <div className="home-showcase-banner reveal-up">
          <div className="home-showcase-backdrop" />
          <div className="home-showcase-grid-overlay" />
          <div className="home-showcase-text">Precision.</div>
        </div>
      </section>

      {/* ── Editorial Footer Shell ── */}
      <footer className="home-footer" id="footer">
        <div className="home-footer-inner">
          <div className="home-footer-brand">
            <div className="home-footer-title">ElectroTrack WMS</div>
            <div className="font-label-caps home-footer-copy">
              &copy; {new Date().getFullYear()} ElectroTrack WMS. All rights reserved. Industrial Grade Precision.
            </div>
          </div>

          <div className="home-footer-links">
            <a href="#privacy" className="font-label-caps home-footer-link">Privacy Policy</a>
            <a href="#terms" className="font-label-caps home-footer-link">Terms of Service</a>
            <a href="#security" className="font-label-caps home-footer-link">Security</a>
            <a href="#status" className="font-label-caps home-footer-link">Status</a>
            <a href="#api" className="font-label-caps home-footer-link">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;