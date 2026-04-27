import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../api/axios';
import '../Login/Login.css';
import './Register.css';

export default function Register() {
  const { login } = useAuth();
  const { mergeGuestCartOnLogin } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', city: '', gender: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
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
      const { confirmPassword: _cp, ...payload } = form;
      void _cp;
      const res = await api.post('/auth/register', payload);
      login(res.data.user, res.data.token);
      await mergeGuestCartOnLogin();
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card auth-card--wide">
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
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__sub">Join thousands of happy shoppers</p>
        </div>

        {serverError && <div className="alert alert--error">{serverError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="register-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name *</label>
              <input id="name" name="name" value={form.name} onChange={handleChange} className={`form-input ${errors.name ? 'form-input--error' : ''}`} placeholder="John Doe" />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address *</label>
              <input id="reg-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} className={`form-input ${errors.email ? 'form-input--error' : ''}`} placeholder="you@example.com" />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password *</label>
              <input id="reg-password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} className={`form-input ${errors.password ? 'form-input--error' : ''}`} placeholder="At least 6 characters" />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password *</label>
              <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} className={`form-input ${errors.confirmPassword ? 'form-input--error' : ''}`} placeholder="Repeat your password" />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="city">City</label>
              <input id="city" name="city" value={form.city} onChange={handleChange} className="form-input" placeholder="New York (optional)" />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={form.gender} onChange={handleChange} className="form-input">
                <option value="">Select (optional)</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn--primary auth-submit-btn" disabled={loading}>
            {loading ? <><span className="auth-spinner" /> Creating Account...</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-switch__link">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
