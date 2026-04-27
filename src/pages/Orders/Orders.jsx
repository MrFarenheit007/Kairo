import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import './Orders.css';

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#92400e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  shipped: { bg: '#ede9fe', color: '#5b21b6' },
  delivered: { bg: '#d1fae5', color: '#065f46' },
  cancelled: { bg: '#fee2e2', color: '#b91c1c' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');

  useEffect(() => {
    api.get('/orders')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrapper"><div className="spinner" /></div>;

  return (
    <main className="orders-page">
      <div className="container">
        <h1 className="orders-page__title">Order History</h1>

        {success && (
          <div className="alert alert--success orders-success">
            🎉 Your order has been placed successfully! Thank you for shopping with Kairo.
          </div>
        )}

        {error && <div className="alert alert--error">{error}</div>}

        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty__icon">📦</div>
            <h2>No orders yet</h2>
            <p>When you place your first order, it will appear here.</p>
            <Link to="/" className="btn btn--primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              const isOpen = expanded === order.id;

              return (
                <article key={order.id} className="order-card">
                  <button
                    className="order-card__header"
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="order-card__meta">
                      <div>
                        <p className="order-card__id">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="order-card__date">{formatDate(order.created_at)}</p>
                      </div>
                      <span
                        className="order-card__status"
                        style={{ background: statusStyle.bg, color: statusStyle.color }}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="order-card__summary">
                      <span className="order-card__items-count">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                      <span className="order-card__total">${parseFloat(order.total_amount).toFixed(2)}</span>
                      <svg
                        className={`order-card__chevron ${isOpen ? 'order-card__chevron--open' : ''}`}
                        width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && order.items && (
                    <div className="order-card__items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item">
                          <img src={item.image} alt={item.name} className="order-item__image" />
                          <div className="order-item__info">
                            <p className="order-item__name">{item.name}</p>
                            <p className="order-item__category">{item.category}</p>
                          </div>
                          <div className="order-item__right">
                            <p className="order-item__qty">×{item.quantity}</p>
                            <p className="order-item__price">${(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                      <div className="order-card__footer">
                        <span>Order Total</span>
                        <strong>${parseFloat(order.total_amount).toFixed(2)}</strong>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
