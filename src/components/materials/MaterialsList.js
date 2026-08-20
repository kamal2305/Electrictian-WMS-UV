import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../config/axios';
import { useAuth } from '../../hooks/useAuth';
import { FaBoxes, FaPlus, FaSearch, FaTrash, FaEdit, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

const MaterialsList = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.get('/materials');
      if (response.data.success) {
        setMaterials(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name || 'this material'}"?`)) return;
    try {
      await api.delete(`/materials/${id}`);
      setMaterials(materials.filter(m => m._id !== id));
      toast.success('Material deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete material');
    }
  };

  const categories = ['All', ...new Set(materials.map(m => m.category || 'General'))];

  const filtered = materials.filter(m => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || (m.category || 'General') === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSKUs = materials.length;
  const totalUnits = materials.reduce((sum, m) => sum + (m.quantity || 0), 0);
  const lowStockCount = materials.filter(m => (m.quantity || 0) <= (m.minStock || 5)).length;
  const totalValuation = materials.reduce((sum, m) => sum + ((m.unitPrice || 0) * (m.quantity || 0)), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Materials & Parts Inventory</h1>
          <div className="page-title-sub">
            Track electrical stock, wires, fixtures, unit costs and job consumption
          </div>
        </div>
        {user?.role === 'admin' && (
          <div className="action-buttons">
            <Link to="/materials/create" className="btn btn-primary">
              <FaPlus /> Add New Material
            </Link>
          </div>
        )}
      </div>

      {/* KPI Metrics */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Total Materials</div>
          <div className="stat-card-value" style={{ color: 'var(--primary)' }}>
            {totalSKUs}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Unique registered catalog items</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Total Stock Units</div>
          <div className="stat-card-value" style={{ color: 'var(--accent)' }}>
            {totalUnits.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Cumulative units across all SKUs</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Low Stock Alerts</div>
          <div className="stat-card-value" style={{ color: lowStockCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {lowStockCount}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {lowStockCount > 0 ? 'Items below re-order threshold' : 'All SKUs adequately stocked'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Total Inventory Valuation</div>
          <div className="stat-card-value" style={{ color: 'var(--success)' }}>
            ₹{totalValuation.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Total asset replacement value</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-bar" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
          <FaSearch className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search material by name, category, or supplier..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ minWidth: 160 }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading inventory catalog...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state card">
          <FaBoxes className="empty-state-icon" />
          <h3>No Materials Found</h3>
          <p>{searchTerm ? 'No material matches your search query' : 'Get started by cataloging your first electrical material SKU'}</p>
          {user?.role === 'admin' && !searchTerm && (
            <Link to="/materials/create" className="btn btn-primary" style={{ marginTop: 12 }}>
              <FaPlus /> Add Material
            </Link>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Material / Item Name</th>
                  <th>Category</th>
                  <th>Quantity / Unit</th>
                  <th>Unit Price</th>
                  <th>Total Valuation</th>
                  <th>Stock Status</th>
                  {user?.role === 'admin' && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => {
                  const itemValuation = (m.quantity || 0) * (m.unitPrice || 0);
                  const isLowStock = (m.quantity || 0) <= (m.minStock || 5);
                  return (
                    <tr key={m._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{m.name}</div>
                        {m.supplier && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Supplier: {m.supplier}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-secondary">{m.category || 'General'}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{m.quantity || 0}</span> {m.unit || 'units'}
                      </td>
                      <td>₹{(m.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                        ₹{itemValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        {isLowStock ? (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <FaExclamationTriangle /> Low Stock (≤{m.minStock || 5})
                          </span>
                        ) : (
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <FaCheckCircle /> In Stock
                          </span>
                        )}
                      </td>
                      {user?.role === 'admin' && (
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <Link
                              to={`/materials/edit/${m._id}`}
                              className="btn btn-secondary btn-sm"
                              title="Edit Material"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() => handleDelete(m._id, m.name)}
                              className="btn btn-danger btn-sm"
                              title="Delete Material"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsList;
