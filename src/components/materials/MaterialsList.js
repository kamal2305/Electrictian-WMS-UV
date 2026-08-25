import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../config/axios';
import { useAuth } from '../../hooks/useAuth';
import {
  FaPlus, FaSearch, FaTrash, FaEdit, FaIndustry
} from 'react-icons/fa';

const MaterialsList = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

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
      m.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || (m.category || 'General') === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSKUs = materials.length;
  const totalUnits = materials.reduce((sum, m) => sum + (m.quantity || 0), 0);
  const lowStockCount = materials.filter(m => (m.quantity || 0) <= (m.minStock || 5)).length;
  const totalValuation = materials.reduce((sum, m) => sum + ((m.unitPrice || 0) * (m.quantity || 0)), 0);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Section with Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Inventory Management
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0', maxWidth: 600 }}>
            Real-time tracking of electrical components, high-voltage breakers, wiring spools, and job allocations.
          </p>
        </div>

        {user?.role === 'admin' && (
          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              to="/materials/create"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_box</span>
              <span>New Material SKU</span>
            </Link>
          </div>
        )}
      </div>

      {/* Top 4 Bento Metric Cards (Stitch Inventory Layout) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16
      }}>
        {/* Metric 1: Total SKUs */}
        <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: 20 }}>inventory_2</span>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>TOTAL CATALOG SKUS</span>
          </div>
          <div className="font-display-stat" style={{ color: 'var(--text-primary)' }}>{totalSKUs}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }} className="font-data-mono">
            Unique Catalog Items
          </div>
        </div>

        {/* Metric 2: Total Units in Stock */}
        <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 20 }}>layers</span>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>TOTAL UNITS IN STOCK</span>
          </div>
          <div className="font-display-stat" style={{ color: 'var(--text-primary)' }}>{totalUnits.toLocaleString('en-IN')}</div>
          <div style={{ color: 'var(--accent)', fontSize: 12, marginTop: 4 }} className="font-data-mono">
            Live Warehouse Count
          </div>
        </div>

        {/* Metric 3: Low Stock Alerts */}
        <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--danger)', fontSize: 20 }}>warning</span>
              <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>LOW STOCK ALERTS</span>
            </div>
            {lowStockCount > 0 && <span className="pulse-indicator" style={{ background: 'var(--danger)' }}></span>}
          </div>
          <div className="font-display-stat" style={{ color: lowStockCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {lowStockCount}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }} className="font-data-mono">
            {lowStockCount > 0 ? 'Reorder threshold reached' : 'Stock levels optimal'}
          </div>
        </div>

        {/* Metric 4: Inventory Valuation */}
        <div className="card" style={{ padding: 20, position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--teal)', fontSize: 20 }}>account_balance</span>
            <span className="font-label-caps" style={{ color: 'var(--text-muted)' }}>INVENTORY VALUATION</span>
          </div>
          <div className="font-display-stat" style={{ color: 'var(--text-primary)', fontSize: 26 }}>
            ₹{totalValuation.toLocaleString('en-IN')}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }} className="font-data-mono">
            Estimated Asset Value
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        paddingBottom: 12,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className="font-label-caps"
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                background: filterCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                color: filterCategory === cat ? '#690000' : 'var(--text-muted)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'var(--transition-fast)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input & View Switch */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            minWidth: 260
          }}>
            <FaSearch style={{ color: 'var(--text-muted)', fontSize: 12 }} />
            <input
              type="text"
              placeholder="Search material SKU, category, supplier..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: 'var(--text)',
                padding: 0,
                width: '100%'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: 2
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--primary-active)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--primary-active)' : 'transparent',
                color: viewMode === 'list' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                cursor: 'pointer',
                display: 'flex'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>view_list</span>
            </button>
          </div>
        </div>
      </div>

      {/* Materials Grid / List */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading warehouse inventory...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 12 }}>inventory_2</span>
          <h3>No Materials Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 400, margin: '8px auto 16px' }}>
            {searchTerm ? 'Try adjusting your search criteria' : 'Register your first material SKU to begin tracking electrical components.'}
          </p>
          <Link to="/materials/create" className="btn btn-primary btn-sm">
            <FaPlus /> Add New SKU
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : '1fr',
          gap: 20
        }}>
          {filtered.map(mat => {
            const isLowStock = (mat.quantity || 0) <= (mat.minStock || 5);
            const stockRatio = Math.min(100, Math.max(10, ((mat.quantity || 0) / ((mat.minStock || 5) * 4)) * 100));

            return (
              <div
                key={mat._id}
                className="card"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  border: isLowStock ? '1px solid rgba(255, 180, 171, 0.4)' : '1px solid var(--border)',
                  position: 'relative'
                }}
              >
                {/* SKU Code & Category */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-data-mono" style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: isLowStock ? 'var(--danger)' : 'var(--accent)',
                    background: 'var(--bg-elevated)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {mat.sku || `SKU-${mat.name.slice(0, 3).toUpperCase()}-${mat._id.slice(-4)}`}
                  </span>

                  <span className="badge badge-info" style={{ fontSize: 10 }}>
                    {mat.category || 'General'}
                  </span>
                </div>

                {/* Material Title */}
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {mat.name}
                  </h3>
                  {mat.supplier && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      <FaIndustry style={{ fontSize: 10, color: 'var(--text-dim)' }} />
                      <span>{mat.supplier}</span>
                    </div>
                  )}
                </div>

                {/* Stock Level Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="font-label-caps" style={{ color: 'var(--text-muted)', fontSize: 10 }}>AVAILABLE QUANTITY</span>
                    <span className="font-data-mono" style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: isLowStock ? 'var(--danger)' : 'var(--text-primary)'
                    }}>
                      {mat.quantity || 0} {mat.unit || 'units'}
                    </span>
                  </div>

                  {/* Visual Progress Line */}
                  <div style={{
                    height: 6,
                    background: 'var(--bg-card)',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${stockRatio}%`,
                      background: isLowStock ? 'var(--danger)' : 'var(--accent)',
                      borderRadius: 3
                    }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-dim)' }}>
                    <span>Min Stock: {mat.minStock || 5}</span>
                    <span>Unit: ₹{mat.unitPrice || 0}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                  <Link
                    to={`/materials/${mat._id}`}
                    style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)' }}
                  >
                    View Details →
                  </Link>

                  {user?.role === 'admin' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link
                        to={`/materials/${mat._id}/edit`}
                        className="btn btn-secondary btn-sm"
                        title="Edit Material"
                      >
                        <FaEdit />
                      </Link>
                      <button
                        onClick={() => handleDelete(mat._id, mat.name)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)' }}
                        title="Delete Material"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MaterialsList;
