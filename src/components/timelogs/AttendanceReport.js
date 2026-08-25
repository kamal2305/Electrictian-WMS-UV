import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import { FaFileDownload, FaPrint, FaCalendarAlt, FaUserTie } from 'react-icons/fa';
import './AttendanceReport.css';

const AttendanceReport = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [week, setWeek] = useState(getWeekValue());
  const [electricians, setElectricians] = useState([]);
  const [selectedElectrician, setSelectedElectrician] = useState('all');
  const [detailedView, setDetailedView] = useState(false);

  // Calculate current week value for the input
  function getWeekValue() {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((now - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }
  
  // Fetch electricians on component mount
  useEffect(() => {
    const fetchElectricians = async () => {
      try {
        const response = await api.get('/users?role=electrician');
        if (response.data.success) {
          setElectricians(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching electricians:', error);
        toast.error('Failed to load electricians');
      }
    };
    
    fetchElectricians();
  }, []);

  const generateReport = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let endpoint = '/timelogs/reports/attendance';
      const params = { 
        ...(reportType === 'daily' ? { date } : { week: formatWeekToDate(week) }),
        ...(selectedElectrician !== 'all' ? { electrician: selectedElectrician } : {}),
        detailed: detailedView
      };
      
      const response = await api.get(endpoint, { params });
      setReportData(response.data.data);
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Convert week format (YYYY-Www) to a date for the API
  function formatWeekToDate(weekStr) {
    const [year, weekNum] = weekStr.split('-W');
    const firstDayOfYear = new Date(parseInt(year), 0, 1);
    const days = 1 + (parseInt(weekNum) - 1) * 7;
    const resDate = new Date(firstDayOfYear.setDate(days));
    return resDate.toISOString().split('T')[0];
  }

  // Export to CSV
  const exportToCSV = () => {
    if (!reportData) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Electrician Name,Email,Total Hours,Log Count\n';
    
    reportData.electricians.forEach(electrician => {
      csvContent += `${electrician.name},${electrician.email},${electrician.totalHours},${electrician.logCount}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportData.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report exported to CSV');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="page-container">
        <div className="unauthorized-message">Only administrators can access attendance reports.</div>
      </div>
    );
  }

  return (
    <div className="page-container attendance-report-page">
      <div className="page-header">
        <div>
          <h1>Daily Attendance Reports</h1>
          <div className="page-title-sub">Track employee attendance, work hours, and productivity telemetry</div>
        </div>
      </div>
      
      <form onSubmit={generateReport} className="report-form-card">
        <div className="report-form-grid">
          {/* Col 1: Report Type */}
          <div className="report-form-group">
            <label>Report Frequency</label>
            <div className="report-type-selector">
              <button
                type="button"
                className={`report-type-btn ${reportType === 'daily' ? 'selected' : ''}`}
                onClick={() => setReportType('daily')}
              >
                <FaCalendarAlt /> Daily Report
              </button>
              <button
                type="button"
                className={`report-type-btn ${reportType === 'weekly' ? 'selected' : ''}`}
                onClick={() => setReportType('weekly')}
              >
                <FaCalendarAlt /> Weekly Report
              </button>
            </div>
          </div>
          
          {/* Col 2: Electrician Selector */}
          <div className="report-form-group">
            <label htmlFor="electrician">Electrician</label>
            <select
              id="electrician"
              value={selectedElectrician}
              onChange={(e) => setSelectedElectrician(e.target.value)}
            >
              <option value="all">All Electricians</option>
              {electricians.map(elec => (
                <option key={elec._id} value={elec._id}>
                  {elec.name}
                </option>
              ))}
            </select>
          </div>

          {/* Col 3: Date/Week Picker */}
          <div className="report-form-group">
            <label htmlFor="report-date">
              {reportType === 'daily' ? 'Select Date' : 'Select Week'}
            </label>
            {reportType === 'daily' ? (
              <input
                type="date"
                id="report-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            ) : (
              <input
                type="week"
                id="report-date"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                max={getWeekValue()}
              />
            )}
          </div>
          
          {/* Col 4: Checkbox option */}
          <div className="report-form-group" style={{ justifyContent: 'center' }}>
            <label className="report-checkbox-row">
              <input
                type="checkbox"
                checked={detailedView}
                onChange={() => setDetailedView(!detailedView)}
              />
              <span className="report-checkbox-label">Include Detailed Session Logs</span>
            </label>
          </div>
        </div>
        
        <div className="report-actions">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </form>
      
      {reportData && (
        <div className="report-results-card">
          <div className="report-results-header">
            <div>
              <h3>{reportData.title}</h3>
              <p>Generated: {new Date(reportData.generatedAt).toLocaleString()}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={exportToCSV}
              >
                <FaFileDownload /> Export CSV
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => window.print()}
              >
                <FaPrint /> Print
              </button>
            </div>
          </div>
          
          <div className="report-summary-grid">
            <div className="report-summary-tile">
              <h4>Total Electricians</h4>
              <div className="report-summary-value">{reportData.electriciansCount}</div>
            </div>
            <div className="report-summary-tile">
              <h4>Total Logs</h4>
              <div className="report-summary-value">{reportData.timeLogsCount}</div>
            </div>
            <div className="report-summary-tile">
              <h4>Total Hours</h4>
              <div className="report-summary-value">{reportData.totalHours}</div>
              <span className="report-summary-sub">Hours Worked</span>
            </div>
            <div className="report-summary-tile">
              <h4>Avg. / Person</h4>
              <div className="report-summary-value">
                {reportData.electriciansCount > 0 
                  ? (reportData.totalHours / reportData.electriciansCount).toFixed(1) 
                  : '0'}
              </div>
              <span className="report-summary-sub">Hours / Person</span>
            </div>
          </div>
          
          <div className="table-container" style={{ marginTop: 24 }}>
            <table>
              <thead>
                <tr>
                  <th>Electrician</th>
                  <th>Email</th>
                  <th>Hours Logged</th>
                  <th>Sessions</th>
                  <th>Avg / Session</th>
                </tr>
              </thead>
              <tbody>
                {reportData.electricians.map(elec => (
                  <tr key={elec.id || elec.email}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FaUserTie style={{ color: 'var(--primary)' }} />
                        {elec.name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{elec.email}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {elec.totalHours} hrs
                    </td>
                    <td>{elec.logCount}</td>
                    <td>
                      {elec.logCount > 0 ? (elec.totalHours / elec.logCount).toFixed(1) : 0} hrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;