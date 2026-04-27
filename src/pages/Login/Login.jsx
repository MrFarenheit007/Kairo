import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const { mergeGuestCartOnLogin } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password) e.password = 'Password required';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setLoading(true);
    setServerError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      await mergeGuestCartOnLogin();
      navigate(redirect, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">
            <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
              <rect width="32" height="32" rx="7" fill="#e94560"/>
              <line x1="9" y1="7" x2="9" y2="25" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
              <line x1="9" y1="16" x2="23" y2="7" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
              <line x1="9" y1="16" x2="23" y2="25" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
            </svg>
            Kairo
          </Link>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__sub">Sign in to your account to continue</p>
        </div>

        {serverError && <div className="alert alert--error">{serverError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'form-input--error' : ''}`}
              placeholder="you@example.com"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'form-input--error' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn--primary auth-submit-btn" disabled={loading}>
            {loading ? <><span className="auth-spinner" /> Signing In...</> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-switch__link">Create one free</Link>
        </p>

        <div className="auth-demo">
          <p className="auth-demo__label">Demo credentials</p>
          <p className="auth-demo__value">After registering your own account, log in with your credentials.</p>
        </div>
      </div>
    </main>
  );
}
