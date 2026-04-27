import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

function StarRating({ rating }) {
  return (
    <div className="product-card__stars" aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="13" height="13" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? '#f59e0b' : 'none'}
          stroke="#f59e0b" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="product-card__rating-value">{rating}</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error('Add to cart error:', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="product-card">
      <div className="product-card__image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
        />
        <span className="product-card__category">{product.category}</span>
      </div>

      <div className="product-card__body">
        <StarRating rating={product.rating || 4.5} />
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">${parseFloat(product.price).toFixed(2)}</p>

        <button
          className={`product-card__btn btn btn--primary ${added ? 'product-card__btn--added' : ''}`}
          onClick={handleAddToCart}
          disabled={adding}
        >
          {adding ? (
            <span className="product-card__btn-spinner" />
          ) : added ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Added!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  );
}
