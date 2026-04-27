import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const shipping = cartTotal >= 75 ? 0 : 7.99;
  const tax = cartTotal * 0.08;
  const orderTotal = cartTotal + shipping + tax;

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.address.trim()) e.address = 'Address required';
    if (!form.city.trim()) e.city = 'City required';
    if (!form.zip.trim()) e.zip = 'ZIP code required';
    if (!form.country.trim()) e.country = 'Country required';
    if (!form.cardNumber.trim() || !/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ''))) e.cardNumber = 'Valid 16-digit card number required';
    if (!form.expiry.trim() || !/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'Expiry in MM/YY format required';
    if (!form.cvv.trim() || !/^\d{3,4}$/.test(form.cvv)) e.cvv = 'Valid CVV required';
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
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      await api.post('/orders');
      clearCart();
      navigate('/orders?success=true');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-empty">
        <h2>No items in cart</h2>
        <p>Please add items to your cart before checking out.</p>
        <Link to="/" className="btn btn--primary">Shop Now</Link>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="container">
        <h1 className="checkout-page__title">Checkout</h1>

        <div className="checkout-layout">
          {/* Form */}
          <form className="checkout-form" onSubmit={handleSubmit} noValidate>
            {serverError && <div className="alert alert--error" style={{ marginBottom: 20 }}>{serverError}</div>}

            <section className="checkout-section">
              <h2 className="checkout-section__title">
                <span className="checkout-section__num">1</span>
                Shipping Information
              </h2>

              <div className="checkout-grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} className={`form-input ${errors.fullName ? 'form-input--error' : ''}`} placeholder="John Doe" />
                  {errors.fullName && <span className="form-error">{errors.fullName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} className={`form-input ${errors.email ? 'form-input--error' : ''}`} placeholder="john@example.com" />
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input name="address" value={form.address} onChange={handleChange} className={`form-input ${errors.address ? 'form-input--error' : ''}`} placeholder="123 Main St, Apt 4B" />
                {errors.address && <span className="form-error">{errors.address}</span>}
              </div>

              <div className="checkout-grid-3">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input name="city" value={form.city} onChange={handleChange} className={`form-input ${errors.city ? 'form-input--error' : ''}`} placeholder="New York" />
                  {errors.city && <span className="form-error">{errors.city}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code *</label>
                  <input name="zip" value={form.zip} onChange={handleChange} className={`form-input ${errors.zip ? 'form-input--error' : ''}`} placeholder="10001" />
                  {errors.zip && <span className="form-error">{errors.zip}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <input name="country" value={form.country} onChange={handleChange} className={`form-input ${errors.country ? 'form-input--error' : ''}`} placeholder="United States" />
                  {errors.country && <span className="form-error">{errors.country}</span>}
                </div>
              </div>
            </section>

            <section className="checkout-section">
              <h2 className="checkout-section__title">
                <span className="checkout-section__num">2</span>
                Payment Details
              </h2>

              <div className="checkout-card-icons">
                <span className="checkout-card-icon">💳</span>
                <span className="checkout-secure-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Secured by 256-bit SSL
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Card Number *</label>
                <input name="cardNumber" value={form.cardNumber} onChange={handleChange} className={`form-input ${errors.cardNumber ? 'form-input--error' : ''}`} placeholder="1234 5678 9012 3456" maxLength={19} />
                {errors.cardNumber && <span className="form-error">{errors.cardNumber}</span>}
              </div>

              <div className="checkout-grid-2">
                <div className="form-group">
                  <label className="form-label">Expiry Date *</label>
                  <input name="expiry" value={form.expiry} onChange={handleChange} className={`form-input ${errors.expiry ? 'form-input--error' : ''}`} placeholder="MM/YY" maxLength={5} />
                  {errors.expiry && <span className="form-error">{errors.expiry}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">CVV *</label>
                  <input name="cvv" value={form.cvv} onChange={handleChange} className={`form-input ${errors.cvv ? 'form-input--error' : ''}`} placeholder="123" maxLength={4} type="password" />
                  {errors.cvv && <span className="form-error">{errors.cvv}</span>}
                </div>
              </div>
            </section>

            <button type="submit" className="btn btn--primary checkout-submit-btn" disabled={submitting}>
              {submitting ? (
                <><span className="product-card__btn-spinner" /> Processing...</>
              ) : (
                <>Place Order — ${orderTotal.toFixed(2)}</>
              )}
            </button>
          </form>

          {/* Summary */}
          <aside className="checkout-summary">
            <h2 className="checkout-summary__title">Order Summary</h2>
            <div className="checkout-summary__items">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-summary__item">
                  <img src={item.image} alt={item.name} className="checkout-summary__item-img" />
                  <div className="checkout-summary__item-info">
                    <p className="checkout-summary__item-name">{item.name}</p>
                    <p className="checkout-summary__item-qty">Qty: {item.quantity}</p>
                  </div>
                  <p className="checkout-summary__item-price">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="checkout-summary__lines">
              <div className="checkout-summary__line"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
              <div className="checkout-summary__line"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
              <div className="checkout-summary__line"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="checkout-summary__total"><span>Total</span><span>${orderTotal.toFixed(2)}</span></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
