import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, Repeat, AlertTriangle, BookOpen, Check, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StaffDashboard = () => {
  const { showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.dashboard.getStats(),
      api.requests.getAll({ status: 'PENDING', page: 0, size: 5 })
    ])
      .then(([statsData, reqsData]) => {
        setStats(statsData);
        setPendingRequests(reqsData.content || []);
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.requests.approve(id, 'Approved by library circulation staff');
      showToast('Borrowing request approved');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await api.requests.reject(rejectModalId, rejectRemarks || 'Not approved by circulation desk');
      showToast('Borrowing request rejected');
      setRejectModalId(null);
      setRejectRemarks('');
      loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <Layout title="Circulation Desk & Staff Dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
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
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-teal-light)', color: 'var(--accent-teal)' }}>
            <Repeat size={26} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Currently Issued</div>
            <div className="stat-value">{stats?.totalIssuedBooks || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-rose-light)', color: 'var(--accent-rose)' }}>
            <AlertTriangle size={26} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Overdue Books</div>
            <div className="stat-value">{stats?.overdueIssues || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-600)' }}>
            <BookOpen size={26} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Available In Stock</div>
            <div className="stat-value">{stats?.totalAvailableBooks || 0}</div>
          </div>
        </div>
      </div>

      {/* Pending Requests Queue */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Pending Student Book Requests</h2>
          <Link to="/staff/requests" className="btn btn-secondary btn-sm">
            View All Requests <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="empty-state">
              <p>No student borrowing requests are currently awaiting approval.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student Details</th>
                    <th>Requested Book</th>
                    <th>Request Date</th>
                    <th>Remarks</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.userName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.userEmail}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.bookTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISBN: {r.bookIsbn}</div>
                      </td>
                      <td>{new Date(r.requestDate).toLocaleDateString()}</td>
                      <td>{r.remarks || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            title="Approve Request"
                            onClick={() => handleApprove(r.id)}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Reject Request"
                            onClick={() => setRejectModalId(r.id)}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Remarks Modal */}
      {rejectModalId && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Reject Book Request</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setRejectModalId(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleReject}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Reason for Rejection *</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    required
                    placeholder="e.g. Reserved for exam reference, high fine balance on account..."
                    value={rejectRemarks}
                    onChange={(e) => setRejectRemarks(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setRejectModalId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
