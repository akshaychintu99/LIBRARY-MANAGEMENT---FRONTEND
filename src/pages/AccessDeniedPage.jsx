import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccessDeniedPage = () => {
  const { role } = useAuth();

  const getHomeRoute = () => {
    if (role === 'ROLE_ADMIN') return '/admin/dashboard';
    if (role === 'ROLE_STAFF') return '/staff/dashboard';
    return '/student/dashboard';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        maxWidth: '480px',
        background: '#FFF',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-rose-light)',
          color: 'var(--accent-rose)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>Access Denied (403)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px' }}>
          You do not have the required role privileges to access this protected library resource.
        </p>
        <Link to={getHomeRoute()} className="btn btn-primary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Return to Your Dashboard
        </Link>
      </div>
    </div>
  );
};
