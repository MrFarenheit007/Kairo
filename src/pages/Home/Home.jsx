import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

const CATEGORIES = ['all', 'clothing', 'electronics', 'footwear', 'bags', 'home'];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const params = activeCategory !== 'all' ? { category: activeCategory } : {};
        const res = await api.get('/products', { params });
        setProducts(res.data);
      } catch {
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [activeCategory]);

  const handleCategory = (cat) => {
    if (cat === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category: cat });
    }
  };

  return (
    <main>
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero__inner">
          <div className="hero__content">
            <p className="hero__sub">New Collection 2025</p>
            <h1 className="hero__title">
              Shop the <span>Latest</span><br />Trends Online
            </h1>
            <p className="hero__desc">
              Discover premium products across all categories. Quality style delivered to your door.
            </p>
            <div className="hero__actions">
              <Link to="/products" className="btn btn--primary btn--lg">
                Shop Now
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
              <a href="#featured" className="btn btn--outline btn--lg">View Collection</a>
            </div>
            <div className="hero__stats">
              <div className="hero__stat">
                <span className="hero__stat-number">10K+</span>
                <span className="hero__stat-label">Products</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-number">50K+</span>
                <span className="hero__stat-label">Happy Customers</span>
              </div>
              <div className="hero__stat-divider" />
              <div className="hero__stat">
                <span className="hero__stat-number">4.9★</span>
                <span className="hero__stat-label">Avg Rating</span>
              </div>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__circle hero__circle--1" />
            <div className="hero__circle hero__circle--2" />
            <div className="hero__image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80"
                alt="Fashion collection"
                className="hero__image"
              />
            </div>
            <div className="hero__badge hero__badge--sale">
              <span className="hero__badge-pct">50%</span>
              <span>OFF</span>
            </div>
            <div className="hero__badge hero__badge--free">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Free Shipping
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────── */}
      <section className="categories">
        <div className="container">
          <div className="section-heading">
            <p className="section-heading__label">Browse by</p>
            <h2 className="section-heading__title">Shop by Category</h2>
          </div>
          <div className="categories__grid">
            {[
              { key: 'clothing', label: 'Clothing', emoji: '👕' },
              { key: 'electronics', label: 'Electronics', emoji: '📱' },
              { key: 'footwear', label: 'Footwear', emoji: '👟' },
              { key: 'bags', label: 'Bags', emoji: '👜' },
              { key: 'home', label: 'Home & Living', emoji: '🏠' },
            ].map((cat) => (
              <button
                key={cat.key}
                className={`category-card ${activeCategory === cat.key ? 'category-card--active' : ''}`}
                onClick={() => handleCategory(cat.key)}
              >
                <span className="category-card__emoji">{cat.emoji}</span>
                <span className="category-card__label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─────────────────────────── */}
      <section className="featured" id="featured">
        <div className="container">
          <div className="section-heading">
            <p className="section-heading__label">Our Selection</p>
            <h2 className="section-heading__title">Featured Products</h2>
          </div>

          {/* Filter Pills */}
          <div className="home__filter-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`home__pill ${activeCategory === cat ? 'home__pill--active' : ''}`}
                onClick={() => handleCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-wrapper"><div className="spinner" /></div>
          ) : error ? (
            <div className="alert alert--error">{error}</div>
          ) : products.length === 0 ? (
            <div className="home__empty">
              <span>😕</span>
              <p>No products found in this category.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─── Banner ────────────────────────────────────── */}
      <section className="promo-banner">
        <div className="container promo-banner__inner">
          <div>
            <h2 className="promo-banner__title">Free Shipping on Orders Over $75</h2>
            <p className="promo-banner__sub">Use code <strong>FREESHIP</strong> at checkout</p>
          </div>
          <Link to="/products" className="btn btn--primary">Shop Now</Link>
        </div>
      </section>
    </main>
  );
}
