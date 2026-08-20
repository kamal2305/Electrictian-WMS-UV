import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import api from '../../config/axios';
import { Line, Pie as ChartPie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FaSyncAlt, FaBriefcase, FaMoneyBillWave, FaBoxes, FaUserCheck } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    jobStats: { totalJobs: 0, completedJobs: 0, statusDistribution: [] },
    materialStats: { totalItems: 0, lowStockItems: 0, usageByCategory: [] },
    revenueStats: { totalRevenue: 0, monthlyGrowth: 0, monthlyData: [] },
    electricianStats: { totalElectricians: 0, activeElectricians: 0, topPerformers: [] },
    timeLogStats: { totalHours: 0, averageHours: 0, count: 0 }
  });

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics');
      const data = response.data.data || response.data;
      
      setAnalyticsData({
        jobStats: data.jobStats || { totalJobs: 0, completedJobs: 0, statusDistribution: [] },
        materialStats: data.materialStats || { totalItems: 0, lowStockItems: 0, usageByCategory: [] },
        revenueStats: data.revenueStats || { totalRevenue: 0, monthlyGrowth: 0, monthlyData: [] },
        electricianStats: data.electricianStats || { totalElectricians: 0, activeElectricians: 0, topPerformers: [] },
        timeLogStats: data.timeLogStats || { totalHours: 0, averageHours: 0, count: 0 }
      });
      setLastUpdated(new Date());
    } catch (err) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const revenueChartData = useMemo(() => {
    const monthly = analyticsData.revenueStats.monthlyData || [];
    return {
      labels: monthly.map(item => item.month || 'Month'),
      datasets: [
        {
          label: 'Monthly Revenue (₹)',
          data: monthly.map(item => item.revenue || 0),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99,102,241,0.15)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#818cf8',
          pointBorderColor: '#fff',
          pointRadius: 4
        }
      ]
    };
  }, [analyticsData.revenueStats.monthlyData]);

  const jobStatusData = useMemo(() => {
    const dist = analyticsData.jobStats.statusDistribution || [];
    return {
      labels: dist.map(item => item.name || item.status || 'Status'),
      datasets: [
        {
          data: dist.map(item => item.value || item.count || 0),
          backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#a855f7'],
          borderWidth: 0
        }
      ]
    };
  }, [analyticsData.jobStats.statusDistribution]);

  const materialUsageData = useMemo(() => {
    const usage = analyticsData.materialStats.usageByCategory || [];
    return {
      labels: usage.map(item => item.category || 'Category'),
      datasets: [
        {
          label: 'Stock Quantity',
          data: usage.map(item => item.quantity || 0),
          backgroundColor: 'rgba(34,211,238,0.7)',
          borderRadius: 6
        }
      ]
    };
  }, [analyticsData.materialStats.usageByCategory]);

  const darkChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
      },
      tooltip: {
        backgroundColor: '#0f1117',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        padding: 10
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } }
      },
      tooltip: {
        backgroundColor: '#0f1117',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Performance & Revenue Analytics</h1>
          <div className="page-title-sub">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Live workforce KPIs and financial telemetry'}
          </div>
        </div>
        <button onClick={fetchAnalyticsData} className="btn btn-secondary" disabled={loading}>
          <FaSyncAlt className={loading ? 'spinner' : ''} /> Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>
            <FaMoneyBillWave />
          </div>
          <div className="stat-card-label">Total Revenue</div>
          <div className="stat-card-value" style={{ color: '#6366f1' }}>
            ₹{Number(analyticsData.revenueStats.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-card-meta">
            Growth: <span style={{ color: 'var(--success)' }}>+{analyticsData.revenueStats.monthlyGrowth || 0}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <FaBriefcase />
          </div>
          <div className="stat-card-label">Jobs Completed</div>
          <div className="stat-card-value" style={{ color: '#10b981' }}>
            {analyticsData.jobStats.completedJobs || 0}
            <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 'normal' }}> / {analyticsData.jobStats.totalJobs || 0}</span>
          </div>
          <div className="stat-card-meta">Total Jobs Dispatched</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee' }}>
            <FaUserCheck />
          </div>
          <div className="stat-card-label">Active Technicians</div>
          <div className="stat-card-value" style={{ color: '#22d3ee' }}>
            {analyticsData.electricianStats.activeElectricians || 0}
            <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 'normal' }}> / {analyticsData.electricianStats.totalElectricians || 0}</span>
          </div>
          <div className="stat-card-meta">Field Workforce</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <FaBoxes />
          </div>
          <div className="stat-card-label">Materials Stocked</div>
          <div className="stat-card-value" style={{ color: '#f59e0b' }}>
            {analyticsData.materialStats.totalItems || 0}
          </div>
          <div className="stat-card-meta">
            Low Stock: <span style={{ color: 'var(--warning)' }}>{analyticsData.materialStats.lowStockItems || 0} items</span>
          </div>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="analytics-chart-card card" style={{ height: 360 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Revenue Trends</h3>
          <div style={{ height: 270, position: 'relative' }}>
            <Line data={revenueChartData} options={darkChartOptions} />
          </div>
        </div>

        <div className="analytics-chart-card card" style={{ height: 360 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Job Status Distribution</h3>
          <div style={{ height: 270, position: 'relative' }}>
            <ChartPie data={jobStatusData} options={pieOptions} />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="analytics-chart-card card" style={{ height: 360 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Material Inventory by Category</h3>
          <div style={{ height: 270, position: 'relative' }}>
            <Bar data={materialUsageData} options={darkChartOptions} />
          </div>
        </div>

        <div className="card" style={{ padding: 24, height: 360, overflowY: 'auto' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Top Performing Technicians</h3>
          {analyticsData.electricianStats.topPerformers?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {analyticsData.electricianStats.topPerformers.map((tech, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{tech.name ? tech.name[0] : 'T'}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{tech.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tech.jobsCompleted || 0} jobs completed</div>
                    </div>
                  </div>
                  <span className="badge badge-success">Rating: {tech.rating || '5.0'} ★</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 40 }}>
              <p>No technician performance logs recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;