import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Repeat, Calendar } from 'lucide-react';

export const StudentBorrowingsPage = () => {
  const { showToast } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.issues.getMyIssues({ size: 50 })
      .then(res => setIssues(res.content || []))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="My Borrowing Records">
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Book Checkout & Return History</h2>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <p>You have no loan records in your library history.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Book Details</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                    <th>Fine Incurred</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.bookTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISBN: {item.bookIsbn}</div>
                      </td>
                      <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                        {item.overdueDays > 0 && item.status !== 'RETURNED' && (
                          <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', fontWeight: 600 }}>
                            ({item.overdueDays} days overdue)
                          </span>
                        )}
                      </td>
                      <td>
                        {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <span className={`badge ${
                          item.status === 'RETURNED' ? 'badge-returned' : 
                          item.status === 'OVERDUE' ? 'badge-overdue' : 'badge-issued'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        {item.fineAmount && parseFloat(item.fineAmount) > 0 ? (
                          <span style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>
                            ₹{item.fineAmount}
                          </span>
                        ) : '₹0.00'}
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
