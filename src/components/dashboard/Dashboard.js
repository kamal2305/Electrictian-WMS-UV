import React from 'react';
import { useAuth } from '../../context/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import AdminDashboard from './AdminDashboard';
import ElectricianDashboard from './ElectricianDashboard';

const Dashboard = () => {
  const { user, loading, isAuthenticated } = useAuth();
  
  useDocumentTitle('Operations Dashboard', 'Real-time telemetry, active work orders, inventory levels, and live revenue tracking.');
  
  // Show loading state if authentication is still being determined
  if (loading) {
    return <div className="loading-container">Loading user data...</div>;
  }
  
  // Redirect handled by PrivateRoute, but adding an extra check
  if (!isAuthenticated || !user) {
    return <div className="not-authenticated">Authentication required</div>;
  }
  
  // Render the appropriate dashboard based on user role
  return user.role === 'admin' ? <AdminDashboard /> : <ElectricianDashboard />;
};

export default Dashboard;