import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Repeat, 
  DollarSign, 
  UserCheck, 
  LogOut, 
  Menu, 
  X,
  Search,
  KeyRound
} from 'lucide-react';

export const Layout = ({ children, title }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav links tailored to current user role
  const getNavLinks = () => {
    if (role === 'ROLE_ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { to: '/admin/books', label: 'Book Management', icon: BookOpen },
        { to: '/admin/users', label: 'User Accounts', icon: Users },
        { to: '/admin/requests', label: 'Book Requests', icon: ClipboardList },
        { to: '/admin/issues', label: 'Circulation & Issues', icon: Repeat },
        { to: '/admin/fines', label: 'Fines & Payments', icon: DollarSign },
        { to: '/profile', label: 'Profile & Security', icon: KeyRound },
      ];
    } else if (role === 'ROLE_STAFF') {
      return [
        { to: '/staff/dashboard', label: 'Staff Dashboard', icon: LayoutDashboard },
        { to: '/staff/books', label: 'Book Catalogue', icon: BookOpen },
        { to: '/staff/requests', label: 'Pending Requests', icon: ClipboardList },
        { to: '/staff/circulation', label: 'Issue & Returns', icon: Repeat },
        { to: '/staff/fines', label: 'Overdue & Fines', icon: DollarSign },
        { to: '/profile', label: 'Profile & Security', icon: KeyRound },
      ];
    } else {
      return [
        { to: '/student/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { to: '/student/catalogue', label: 'Book Catalogue', icon: BookOpen },
        { to: '/student/requests', label: 'My Requests', icon: ClipboardList },
        { to: '/student/borrowings', label: 'My Borrowings', icon: Repeat },
        { to: '/student/fines', label: 'Fines & Payments', icon: DollarSign },
        { to: '/profile', label: 'Profile & Security', icon: KeyRound },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-icon">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="brand-title">LMS Portal</div>
            <div className="brand-subtitle">University Library</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-snippet">
            <div className="user-avatar">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">{user?.fullName || 'User'}</div>
              <span className="user-role-badge">
                {role ? role.replace('ROLE_', '') : 'GUEST'}
              </span>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            title="Log out" 
            onClick={handleLogout}
            style={{ padding: '6px 8px', borderRadius: '6px' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="btn btn-secondary btn-sm"
              style={{ display: window.innerWidth < 900 ? 'flex' : 'none' }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="page-title">{title}</h1>
          </div>

          <div className="nav-actions">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Logged in as <strong style={{ color: 'var(--text-main)' }}>{user?.username}</strong>
            </div>
          </div>
        </header>

        <main className="content-body">
          {children}
        </main>
      </div>
    </div>
  );
};
