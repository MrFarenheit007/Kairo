import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" style={{flexShrink:0}}>
            <rect width="32" height="32" rx="7" fill="#e94560"/>
            <line x1="9" y1="7" x2="9" y2="25" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
            <line x1="9" y1="16" x2="23" y2="7" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
            <line x1="9" y1="16" x2="23" y2="25" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
          </svg>
          <span className="navbar__logo-text">Kairo</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
            Products
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
              Orders
            </NavLink>
          )}
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          <Link to="/cart" className="navbar__cart" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="navbar__user">
              <button className="navbar__user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="navbar__avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                <span className="navbar__user-name">{user?.name?.split(' ')[0]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {menuOpen && (
                <div className="navbar__dropdown">
                  <Link to="/profile" className="navbar__dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Profile
                  </Link>
                  <Link to="/orders" className="navbar__dropdown-item" onClick={() => setMenuOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Orders
                  </Link>
                  <hr className="navbar__dropdown-divider" />
                  <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth">
              <Link to="/login" className="btn btn--ghost btn--sm">Sign In</Link>
              <Link to="/register" className="btn btn--primary btn--sm">Sign Up</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile-menu">
          <NavLink to="/" end className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/products" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Products</NavLink>
          <NavLink to="/cart" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/orders" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Orders</NavLink>
              <NavLink to="/profile" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Profile</NavLink>
              <button className="navbar__mobile-link navbar__mobile-link--danger" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Sign In</NavLink>
              <NavLink to="/register" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Sign Up</NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}
