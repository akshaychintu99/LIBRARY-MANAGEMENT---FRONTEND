import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, BookOpen, Send, X, Check, MapPin, Tag } from 'lucide-react';

export const StudentCataloguePage = () => {
  const { showToast } = useAuth();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Request Modal
  const [requestBook, setRequestBook] = useState(null);
  const [requestRemarks, setRequestRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadBooks = () => {
    setLoading(true);
    api.books.list({
      query: searchQuery,
      category: selectedCategory,
      availableOnly,
      page: currentPage,
      size: 9,
    })
      .then(res => {
        setBooks(res.content || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBooks();
  }, [currentPage, selectedCategory, availableOnly]);

  useEffect(() => {
    api.books.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    loadBooks();
  };

  const handleOpenRequestModal = (book) => {
    setRequestBook(book);
    setRequestRemarks('');
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!requestBook) return;

    setSubmitting(true);
    try {
      await api.requests.submit({
        bookId: requestBook.id,
        remarks: requestRemarks || 'Requested for academic study',
      });
      showToast(`Borrow request submitted for "${requestBook.title}"`);
      setRequestBook(null);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="University Book Catalogue">
      {/* Search and Filters */}
      <div className="content-card" style={{ marginBottom: '24px' }}>
        <div className="card-body" style={{ padding: '20px' }}>
          <form className="filter-bar" onSubmit={handleSearchSubmit} style={{ margin: 0 }}>
            <div className="search-input-group">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="form-control search-control"
                placeholder="Search by title, author, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '180px' }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="">All Disciplines</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => {
                  setAvailableOnly(e.target.checked);
                  setCurrentPage(0);
                }}
              />
              In Stock Only
            </label>

            <button type="submit" className="btn btn-primary btn-sm">
              Search Catalogue
            </button>
          </form>
        </div>
      </div>

      {/* Catalogue Cards Grid */}
      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" />
          <p style={{ marginTop: '12px' }}>Loading catalogue inventory...</p>
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <p>No books match your search parameters. Try adjusting your filter terms.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
          {books.map(b => (
            <div key={b.id} className="content-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: 0 }}>
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                  <span className="badge" style={{ backgroundColor: '#EEF2FF', color: '#4338CA' }}>
                    <Tag size={12} /> {b.category}
                  </span>
                  <span className={`badge ${b.availableQuantity > 0 ? 'badge-active' : 'badge-overdue'}`}>
                    {b.availableQuantity > 0 ? `${b.availableQuantity} In Stock` : 'Out of Stock'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>
                  {b.title}
                </h3>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  by {b.author}
                </div>

                {b.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {b.description}
                  </p>
                )}

                <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>ISBN: {b.isbn}</span>
                    <span>{b.rackLocation ? `📍 ${b.rackLocation}` : ''}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Publisher: {b.publisher || 'Academic Press'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{b.price}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '14px 20px', background: '#F8FAFC', borderTop: '1px solid var(--border-light)' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  disabled={b.availableQuantity === 0}
                  onClick={() => handleOpenRequestModal(b)}
                >
                  <Send size={14} /> {b.availableQuantity > 0 ? 'Request Borrowing' : 'Currently Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
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

      {/* Request Book Modal */}
      {requestBook && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Submit Borrowing Request</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setRequestBook(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSendRequest}>
              <div className="modal-body">
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ fontWeight: 700 }}>{requestBook.title}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    by {requestBook.author} (ISBN: {requestBook.isbn})
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Purpose / Remarks</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    placeholder="e.g. For semester assignment, research project..."
                    value={requestRemarks}
                    onChange={(e) => setRequestRemarks(e.target.value)}
                  />
                </div>

                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>
                  Your request will be submitted to library staff for checkout approval.
                </small>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setRequestBook(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <span className="loading-spinner" /> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
