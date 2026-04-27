import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: '', city: '', gender: '',
    currentPassword: '', newPassword: '', confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get('/user').then((res) => {
      const u = res.data;
      setForm((prev) => ({ ...prev, name: u.name || '', city: u.city || '', gender: u.gender || '' }));
    }).catch(() => {
      setError('Failed to load profile.');
    }).finally(() => setLoading(false));
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (form.newPassword && form.newPassword.length < 6) e.newPassword = 'At least 6 characters';
    if (form.newPassword && form.newPassword !== form.confirmNewPassword) e.confirmNewPassword = 'Passwords do not match';
    if (form.newPassword && !form.currentPassword) e.currentPassword = 'Current password required';
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

    setSaving(true);
    setSuccess('');
    setError('');

    const payload = { name: form.name, city: form.city, gender: form.gender };
    if (form.newPassword) {
      payload.currentPassword = form.currentPassword;
      payload.newPassword = form.newPassword;
    }

    try {
      const res = await api.put('/user', payload);
      updateUser(res.data.user);
      setSuccess('Profile updated successfully!');
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;

  return (
    <main className="profile-page">
      <div className="container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-avatar">
              <span>{user?.name?.[0]?.toUpperCase() || '?'}</span>
            </div>
            <h2 className="profile-sidebar__name">{user?.name}</h2>
            <p className="profile-sidebar__email">{user?.email}</p>
            {user?.city && <p className="profile-sidebar__city">📍 {user.city}</p>}

            <div className="profile-sidebar__stats">
              <div className="profile-sidebar__stat">
                <span className="profile-sidebar__stat-icon">🛍</span>
                <span>Member since {new Date(user?.created_at || '2024-01-01').getFullYear()}</span>
              </div>
            </div>
          </aside>

          {/* Form */}
          <div className="profile-content">
            <h1 className="profile-content__title">My Profile</h1>

            {success && <div className="alert alert--success" style={{ marginBottom: 20 }}>{success}</div>}
            {error && <div className="alert alert--error" style={{ marginBottom: 20 }}>{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <section className="profile-section">
                <h2 className="profile-section__title">Personal Information</h2>

                <div className="profile-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} className={`form-input ${errors.name ? 'form-input--error' : ''}`} placeholder="Your name" />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input value={user?.email || ''} className="form-input profile-input--readonly" readOnly disabled title="Email cannot be changed" />
                    <span className="form-error" style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Email address cannot be changed</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input name="city" value={form.city} onChange={handleChange} className="form-input" placeholder="Your city" />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select name="gender" value={form.gender} onChange={handleChange} className="form-input">
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="profile-section">
                <h2 className="profile-section__title">Change Password</h2>
                <p className="profile-section__sub">Leave blank to keep your current password.</p>

                <div className="profile-grid">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} className={`form-input ${errors.currentPassword ? 'form-input--error' : ''}`} placeholder="Enter current password" />
                    {errors.currentPassword && <span className="form-error">{errors.currentPassword}</span>}
                  </div>

                  <div className="form-group" />

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} className={`form-input ${errors.newPassword ? 'form-input--error' : ''}`} placeholder="At least 6 characters" />
                    {errors.newPassword && <span className="form-error">{errors.newPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input name="confirmNewPassword" type="password" value={form.confirmNewPassword} onChange={handleChange} className={`form-input ${errors.confirmNewPassword ? 'form-input--error' : ''}`} placeholder="Repeat new password" />
                    {errors.confirmNewPassword && <span className="form-error">{errors.confirmNewPassword}</span>}
                  </div>
                </div>
              </section>

              <div className="profile-actions">
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
