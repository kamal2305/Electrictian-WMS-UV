import React, { useState, useEffect } from 'react';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { FaBuilding, FaSave, FaReceipt, FaLandmark } from 'react-icons/fa';

const Settings = () => {
  const [formData, setFormData] = useState({
    companyName: 'ElectroTrack WMS',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyGstin: '',
    defaultTaxRate: 18,
    currencySymbol: '₹',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    invoicePrefix: 'INV',
    invoiceTerms: '1. Payment is due within 15 days of invoice date.\n2. Interest @ 18% p.a. will be charged on overdue bills.\n3. Goods once sold will not be taken back.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        if (res.data.success && res.data.data) {
          setFormData(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        toast.error('Failed to load company settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'defaultTaxRate' ? Number(value) : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/settings', formData);
      toast.success('Company settings saved successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <div className="page-header">
        <div>
          <h1>Company & Billing Settings</h1>
          <div className="page-title-sub">Configure invoice branding, tax rates, bank details, and legal terms</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Company Info */}
        <div className="settings-card card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <FaBuilding style={{ color: 'var(--primary)', fontSize: 18 }} />
            <h3 style={{ margin: 0, padding: 0, border: 'none' }}>Company Profile & Branding</h3>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Company / Trade Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Spark Electricals & Contracting"
                required
              />
            </div>
            <div className="form-group">
              <label>GSTIN / Tax Registration</label>
              <input
                type="text"
                name="companyGstin"
                value={formData.companyGstin}
                onChange={handleChange}
                placeholder="33AAAAA0000A1Z5"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Business Phone</label>
              <input
                type="text"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="form-group">
              <label>Business Email</label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleChange}
                placeholder="accounts@company.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Registered Address</label>
            <textarea
              name="companyAddress"
              rows="2"
              value={formData.companyAddress}
              onChange={handleChange}
              placeholder="Shop No. 4, Power Grid Lane, Industrial Area..."
            />
          </div>
        </div>

        {/* Invoicing Defaults */}
        <div className="settings-card card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <FaReceipt style={{ color: 'var(--accent)', fontSize: 18 }} />
            <h3 style={{ margin: 0, padding: 0, border: 'none' }}>Invoice Defaults</h3>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Default GST/Tax (%)</label>
              <input
                type="number"
                name="defaultTaxRate"
                min="0"
                max="100"
                step="0.5"
                value={formData.defaultTaxRate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Currency Symbol</label>
              <input
                type="text"
                name="currencySymbol"
                value={formData.currencySymbol}
                onChange={handleChange}
                placeholder="₹ or $"
              />
            </div>
            <div className="form-group">
              <label>Invoice Prefix</label>
              <input
                type="text"
                name="invoicePrefix"
                value={formData.invoicePrefix}
                onChange={handleChange}
                placeholder="INV"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Standard Terms & Conditions (Appears on all PDF Invoices)</label>
            <textarea
              name="invoiceTerms"
              rows="4"
              value={formData.invoiceTerms}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Bank & Payment Details */}
        <div className="settings-card card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <FaLandmark style={{ color: 'var(--success)', fontSize: 18 }} />
            <h3 style={{ margin: 0, padding: 0, border: 'none' }}>Bank & Payment Details</h3>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank"
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="50200012345678"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="HDFC0001234"
              />
            </div>
            <div className="form-group">
              <label>UPI ID (For QR / Instant Payment)</label>
              <input
                type="text"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="merchant@upi"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 40 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
