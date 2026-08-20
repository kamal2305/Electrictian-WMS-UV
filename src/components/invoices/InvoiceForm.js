import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../config/axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaTrash, FaSave, FaCalculator } from 'react-icons/fa';

const InvoiceForm = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    customer: searchParams.get('customerId') || '',
    job: searchParams.get('jobId') || '',
    client: { name: '', phone: '', email: '', address: '' },
    dueDate: '',
    items: [
      { description: 'Electrical Installation / Wiring Service', quantity: 1, unitPrice: 0, total: 0 }
    ],
    labourCost: 0,
    materialCost: 0,
    transportCharge: 0,
    serviceCharge: 0,
    otherCharge: 0,
    otherChargeLabel: '',
    discount: 0,
    discountType: 'percentage',
    taxRate: 18,
    status: 'Draft',
    paymentMethod: 'Cash',
    amountPaid: 0,
    transactionId: '',
    notes: '',
    termsAndConditions: '1. Payment is due within 15 days of invoice date.\n2. Goods once installed are subject to warranty terms.'
  });

  // Load Customers, Jobs, Settings, and existing Invoice if editing
  useEffect(() => {
    const initData = async () => {
      try {
        setFetching(true);
        const [custRes, jobsRes, settRes] = await Promise.all([
          api.get('/customers').catch(() => ({ data: { data: [] } })),
          api.get('/jobs').catch(() => ({ data: { data: [] } })),
          api.get('/settings').catch(() => ({ data: { data: null } }))
        ]);

        if (custRes.data?.data) setCustomers(custRes.data.data);
        if (jobsRes.data?.data) setJobs(jobsRes.data.data);

        // Apply settings defaults if creating new
        if (!isEdit && settRes.data?.data) {
          const s = settRes.data.data;
          setFormData(prev => ({
            ...prev,
            taxRate: s.defaultTaxRate ?? 18,
            termsAndConditions: s.invoiceTerms || prev.termsAndConditions
          }));
        }

        if (isEdit) {
          const invRes = await api.get(`/invoices/${id}`);
          if (invRes.data.success) {
            const d = invRes.data.data;
            setFormData({
              customer: d.customer?._id || d.customer || '',
              job: d.job?._id || d.job || '',
              client: d.client || { name: '', phone: '', email: '', address: '' },
              dueDate: d.dueDate ? d.dueDate.slice(0, 10) : '',
              items: d.items?.length > 0 ? d.items : [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
              labourCost: d.labourCost || 0,
              materialCost: d.materialCost || 0,
              transportCharge: d.transportCharge || 0,
              serviceCharge: d.serviceCharge || 0,
              otherCharge: d.otherCharge || 0,
              otherChargeLabel: d.otherChargeLabel || '',
              discount: d.discount || 0,
              discountType: d.discountType || 'percentage',
              taxRate: d.taxRate ?? 18,
              status: d.status || 'Draft',
              paymentMethod: d.paymentMethod || 'Cash',
              amountPaid: d.amountPaid || 0,
              transactionId: d.transactionId || '',
              notes: d.notes || '',
              termsAndConditions: d.termsAndConditions || ''
            });
          }
        }
      } catch (err) {
        toast.error('Failed to load form prerequisites');
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id, isEdit]);

  // When customer dropdown changes, auto-populate client details
  const handleCustomerSelect = (customerId) => {
    const selected = customers.find(c => c._id === customerId);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        customer: customerId,
        client: {
          name: selected.name || '',
          phone: selected.phone || '',
          email: selected.email || '',
          address: selected.address || ''
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, customer: '' }));
    }
  };

  // Line items manipulation
  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = field === 'description' ? value : Number(value) || 0;
    if (field === 'quantity' || field === 'unitPrice') {
      updated[index].total = Number((updated[index].quantity * updated[index].unitPrice).toFixed(2));
    }
    setFormData(prev => ({ ...prev, items: updated }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) {
      toast.warning('Invoice must have at least one line item');
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Calculations
  const itemsSubtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const baseSubtotal = itemsSubtotal + Number(formData.labourCost || 0) + Number(formData.materialCost || 0);
  const extraCharges = Number(formData.transportCharge || 0) + Number(formData.serviceCharge || 0) + Number(formData.otherCharge || 0);

  let discountAmount = 0;
  if (formData.discountType === 'percentage') {
    discountAmount = (baseSubtotal * Number(formData.discount || 0)) / 100;
  } else {
    discountAmount = Number(formData.discount || 0);
  }

  const taxableAmount = Math.max(0, baseSubtotal - discountAmount + extraCharges);
  const taxAmount = (taxableAmount * Number(formData.taxRate || 0)) / 100;
  const totalAmount = taxableAmount + taxAmount;
  const balanceDue = Math.max(0, totalAmount - Number(formData.amountPaid || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.client.name.trim()) {
      toast.error('Customer / Client name is required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        customer: formData.customer || null,
        job: formData.job || null,
        totalAmount
      };

      if (isEdit) {
        await api.put(`/invoices/${id}`, payload);
        toast.success('Invoice updated successfully');
      } else {
        await api.post('/invoices', payload);
        toast.success('Invoice created successfully');
      }
      navigate('/invoices');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading invoice data...</span>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>
      <div className="page-header">
        <div>
          <Link to="/invoices" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
            <FaArrowLeft /> Back to Invoices
          </Link>
          <h1>{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</h1>
          <div className="page-title-sub">Generate itemized billing with labour, parts, taxes and discounts</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Customer & Job Linkage */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>1. Customer & Job Information</h3>
          
          <div className="form-grid-2">
            <div className="form-group">
              <label>Select Existing Customer</label>
              <select
                value={formData.customer}
                onChange={e => handleCustomerSelect(e.target.value)}
              >
                <option value="">-- Choose registered customer or enter manually below --</option>
                {customers.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''} {c.company ? `[${c.company}]` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Link to Job (Optional)</label>
              <select
                value={formData.job}
                onChange={e => setFormData({ ...formData, job: e.target.value })}
              >
                <option value="">-- Direct Sale / No Job Link --</option>
                {jobs.map(j => (
                  <option key={j._id} value={j._id}>{j.title} ({j.status})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Client Name *</label>
              <input
                type="text"
                value={formData.client.name}
                onChange={e => setFormData({ ...formData, client: { ...formData.client, name: e.target.value } })}
                placeholder="Full name or company"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={formData.client.phone}
                onChange={e => setFormData({ ...formData, client: { ...formData.client, phone: e.target.value } })}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.client.email}
                onChange={e => setFormData({ ...formData, client: { ...formData.client, email: e.target.value } })}
                placeholder="client@email.com"
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Billing Address</label>
            <input
              type="text"
              value={formData.client.address}
              onChange={e => setFormData({ ...formData, client: { ...formData.client, address: e.target.value } })}
              placeholder="Site or Billing Address"
            />
          </div>
        </div>

        {/* Itemized Line Items */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>2. Itemized Services & Materials</h3>
            <button type="button" onClick={addItem} className="btn btn-outline btn-sm">
              <FaPlus /> Add Line Item
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {formData.items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 130px 120px 40px', gap: 12, alignItems: 'center' }}>
                <div>
                  <input
                    type="text"
                    placeholder="Description of item or service"
                    value={item.description}
                    onChange={e => handleItemChange(idx, 'description', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Unit Price (₹)"
                    value={item.unitPrice}
                    onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                    required
                  />
                </div>
                <div style={{ fontWeight: 600, textAlign: 'right', paddingRight: 8, fontSize: 14 }}>
                  ₹{(item.quantity * item.unitPrice).toFixed(2)}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '8px 10px' }}
                    title="Remove row"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Extra Charges, Discounts & Taxes */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>3. Labour, Extra Charges & Tax Rates</h3>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Labour Cost (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.labourCost}
                onChange={e => setFormData({ ...formData, labourCost: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Direct Material Cost (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.materialCost}
                onChange={e => setFormData({ ...formData, materialCost: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Transport / Delivery Charge (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.transportCharge}
                onChange={e => setFormData({ ...formData, transportCharge: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Service Charge (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.serviceCharge}
                onChange={e => setFormData({ ...formData, serviceCharge: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Other Charge Label</label>
              <input
                type="text"
                placeholder="e.g. Urgent Dispatch Fee"
                value={formData.otherChargeLabel}
                onChange={e => setFormData({ ...formData, otherChargeLabel: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Other Charge (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.otherCharge}
                onChange={e => setFormData({ ...formData, otherCharge: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Discount Value</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Discount Type</label>
              <select
                value={formData.discountType}
                onChange={e => setFormData({ ...formData, discountType: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="form-group">
              <label>GST / Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={formData.taxRate}
                onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Payment & Status Tracking */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>4. Payment & Settlement</h3>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Invoice Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                <option value="Cash">Cash</option>
                <option value="UPI / QR">UPI / QR</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Amount Already Received (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amountPaid}
                onChange={e => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Payment Reference / UTR / Cheque No.</label>
            <input
              type="text"
              placeholder="e.g. UPI Ref: 324109827391"
              value={formData.transactionId}
              onChange={e => setFormData({ ...formData, transactionId: e.target.value })}
            />
          </div>
        </div>

        {/* Calculation Summary Box */}
        <div className="card" style={{ padding: 24, marginBottom: 20, background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FaCalculator style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Invoice Summary Calculation</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Line Items Subtotal:</span>
              <span>₹{itemsSubtotal.toFixed(2)}</span>
            </div>
            {(Number(formData.labourCost) > 0 || Number(formData.materialCost) > 0) && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Labour & Direct Material:</span>
                <span>₹{(Number(formData.labourCost || 0) + Number(formData.materialCost || 0)).toFixed(2)}</span>
              </div>
            )}
            {extraCharges > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transport & Other Extra Charges:</span>
                <span>₹{extraCharges.toFixed(2)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--danger)' }}>
                <span>Discount ({formData.discountType === 'percentage' ? `${formData.discount}%` : 'Fixed'}):</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>GST / Tax ({formData.taxRate}%):</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
              <span>Grand Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            {Number(formData.amountPaid) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--success)' }}>
                <span>Amount Received:</span>
                <span>-₹{Number(formData.amountPaid).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 600, color: balanceDue > 0 ? 'var(--warning)' : 'var(--success)' }}>
              <span>Balance Due:</span>
              <span>₹{balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <div className="form-group">
            <label>Notes / Work Details</label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any specific comments, warranty details, or work notes..."
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Terms & Conditions</label>
            <textarea
              rows="3"
              value={formData.termsAndConditions}
              onChange={e => setFormData({ ...formData, termsAndConditions: e.target.value })}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 40 }}>
          <Link to="/invoices" className="btn btn-secondary btn-lg">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : isEdit ? 'Update Invoice' : 'Generate Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;