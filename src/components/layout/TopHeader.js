import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from '../common/ThemeToggle';
import { FaPlus, FaSearch } from 'react-icons/fa';
import './TopHeader.css';

const formatRouteName = (pathname) => {
  const path = pathname.split('/')[1] || 'Dashboard';
  return path.charAt(0).toUpperCase() + path.slice(1);
};

const TopHeader = () => {
  const { user } = useAuth();
  const location = useLocation();
  const currentTitle = formatRouteName(location.pathname);
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="top-header">
      {/* Left — search bar */}
      <div className="top-header-left">
        <div className="header-search-bar">
          <FaSearch className="header-search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Search jobs, electricians, materials..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
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
            <div className="header-user-meta">
              <span className="header-user-name">{user.name}</span>
              <span className="header-user-role">{user.role}</span>
            </div>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
};

export default TopHeader;
