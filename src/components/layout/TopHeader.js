import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import { FaBolt, FaBell, FaPlus } from 'react-icons/fa';
import './TopHeader.css';

const formatRouteName = (pathname) => {
  const path = pathname.split('/')[1] || 'Dashboard';
  return path.charAt(0).toUpperCase() + path.slice(1);
};

const TopHeader = () => {
  const { user } = useAuth();
  const location = useLocation();
  const currentTitle = formatRouteName(location.pathname);

  return (
    <header className="top-header">
      <div className="top-header-left">
        <div className="system-live-chip">
          <span className="pulse-indicator"></span>
          <span className="live-label">LIVE SYSTEM</span>
        </div>
        <div className="header-breadcrumbs">
          <span className="crumb-app">ElectroTrack</span>
          <span className="crumb-separator">/</span>
          <span className="crumb-active">{currentTitle}</span>
        </div>
      </div>

      <div className="top-header-right">
        {user?.role === 'admin' && (
          <Link to="/jobs/create" className="btn btn-primary btn-sm header-quick-btn">
            <FaPlus /> <span>New Job</span>
          </Link>
        )}

        <div className="header-divider"></div>

        {/* Theme Toggle */}
        <div className="header-theme-toggle-wrap">
          <ThemeToggle />
        </div>

        {/* User Badge */}
        {user && (
          <Link to="/profile" className="header-user-badge">
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="header-user-meta">
              <span className="header-user-name">{user.name}</span>
              <span className="header-user-role">{user.role}</span>
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default TopHeader;
