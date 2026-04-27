import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';

const CATEGORIES = ['all', 'clothing', 'electronics', 'footwear', 'bags', 'home'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
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
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    })();
  }, [activeCategory]);

  const handleCategory = (cat) => {
    setSearch('');
    if (cat === 'all') setSearchParams({});
    else setSearchParams({ category: cat });
  };

  const filtered = search.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <main className="products-page">
      <div className="container">
        {/* Header */}
        <div className="products-page__header">
          <div>
            <h1 className="products-page__title">
              {activeCategory === 'all' ? 'All Products' : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
            </h1>
            <p className="products-page__sub">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <input
            type="search"
            className="form-input products-page__search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>

        <div className="products-layout">
          {/* Sidebar filters */}
          <aside className="products-sidebar">
            <h3 className="products-sidebar__title">Categories</h3>
            <ul className="products-sidebar__list">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <button
                    className={`products-sidebar__item ${activeCategory === cat ? 'products-sidebar__item--active' : ''}`}
                    onClick={() => handleCategory(cat)}
                  >
                    {cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Grid */}
          <div className="products-page__content">
            {loading ? (
              <div className="loading-wrapper"><div className="spinner" /></div>
            ) : error ? (
              <div className="alert alert--error">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="products-page__empty">
                <span>🔍</span>
                <p>No products match your search.</p>
                <button className="btn btn--outline" onClick={() => { setSearch(''); handleCategory('all'); }}>Clear Filters</button>
              </div>
            ) : (
              <div className="products-grid">
                {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
