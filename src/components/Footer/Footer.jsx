import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true" style={{display:'inline-block',verticalAlign:'middle',marginRight:'6px'}}>
                <rect width="32" height="32" rx="7" fill="#e94560"/>
                <line x1="9" y1="7" x2="9" y2="25" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
                <line x1="9" y1="16" x2="23" y2="7" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
                <line x1="9" y1="16" x2="23" y2="25" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
              </svg>Kairo
            </Link>
            <p className="footer__tagline">
              Your one-stop destination for premium products. Quality, style, and value — all in one place.
            </p>
          </div>

          {/* Shop links */}
          <div className="footer__column">
            <h4 className="footer__heading">Shop</h4>
            <ul className="footer__links">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=clothing">Clothing</Link></li>
              <li><Link to="/products?category=electronics">Electronics</Link></li>
              <li><Link to="/products?category=footwear">Footwear</Link></li>
            </ul>
          </div>

          {/* Account links */}
          <div className="footer__column">
            <h4 className="footer__heading">Account</h4>
            <ul className="footer__links">
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/orders">Order History</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__column">
            <h4 className="footer__heading">Contact</h4>
            <ul className="footer__contact">
              <li>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                support@kairo.store
              </li>
              <li>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.28-1.28a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +92 (042) 300 00000
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {year} Kairo. All rights reserved.</p>
          <div className="footer__bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
