import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Repeat, ClipboardList, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard = () => {
  const { user, showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.dashboard.getStats(),
      api.issues.getMyIssues({ page: 0, size: 5 })
    ])
      .then(([statsData, issuesData]) => {
        setStats(statsData);
        setMyIssues(issuesData.content || []);
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title={`Welcome, ${user?.fullName || 'Student'}!`}>
      {/* Student Personal Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-600)' }}>
            <Repeat size={26} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Currently Borrowed</div>
            <div className="stat-value">{stats?.totalIssuedBooks || 0}</div>
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
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
            <DollarSign size={26} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Outstanding Fine Balance</div>
            <div className="stat-value">₹{stats?.outstandingFinesAmount || '0.00'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--accent-teal-light)', color: 'var(--accent-teal)' }}>
            <BookOpen size={26} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Library Titles Available</div>
            <div className="stat-value">{stats?.totalAvailableBooks || 0}</div>
          </div>
        </div>
      </div>

      {/* Currently Issued Books */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Currently Borrowed Books & Due Dates</h2>
          <Link to="/student/borrowings" className="btn btn-secondary btn-sm">
            Full Borrowing History <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
            </div>
          ) : myIssues.length === 0 ? (
            <div className="empty-state">
              <p>You have no active book loans. Explore the catalog to request your next book!</p>
              <Link to="/student/catalogue" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                Browse Book Catalog
              </Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {myIssues.map(item => (
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
                        {item.overdueDays > 0 ? (
                          <span style={{ color: 'var(--accent-rose)', fontSize: '0.78rem', fontWeight: 600 }}>
                            {item.overdueDays} days overdue!
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-teal)', fontSize: '0.78rem' }}>
                            On schedule
                          </span>
                        )}
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
