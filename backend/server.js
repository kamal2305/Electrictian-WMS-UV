const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL 
    ? [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'] 
    : true,
  credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/users', require('./routes/users'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/timelogs', require('./routes/timelogs'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/dashboard', require('./routes/analytics'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/settings', require('./routes/settings'));

// Reports route alias
app.use('/api/reports', require('./routes/timelogs'));

// Health check
app.get('/api/diagnostics/status', (req, res) => res.json({ status: 'ok', message: 'ElectroTrack WMS API running' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404
app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`\x1b[32m✓ ElectroTrack API running on port ${PORT}\x1b[0m`));

module.exports = app;
