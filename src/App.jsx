import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminBooksPage } from './pages/AdminBooksPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { StaffDashboard } from './pages/StaffDashboard';
import { StaffCirculationPage } from './pages/StaffCirculationPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentCataloguePage } from './pages/StudentCataloguePage';
import { StudentRequestsPage } from './pages/StudentRequestsPage';
import { StudentBorrowingsPage } from './pages/StudentBorrowingsPage';
import { StudentFinesPage } from './pages/StudentFinesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';

// Route guard for authentication and role authorization
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

// Default redirect based on active user role
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'ROLE_STAFF') return <Navigate to="/staff/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/books" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminBooksPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminUsersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/requests" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/issues" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']}>
              <StaffCirculationPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/fines" element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_STAFF']}>
              <StaffCirculationPage />
            </ProtectedRoute>
          } />

          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={
            <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff/books" element={
            <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
              <AdminBooksPage />
            </ProtectedRoute>
          } />
          <Route path="/staff/requests" element={
            <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff/circulation" element={
            <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
              <StaffCirculationPage />
            </ProtectedRoute>
          } />
          <Route path="/staff/fines" element={
            <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
              <StaffCirculationPage />
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/catalogue" element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <StudentCataloguePage />
            </ProtectedRoute>
          } />
          <Route path="/student/requests" element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <StudentRequestsPage />
            </ProtectedRoute>
          } />
          <Route path="/student/borrowings" element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <StudentBorrowingsPage />
            </ProtectedRoute>
          } />
          <Route path="/student/fines" element={
            <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
              <StudentFinesPage />
            </ProtectedRoute>
          } />

          {/* Shared Authenticated Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Index & Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
