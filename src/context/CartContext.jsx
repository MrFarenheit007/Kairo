/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const GUEST_CART_KEY = 'guest_cart';

function getGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart whenever auth state changes
  const loadCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const res = await api.get('/cart');
        setCartItems(res.data);
      } catch {
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems(getGuestCart());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    (async () => { await loadCart(); })();
  }, [loadCart]);

  // Merge guest cart into server cart on login
  const mergeGuestCartOnLogin = useCallback(async () => {
    const guestCart = getGuestCart();
    if (guestCart.length === 0) return;

    try {
      for (const item of guestCart) {
        await api.post('/cart', { product_id: item.product_id, quantity: item.quantity });
      }
    } catch (err) {
      console.error('Cart merge error:', err);
    } finally {
      localStorage.removeItem(GUEST_CART_KEY);
      await loadCart();
    }
  }, [loadCart]);

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      const res = await api.post('/cart', { product_id: product.id, quantity });
      setCartItems(res.data);
    } else {
      const existing = cartItems.find((i) => i.product_id === product.id);
      let updated;
      if (existing) {
        updated = cartItems.map((i) =>
          i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      } else {
        updated = [
          ...cartItems,
          {
            id: `guest-${product.id}`,
            product_id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity,
          },
        ];
      }
      setCartItems(updated);
      saveGuestCart(updated);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (isAuthenticated) {
      await api.put(`/cart/${itemId}`, { quantity });
      setCartItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
    } else {
      const updated = cartItems.map((i) => (i.id === itemId ? { ...i, quantity } : i));
      setCartItems(updated);
      saveGuestCart(updated);
    }
  };

  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      await api.delete(`/cart/${itemId}`);
      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    } else {
      const updated = cartItems.filter((i) => i.id !== itemId);
      setCartItems(updated);
      saveGuestCart(updated);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    if (!isAuthenticated) {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  };

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        mergeGuestCartOnLogin,
        reloadCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
