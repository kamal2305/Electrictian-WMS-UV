import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import { FaPlus, FaSearch, FaBars } from 'react-icons/fa';
import './TopHeader.css';

const formatRouteName = (pathname) => {
  const path = pathname.split('/')[1] || 'Dashboard';
  return path.charAt(0).toUpperCase() + path.slice(1);
};

const TopHeader = ({ onToggleMobile }) => {
  const { user } = useAuth();
  const location = useLocation();
  const currentTitle = formatRouteName(location.pathname);
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="top-header">
      {/* Left — Hamburger (mobile) + search bar + breadcrumbs */}
      <div className="top-header-left">
        {onToggleMobile && (
          <button
            className="header-mobile-toggle"
            onClick={onToggleMobile}
            aria-label="Open Sidebar Menu"
          >
            <FaBars />
          </button>
        )}

        <div className="header-breadcrumbs">
          <span className="crumb-app">ElectroTrack</span>
          <span className="crumb-separator">/</span>
          <span className="crumb-active">{currentTitle}</span>
        </div>

        <div className="header-search-bar">
          <FaSearch className="header-search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search jobs, electricians, inventory..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {/* Right — Actions, Theme Toggle, Profile */}
      <div className="top-header-right">
        {user?.role === 'admin' && (
          <Link to="/jobs/create" className="btn btn-primary btn-sm header-quick-btn">
            <FaPlus style={{ fontSize: 10 }} /> <span>New Job</span>
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
            <div className="header-user-meta">
              <span className="header-user-name">{user.name}</span>
              <span className="font-label-caps header-user-role">{user.role}</span>
            </div>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default TopHeader;
