import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Repeat, Plus, Search, CheckCircle, AlertTriangle, X } from 'lucide-react';

export const StaffCirculationPage = () => {
  const { showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE', 'OVERDUE', 'ALL'
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Issue Book Modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [issueForm, setIssueForm] = useState({
    userId: '',
    bookId: '',
    durationDays: 14,
  });

  // Return Book Confirmation Modal
  const [returnConfirmIssue, setReturnConfirmIssue] = useState(null);

  const loadIssues = () => {
    setLoading(true);
    let fetchPromise;
    if (activeTab === 'ACTIVE') {
      fetchPromise = api.issues.list({ status: 'ISSUED', page: currentPage, size: 10 });
    } else if (activeTab === 'OVERDUE') {
      fetchPromise = api.issues.getOverdue().then(res => ({ content: res, totalPages: 1 }));
    } else {
      fetchPromise = api.issues.list({ page: currentPage, size: 10 });
    }

    fetchPromise
      .then(res => {
        setIssues(res.content || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadIssues();
  }, [activeTab, currentPage]);

  const handleOpenIssueModal = () => {
    api.books.list({ availableOnly: true, size: 50 }).then(res => setAvailableBooks(res.content || []));
    api.users.list({ role: 'ROLE_STUDENT', size: 50 }).then(res => setStudents(res.content || []));
    setIssueForm({ userId: '', bookId: '', durationDays: 14 });
    setIsIssueModalOpen(true);
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.issues.issueBook({
        userId: parseInt(issueForm.userId, 10),
        bookId: parseInt(issueForm.bookId, 10),
        durationDays: parseInt(issueForm.durationDays, 10),
      });
      showToast('Book successfully checked out to student');
      setIsIssueModalOpen(false);
      loadIssues();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleReturnSubmit = async () => {
    if (!returnConfirmIssue) return;
    try {
      const res = await api.issues.returnBook(returnConfirmIssue.id);
      if (res.fineAmount && parseFloat(res.fineAmount) > 0) {
        showToast(`Book returned with overdue fine: ₹${res.fineAmount}`);
      } else {
        showToast('Book successfully returned and restocked');
      }
      setReturnConfirmIssue(null);
      loadIssues();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <Layout title="Circulation Desk — Issue & Returns">
      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`btn btn-sm ${activeTab === 'ACTIVE' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('ACTIVE'); setCurrentPage(0); }}
            >
              Active Loans
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'OVERDUE' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('OVERDUE'); setCurrentPage(0); }}
            >
              Overdue Loans
            </button>
            <button
              className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveTab('ALL'); setCurrentPage(0); }}
            >
              All Circulation History
            </button>
          </div>

          <button className="btn btn-primary" onClick={handleOpenIssueModal}>
            <Plus size={16} /> Issue Book to Student
          </button>
        </div>

        <div className="card-body">
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <p>No lending records found in this view.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Borrower Student</th>
                    <th>Book Details</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Fine</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.userName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.userEmail}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.bookTitle}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ISBN: {item.bookIsbn}</div>
                      </td>
                      <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                        {item.overdueDays > 0 && (
                          <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', fontWeight: 600 }}>
                            {item.overdueDays} days late
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
                        ) : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {item.status !== 'RETURNED' ? (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setReturnConfirmIssue(item)}
                          >
                            <Repeat size={14} /> Process Return
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Returned on {item.returnDate ? new Date(item.returnDate).toLocaleDateString() : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', fontSize: '0.85rem' }}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Issue Book Modal */}
      {isIssueModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Checkout Book to Student</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsIssueModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleIssueSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Registered Student *</label>
                  <select
                    className="form-control"
                    required
                    value={issueForm.userId}
                    onChange={(e) => setIssueForm({ ...issueForm, userId: e.target.value })}
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.username}) — {s.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Available Book *</label>
                  <select
                    className="form-control"
                    required
                    value={issueForm.bookId}
                    onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
                  >
                    <option value="">-- Choose Available Book --</option>
                    {availableBooks.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.title} (Available: {b.availableQuantity}/{b.totalQuantity})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Borrow Duration (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    className="form-control"
                    required
                    value={issueForm.durationDays}
                    onChange={(e) => setIssueForm({ ...issueForm, durationDays: e.target.value })}
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                    Default library borrowing period: 14 days. Overdue penalty: ₹10/day.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsIssueModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Book Confirmation Modal */}
      {returnConfirmIssue && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Book Return</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setReturnConfirmIssue(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p>Record physical check-in for:</p>
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', margin: '12px 0' }}>
                <div style={{ fontWeight: 700 }}>{returnConfirmIssue.bookTitle}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Borrower: {returnConfirmIssue.userName}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Due Date: {new Date(returnConfirmIssue.dueDate).toLocaleDateString()}
                </div>
              </div>

              {returnConfirmIssue.overdueDays > 0 ? (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent-rose-light)',
                  color: '#991B1B',
                  fontSize: '0.88rem'
                }}>
                  ⚠️ This book is <strong>{returnConfirmIssue.overdueDays} days overdue</strong>.
                  An automatic fine of <strong>₹{returnConfirmIssue.overdueDays * 10}.00</strong> (at ₹10/day) will be registered against the student's account.
                </div>
              ) : (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent-emerald-light)',
                  color: '#065F46',
                  fontSize: '0.88rem'
                }}>
                  ✓ Book is being returned on time. No overdue penalties apply.
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setReturnConfirmIssue(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleReturnSubmit}>
                Confirm Return & Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
