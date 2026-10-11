import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, XCircle, RefreshCw } from 'lucide-react';

export const StudentRequestsPage = () => {
  const { showToast } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = () => {
    setLoading(true);
    api.requests.getMyRequests()
      .then(res => setRequests(res.content || []))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancelRequest = async (id) => {
    try {
      await api.requests.cancel(id);
      showToast('Request cancelled');
      loadRequests();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <Layout title="My Book Requests">
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Borrowing Request Status</h2>
          <button className="btn btn-secondary btn-sm" onClick={loadRequests}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <p>You have not submitted any book requests yet.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Requested Book</th>
                    <th>Date Requested</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Processed By</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.bookTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISBN: {r.bookIsbn}</div>
                      </td>
                      <td>{new Date(r.requestDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${
                          r.status === 'APPROVED' ? 'badge-approved' :
                          r.status === 'PENDING' ? 'badge-pending' :
                          r.status === 'REJECTED' ? 'badge-rejected' : 'badge-cancelled'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{r.remarks || '—'}</td>
                      <td>{r.processedByName ? `${r.processedByName} (${new Date(r.processedAt).toLocaleDateString()})` : 'Awaiting review'}</td>
                      <td style={{ textAlign: 'right' }}>
                        {r.status === 'PENDING' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--accent-rose)' }}
                            onClick={() => handleCancelRequest(r.id)}
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
