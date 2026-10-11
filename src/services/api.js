// ============================================================================
// CENTRALIZED REST API SERVICE
// Connects React UI to Spring Boot Backend
// ============================================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Common fetch wrapper with Authorization Bearer header injection and error extraction
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('lms_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized globally
    if (response.status === 401 && !endpoint.includes('/api/auth/login')) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    throw err;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) => request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    getMe: () => request('/api/auth/me'),
    changePassword: (data) => request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    logout: () => {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      return request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    },
  },

  // Books Catalogue
  books: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      if (params.query) query.append('query', params.query);
      if (params.category) query.append('category', params.category);
      if (params.availableOnly) query.append('availableOnly', 'true');
      if (params.page !== undefined) query.append('page', params.page);
      if (params.size !== undefined) query.append('size', params.size);
      return request(`/api/books?${query.toString()}`);
    },
    getCategories: () => request('/api/books/categories'),
    getById: (id) => request(`/api/books/${id}`),
    create: (bookData) => request('/api/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),
    update: (id, bookData) => request(`/api/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    }),
    delete: (id) => request(`/api/books/${id}`, {
      method: 'DELETE',
    }),
  },

  // Users (Admin)
  users: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      if (params.query) query.append('query', params.query);
      if (params.role) query.append('role', params.role);
      if (params.status) query.append('status', params.status);
      if (params.page !== undefined) query.append('page', params.page);
      if (params.size !== undefined) query.append('size', params.size);
      return request(`/api/users?${query.toString()}`);
    },
    getById: (id) => request(`/api/users/${id}`),
    create: (userData) => request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    update: (id, userData) => request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),
    toggleStatus: (id) => request(`/api/users/${id}/status`, {
      method: 'PATCH',
    }),
    delete: (id) => request(`/api/users/${id}`, {
      method: 'DELETE',
    }),
  },

  // Book Requests
  requests: {
    submit: (data) => request('/api/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getMyRequests: (params = {}) => {
      const query = new URLSearchParams(params);
      return request(`/api/requests/my-requests?${query.toString()}`);
    },
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.status) query.append('status', params.status);
      if (params.userId) query.append('userId', params.userId);
      if (params.page !== undefined) query.append('page', params.page);
      if (params.size !== undefined) query.append('size', params.size);
      return request(`/api/requests?${query.toString()}`);
    },
    approve: (id, remarks) => request(`/api/requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    }),
    reject: (id, remarks) => request(`/api/requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ remarks }),
    }),
    cancel: (id) => request(`/api/requests/${id}/cancel`, {
      method: 'POST',
    }),
  },

  // Book Circulation (Issues & Returns)
  issues: {
    issueBook: (data) => request('/api/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    returnBook: (issueId) => request('/api/issues/return', {
      method: 'POST',
      body: JSON.stringify({ issueId }),
    }),
    list: (params = {}) => {
      const query = new URLSearchParams();
      if (params.userId) query.append('userId', params.userId);
      if (params.status) query.append('status', params.status);
      if (params.page !== undefined) query.append('page', params.page);
      if (params.size !== undefined) query.append('size', params.size);
      return request(`/api/issues?${query.toString()}`);
    },
    getActive: (page = 0, size = 10) => request(`/api/issues/active?page=${page}&size=${size}`),
    getOverdue: () => request('/api/issues/overdue'),
    getMyIssues: (params = {}) => {
      const query = new URLSearchParams(params);
      return request(`/api/issues/my-issues?${query.toString()}`);
    },
  },

  // Fines
  fines: {
    getMyFines: (params = {}) => {
      const query = new URLSearchParams(params);
      return request(`/api/fines/my-fines?${query.toString()}`);
    },
    list: (params = {}) => {
      const query = new URLSearchParams();
      if (params.userId) query.append('userId', params.userId);
      if (params.status) query.append('status', params.status);
      if (params.page !== undefined) query.append('page', params.page);
      if (params.size !== undefined) query.append('size', params.size);
      return request(`/api/fines?${query.toString()}`);
    },
    getById: (id) => request(`/api/fines/${id}`),
    waive: (id) => request(`/api/fines/${id}/waive`, {
      method: 'POST',
    }),
  },

  // Simulated Payments
  payments: {
    simulate: (data) => request('/api/payments/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getMyPayments: (params = {}) => {
      const query = new URLSearchParams(params);
      return request(`/api/payments/my-payments?${query.toString()}`);
    },
    list: (params = {}) => {
      const query = new URLSearchParams();
      if (params.userId) query.append('userId', params.userId);
      if (params.status) query.append('status', params.status);
      if (params.page !== undefined) query.append('page', params.page);
      if (params.size !== undefined) query.append('size', params.size);
      return request(`/api/payments?${query.toString()}`);
    },
  },

  // Dashboard Stats
  dashboard: {
    getStats: () => request('/api/dashboard/stats'),
  },

  // Health
  health: {
    check: () => request('/api/health'),
  },
};
