import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Lock, User, Eye, EyeOff, RefreshCw, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Demonstration CAPTCHA state
  const [captchaNum1, setCaptchaNum1] = useState(Math.floor(Math.random() * 9) + 1);
  const [captchaNum2, setCaptchaNum2] = useState(Math.floor(Math.random() * 9) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshCaptcha = () => {
    setCaptchaNum1(Math.floor(Math.random() * 9) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 9) + 1);
    setCaptchaAnswer('');
  };

  const handleDemoFill = (u, p) => {
    setUsernameOrEmail(u);
    setPassword(p);
    setCaptchaAnswer(String(captchaNum1 + captchaNum2));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Verify demonstration CAPTCHA
    const expected = captchaNum1 + captchaNum2;
    if (parseInt(captchaAnswer, 10) !== expected) {
      setError('Incorrect CAPTCHA answer. Please solve the math verification.');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const userInfo = await login({
        usernameOrEmail: usernameOrEmail.trim(),
        password,
        captchaToken: 'VALID_DEMO_VERIFIED',
      });

      // Role-based redirect
      if (userInfo.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (userInfo.role === 'ROLE_STAFF') {
        navigate('/staff/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
      }}>
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #4F46E5, #3730A3)',
          padding: '36px 32px',
          color: '#FFF',
          textAlign: 'center',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}>
            <BookOpen size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFF' }}>University Library Portal</h2>
          <p style={{ fontSize: '0.88rem', color: '#C7D2FE', marginTop: '4px' }}>
            Sign in to access your library account
          </p>
        </div>

        {/* Form Container */}
        <div style={{ padding: '32px' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--accent-rose-light)',
              color: '#991B1B',
              fontSize: '0.88rem',
              marginBottom: '20px',
              border: '1px solid #FECACA',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <div className="search-input-group">
                <User size={18} className="search-icon" />
                <input
                  type="text"
                  className="form-control search-control"
                  placeholder="e.g. admin or student@library.edu"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} className="search-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control search-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-subtle)',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Demonstration Bot Protection CAPTCHA */}
            <div className="form-group" style={{
              background: '#F8FAFC',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid var(--border-light)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--primary-600)" /> Security Verification (CAPTCHA)
                </span>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '2px 6px', fontSize: '0.75rem' }}
                  title="Generate new question"
                >
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  padding: '8px 16px',
                  background: '#E0E7FF',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '0.05em',
                  color: '#3730A3',
                  userSelect: 'none',
                }}>
                  {captchaNum1} + {captchaNum2} = ?
                </div>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Your answer"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '8px' }}
            >
              {loading ? <span className="loading-spinner" /> : 'Log In to LMS'}
            </button>
          </form>

          {/* Quick Demo Credentials Fill */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase' }}>
              One-Click Development Accounts
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDemoFill('admin', 'Admin@123')}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDemoFill('staff', 'Staff@123')}
              >
                Staff
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDemoFill('student', 'Student@123')}
              >
                Student
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
