import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FaTachometerAlt, FaBriefcase, FaUsers, FaAddressBook,
  FaBoxes, FaFileInvoiceDollar, FaChartLine, FaCalendarAlt,
  FaCog, FaBolt, FaSignOutAlt, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const adminNavItems = [
  { to: '/dashboard',          icon: FaTachometerAlt,      label: 'Dashboard' },
  { to: '/jobs',               icon: FaBriefcase,          label: 'Jobs' },
  { to: '/electricians',       icon: FaUsers,              label: 'Electricians' },
  { to: '/customers',          icon: FaAddressBook,        label: 'Customers' },
  { to: '/materials',          icon: FaBoxes,              label: 'Materials' },
  { to: '/invoices',           icon: FaFileInvoiceDollar,  label: 'Invoices' },
  { to: '/analytics',          icon: FaChartLine,          label: 'Analytics' },
  { to: '/reports/attendance', icon: FaCalendarAlt,        label: 'Reports' },
];

const electricianNavItems = [
  { to: '/dashboard', icon: FaTachometerAlt,     label: 'Dashboard' },
  { to: '/jobs',      icon: FaBriefcase,         label: 'My Jobs' },
  { to: '/materials', icon: FaBoxes,             label: 'Materials' },
  { to: '/invoices',  icon: FaFileInvoiceDollar, label: 'Invoices' },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'admin' ? adminNavItems : electricianNavItems;
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FaBolt />
        </div>
        {!collapsed && (
          <div className="sidebar-brand">
            <div className="sidebar-brand-name">ElectroTrack</div>
            <div className="sidebar-brand-sub">Enterprise WMS</div>
          </div>
        )}
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-section-label">Operations</div>}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            data-tooltip={label}
            className={({ isActive }) => `nav-item-sidebar ${isActive ? 'active' : ''}`}
          >
            <span className="nav-item-icon"><Icon /></span>
            <span className="nav-item-label">{label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            {!collapsed && <div className="sidebar-section-label" style={{ marginTop: 16 }}>Configuration</div>}
            <NavLink
              to="/settings"
              data-tooltip="Settings"
              className={({ isActive }) => `nav-item-sidebar ${isActive ? 'active' : ''}`}
            >
              <span className="nav-item-icon"><FaCog /></span>
              <span className="nav-item-label">Settings</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* SYSTEM ONLINE Beacon — Stitch footer indicator */}
      {!collapsed && (
        <div className="sidebar-system-status">
          <span className="live-beacon"></span>
          <span className="sidebar-system-label">SYSTEM ONLINE</span>
        </div>
      )}

      {/* Footer User Info */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{initials}</div>
          {!collapsed && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          )}
        </div>
        <button className="sidebar-logout" onClick={handleLogout} data-tooltip="Sign out">
          <FaSignOutAlt style={{ flexShrink: 0 }} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
