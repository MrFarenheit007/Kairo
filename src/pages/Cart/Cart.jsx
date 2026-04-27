import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  if (loading) {
    return <div className="loading-wrapper"><div className="spinner" /></div>;
  }

  if (cartItems.length === 0) {
    return (
      <main className="cart-empty">
        <div className="cart-empty__inner">
          <svg className="cart-empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/" className="btn btn--primary">Start Shopping</Link>
        </div>
      </main>
    );
  }

  const shipping = cartTotal >= 75 ? 0 : 7.99;
  const tax = cartTotal * 0.08;
  const orderTotal = cartTotal + shipping + tax;

  return (
    <main className="cart-page">
      <div className="container">
        <h1 className="cart-page__title">
          Shopping Cart
          <span className="cart-page__count">{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
        </h1>

        <div className="cart-page__layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <article key={item.id} className="cart-item">
                <div className="cart-item__image-wrapper">
                  <img src={item.image} alt={item.name} className="cart-item__image" />
                </div>

                <div className="cart-item__info">
                  <p className="cart-item__category">{item.category}</p>
                  <h3 className="cart-item__name">{item.name}</h3>
                  <p className="cart-item__price">${parseFloat(item.price).toFixed(2)}</p>
                </div>

                <div className="cart-item__controls">
                  <div className="cart-item__qty">
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="cart-item__qty-value">{item.quantity}</span>
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="cart-item__subtotal">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Summary */}
          <aside className="cart-summary">
            <h2 className="cart-summary__title">Order Summary</h2>

            <div className="cart-summary__line">
              <span>Subtotal ({cartCount} items)</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary__line">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'cart-summary__free' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="cart-summary__line">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {shipping > 0 && (
              <p className="cart-summary__shipping-note">
                Add ${(75 - cartTotal).toFixed(2)} more to get free shipping!
              </p>
            )}
            <div className="cart-summary__total">
              <span>Total</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>

            <button
              className="btn btn--primary cart-summary__checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>
            <Link to="/" className="cart-summary__continue">← Continue Shopping</Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
