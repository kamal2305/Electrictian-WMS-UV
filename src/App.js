import React, { Suspense, lazy, useState } from 'react';
import { Route, createRoutesFromElements, createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';
import Home from './components/layout/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PrivateRoute from './components/routing/PrivateRoute';
import RoleRoute from './components/routing/RoleRoute';
import Dashboard from './components/dashboard/Dashboard';

// Lazy loaded
const Jobs               = lazy(() => import('./components/jobs/Jobs'));
const JobForm            = lazy(() => import('./components/jobs/JobForm'));
const JobDetails         = lazy(() => import('./components/jobs/JobDetails'));
const JobsByElectrician  = lazy(() => import('./components/jobs/JobsByElectrician'));
const ElectricianList    = lazy(() => import('./components/electricians/ElectricianList'));
const ElectricianForm    = lazy(() => import('./components/electricians/ElectricianForm'));
const AttendanceReport   = lazy(() => import('./components/timelogs/AttendanceReport'));
const InvoiceList        = lazy(() => import('./components/invoices/InvoiceList'));
const InvoiceForm        = lazy(() => import('./components/invoices/InvoiceForm'));
const InvoiceView        = lazy(() => import('./components/invoices/InvoiceView'));
const Analytics          = lazy(() => import('./components/Analytics/Analytics'));
const Profile            = lazy(() => import('./components/profile/Profile'));
const MaterialsList      = lazy(() => import('./components/materials/MaterialsList'));
const MaterialForm       = lazy(() => import('./components/materials/MaterialForm'));
const MaterialDetails    = lazy(() => import('./components/materials/MaterialDetails'));
const MaterialInventory  = lazy(() => import('./components/materials/MaterialInventory'));
const ElectricianInventory = lazy(() => import('./components/materials/ElectricianInventory'));
const CustomerList       = lazy(() => import('./components/customers/CustomerList'));
const CustomerForm       = lazy(() => import('./components/customers/CustomerForm'));
const CustomerDetail     = lazy(() => import('./components/customers/CustomerDetail'));
const Settings           = lazy(() => import('./components/settings/Settings'));

// Loading spinner
const Spinner = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <span>Loading system...</span>
  </div>
);

// Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('UI Error:', error, info); }
  render() {
    if (this.state.hasError) return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>An error occurred loading this page.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload Page</button>
      </div>
    );
    return this.props.children;
  }
}

// App Layout with Sidebar and TopHeader
const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');
  const toggle = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };
  return (
    <div className={`App ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className="main-content">
        <TopHeader />
        <main className="main-content-inner">
          <ErrorBoundary>
            <Suspense fallback={<Spinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      {/* ToastContainer is at App root — no duplicate needed here */}
    </div>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route index element={<Home />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          {/* Private routes visible to all authenticated */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetails />} />

          {/* Admin only */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="jobs/create" element={<JobForm />} />
            <Route path="jobs/:id/edit" element={<JobForm />} />
            <Route path="jobs/electrician/:id" element={<JobsByElectrician />} />
            <Route path="electricians" element={<ElectricianList />} />
            <Route path="electricians/create" element={<ElectricianForm />} />
            <Route path="electricians/:id/edit" element={<ElectricianForm />} />
            <Route path="reports/attendance" element={<AttendanceReport />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoices/create" element={<InvoiceForm />} />
            <Route path="invoices/:id" element={<InvoiceView />} />
            <Route path="invoices/:id/edit" element={<InvoiceForm />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="materials/create" element={<MaterialForm />} />
            <Route path="materials/:id/edit" element={<MaterialForm />} />
            <Route path="materials/inventory" element={<MaterialInventory />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/create" element={<CustomerForm />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="customers/:id/edit" element={<CustomerForm />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Shared admin + electrician */}
          <Route element={<RoleRoute allowedRoles={['admin', 'electrician']} />}>
            <Route path="materials" element={<MaterialsList />} />
            <Route path="materials/:id" element={<MaterialDetails />} />
          </Route>

          {/* Electrician only */}
          <Route element={<RoleRoute allowedRoles={['electrician']} />}>
            <Route path="materials/inventory" element={<ElectricianInventory />} />
          </Route>
        </Route>
      </Route>

      <Route path="unauthorized" element={<div className="loading-container"><h2>Unauthorized Access</h2></div>} />
      <Route path="*" element={<div className="loading-container"><h2>404 — Page Not Found</h2></div>} />
    </Route>
  ),
  { future: { v7_relativeSplatPath: true, v7_startTransition: true }, basename: '/' }
);

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={4000} theme="dark" />
    </AuthProvider>
  </ThemeProvider>
);

export default App;
