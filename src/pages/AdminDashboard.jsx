import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { 
  BookOpen, 
  Users, 
  Repeat, 
  AlertTriangle, 
  DollarSign, 
  ClipboardList, 
  CheckCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboard.getStats()
      .then(data => setStats(data))
      .catch(err => setError(err.message || 'Failed to load statistics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Administrator Overview">
      {error && (
        <div className="badge badge-rejected" style={{ width: '100%', padding: '12px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
          <p style={{ marginTop: '12px' }}>Loading real-time library analytics...</p>
        </div>
      ) : (
        <>
          {/* Analytics Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-600)' }}>
                <BookOpen size={26} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Titles / Inventory</div>
                <div className="stat-value">{stats?.totalBooks || 0} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>({stats?.totalAvailableBooks || 0} Avail)</span></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-teal-light)', color: 'var(--accent-teal)' }}>
                <Repeat size={26} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Currently Issued</div>
                <div className="stat-value">{stats?.totalIssuedBooks || 0}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-sky-light)', color: 'var(--accent-sky)' }}>
                <Users size={26} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Registered Members</div>
                <div className="stat-value">{stats?.totalUsers || 0} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({stats?.totalStudents || 0} students)</span></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-amber-light)', color: 'var(--accent-amber)' }}>
                <ClipboardList size={26} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Pending Requests</div>
                <div className="stat-value">{stats?.pendingRequests || 0}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-rose-light)', color: 'var(--accent-rose)' }}>
                <AlertTriangle size={26} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Overdue Returns</div>
                <div className="stat-value">{stats?.overdueIssues || 0}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                <DollarSign size={26} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Outstanding Fines</div>
                <div className="stat-value">₹{stats?.outstandingFinesAmount || '0.00'}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}>
                <TrendingUp size={26} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Total Fines Settled</div>
                <div className="stat-value">₹{stats?.collectedFinesAmount || '0.00'}</div>
              </div>
            </div>
          </div>

          {/* Quick Management Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">Catalogue Operations</h3>
              </div>
              <div className="card-body">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Manage book editions, stock counts, rack locations, and inventory constraints.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link to="/admin/books" className="btn btn-primary btn-sm">
                    Open Book Manager <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">User Accounts & Security</h3>
              </div>
              <div className="card-body">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Manage student and library staff credentials, account activation, and role assignments.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link to="/admin/users" className="btn btn-secondary btn-sm">
                    Manage Users <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">Circulation & Overdue Monitoring</h3>
              </div>
              <div className="card-body">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Monitor active loans, automatic ₹10/day overdue fines, and fee collections.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Link to="/admin/issues" className="btn btn-secondary btn-sm">
                    Circulation Records <ArrowRight size={14} />
                  </Link>
                  <Link to="/admin/fines" className="btn btn-secondary btn-sm">
                    Fines & Payments <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};
