import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, X, UserCheck, UserX, Shield } from 'lucide-react';

export const AdminUsersPage = () => {
  const { showToast, user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: 'ROLE_STUDENT',
    status: 'ACTIVE',
  });

  const loadUsers = () => {
    setLoading(true);
    api.users.list({
      query: searchQuery,
      role: roleFilter || undefined,
      status: statusFilter || undefined,
      page: currentPage,
      size: 10,
    })
      .then(res => {
        setUsers(res.content || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    loadUsers();
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        fullName: user.fullName,
        phoneNumber: user.phoneNumber || '',
        role: user.role,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        role: 'ROLE_STUDENT',
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.users.update(editingUser.id, {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
          status: formData.status,
        });
        showToast('User record updated');
      } else {
        await api.users.create({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
        });
        showToast('New user account registered');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.users.toggleStatus(id);
      showToast('Account status updated');
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await api.users.delete(id);
      showToast('User removed or deactivated');
      setDeleteConfirmId(null);
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <Layout title="User Account Management">
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">University Member Directory</h2>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} /> Create User Account
          </button>
        </div>

        <div className="card-body">
          {/* Filters */}
          <form className="filter-bar" onSubmit={handleSearchSubmit}>
            <div className="search-input-group">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="form-control search-control"
                placeholder="Search by name, username, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '160px' }}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="">All Roles</option>
              <option value="ROLE_ADMIN">Administrator</option>
              <option value="ROLE_STAFF">Library Staff</option>
              <option value="ROLE_STUDENT">Student</option>
            </select>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '150px' }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <button type="submit" className="btn btn-secondary btn-sm">Search</button>
          </form>

          {/* Table */}
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner" />
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>No user accounts found matching query.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Full Name & Username</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phoneNumber || '—'}</td>
                      <td>
                        <span className="badge" style={{
                          backgroundColor: u.role === 'ROLE_ADMIN' ? '#FEE2E2' : u.role === 'ROLE_STAFF' ? '#E0E7FF' : '#E0F2FE',
                          color: u.role === 'ROLE_ADMIN' ? '#991B1B' : u.role === 'ROLE_STAFF' ? '#4338CA' : '#0369A1',
                        }}>
                          {u.role.replace('ROLE_', '')}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title={u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            onClick={() => handleToggleStatus(u.id)}
                            disabled={currentUser?.id === u.id}
                          >
                            {u.status === 'ACTIVE' ? <UserX size={14} color="#DC2626" /> : <UserCheck size={14} color="#059669" />}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit User"
                            onClick={() => handleOpenModal(u)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Delete"
                            onClick={() => setDeleteConfirmId(u.id)}
                            disabled={currentUser?.id === u.id}
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">{editingUser ? 'Edit User Profile' : 'Register New User'}</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                {!editingUser && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Username *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        required
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      disabled={!!editingUser}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      className="form-control"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="ROLE_STUDENT">Student</option>
                      <option value="ROLE_STAFF">Library Staff</option>
                      <option value="ROLE_ADMIN">Administrator</option>
                    </select>
                  </div>

                  {editingUser && (
                    <div className="form-group">
                      <label className="form-label">Account Status</label>
                      <select
                        className="form-control"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-dialog" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Deactivation</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to deactivate or remove this user?</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                Note: Accounts with active borrowings or fines will be safely deactivated to protect audit trails.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteUser(deleteConfirmId)}>
                Deactivate / Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
