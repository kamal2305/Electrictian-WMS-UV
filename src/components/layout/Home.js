import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import { FaBolt, FaUsers, FaClock, FaChartBar, FaFileInvoiceDollar, FaArrowRight, FaCheck } from 'react-icons/fa';

const features = [
  { icon: FaUsers, label: 'Role-Based Workforce Dispatch', desc: 'Admin, dispatcher, and electrician roles with fine-grained security and live dispatch.', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  { icon: FaClock, label: 'Real-Time Shift & GPS Telemetry', desc: 'Check-in/out time tracking per job ticket with automated attendance reports.', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  { icon: FaChartBar, label: 'Operational BI Analytics', desc: 'Bento charts, revenue trends, and electrician performance leaderboards.', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { icon: FaFileInvoiceDollar, label: 'Itemized PDF Invoicing', desc: 'Enterprise invoices with PDF streaming, GST tax splits, and payment tracking.', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
];

const highlights = [
  'Customer CRM & GSTIN',
  'Dynamic Dual-Theme (Dark/Light)',
  'Labour & Material SKU Tracking',
  'Attendance & Shift Reports',
  'Low-Stock Inventory Alerts',
  'High-Density Bento Dashboards'
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {/* Top Landing Navigation Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 36px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-header)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px var(--primary-glow)'
          }}>
            <FaBolt />
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ElectroTrack <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>WMS</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeToggle />
          {!isAuthenticated ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          ) : (
            <Link to="/dashboard" className="btn btn-primary btn-sm">
              Dashboard <FaArrowRight style={{ fontSize: 10 }} />
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-badge">
          <FaBolt /> Universal High-Tech Workforce System
        </div>
        <h1>
          Master Your <span>Electrical</span> Operations
        </h1>
        <p>
          Next-generation Workforce & Management System built for electrical contracting firms, field technicians, and rapid dispatch teams.
        </p>
        <div className="home-buttons">
          {!isAuthenticated ? (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Deploy Workforce Free <FaArrowRight style={{ fontSize: 12 }} />
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Sign In to Console
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Launch Operations Dashboard <FaArrowRight style={{ fontSize: 12 }} />
            </Link>
          )}
        </div>

        {/* Highlights */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 40, maxWidth: 900 }}>
          {highlights.map(h => (
            <span
              key={h}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)'
              }}
            >
              <FaCheck style={{ color: 'var(--success)', fontSize: 10 }} /> {h}
            </span>
          ))}
        </div>
      </div>

      {/* Features Bento */}
      <div className="home-features">
        <h2>Enterprise-Grade Workforce Stack</h2>
        <p>Every tool needed to dispatch, monitor, track materials, and bill with precision.</p>
        <div className="features-grid">
          {features.map(({ icon: Icon, label, desc, color, bg }) => (
            <div className="feature-card glow-accent" key={label}>
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