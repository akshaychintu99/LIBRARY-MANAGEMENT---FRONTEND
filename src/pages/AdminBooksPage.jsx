import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, X, Filter } from 'lucide-react';

export const AdminBooksPage = () => {
  const { showToast } = useAuth();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    totalQuantity: 1,
    rackLocation: '',
    price: 0,
    publishedYear: 2024,
    description: '',
  });

  const loadBooks = () => {
    setLoading(true);
    api.books.list({
      query: searchQuery,
      category: selectedCategory,
      availableOnly,
      page: currentPage,
      size: 10,
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

  const handleOpenModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        publisher: book.publisher || '',
        totalQuantity: book.totalQuantity,
        rackLocation: book.rackLocation || '',
        price: book.price || 0,
        publishedYear: book.publishedYear || '',
        description: book.description || '',
      });
    } else {
      setEditingBook(null);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: categories[0] || 'Computer Science',
        publisher: '',
        totalQuantity: 1,
        rackLocation: '',
        price: 0,
        publishedYear: new Date().getFullYear(),
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await api.books.update(editingBook.id, formData);
        showToast('Book details updated successfully');
      } else {
        await api.books.create(formData);
        showToast('New book successfully catalogued');
      }
      setIsModalOpen(false);
      loadBooks();
      api.books.getCategories().then(setCategories);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      await api.books.delete(id);
      showToast('Book removed from catalogue');
      setDeleteConfirmId(null);
      loadBooks();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <Layout title="Book Inventory & Catalogue">
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Catalogue Management</h2>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} /> Add New Book
          </button>
        </div>

        <div className="card-body">
          {/* Filter Bar */}
          <form className="filter-bar" onSubmit={handleSearchSubmit}>
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
              <option value="">All Categories</option>
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
              Available Copies Only
            </label>

            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
          </form>

          {/* Table */}
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
            </div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <p>No books match the current criteria.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title & Author</th>
                    <th>ISBN</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Stock / Avail</th>
                    <th>Price</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {b.author}</div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{b.isbn}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: '#EEF2FF', color: '#4338CA' }}>
                          {b.category}
                        </span>
                      </td>
                      <td>{b.rackLocation || '—'}</td>
                      <td>
                        <span className={`badge ${b.availableQuantity > 0 ? 'badge-active' : 'badge-overdue'}`}>
                          {b.availableQuantity} / {b.totalQuantity} Available
                        </span>
                      </td>
                      <td>₹{b.price}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Book"
                            onClick={() => handleOpenModal(b)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Delete Book"
                            onClick={() => setDeleteConfirmId(b.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">{editingBook ? 'Edit Book Details' : 'Add New Book'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveBook}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Book Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Author *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ISBN Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Computer Science, AI"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Publisher</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Total Quantity *</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      required
                      value={formData.totalQuantity}
                      onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value, 10) })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rack Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Shelf CS-101"
                      value={formData.rackLocation}
                      onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Summary</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBook ? 'Save Changes' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Deletion</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove this book from the catalogue?</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Note: Books with active loans cannot be removed to preserve borrowing history integrity.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteBook(deleteConfirmId)}>
                Delete Book
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
