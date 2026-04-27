const express = require('express');
const { body } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

// GET /api/cart - get user's cart items with product info
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.id, ci.quantity, ci.product_id,
              p.name, p.price, p.image, p.category
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at ASC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Get cart error:', err);
    return res.status(500).json({ message: 'Failed to fetch cart.' });
  }
});

// POST /api/cart - add item (or upsert)
router.post(
  '/',
  [
    body('product_id').notEmpty().withMessage('product_id is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  validate,
  async (req, res) => {
    const { product_id, quantity } = req.body;

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(product_id)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    try {
      // Check product exists
      const product = await pool.query('SELECT id FROM products WHERE id = $1', [product_id]);
      if (product.rows.length === 0) {
        return res.status(404).json({ message: 'Product not found.' });
      }

      // Upsert: if already in cart, increase quantity
      const existing = await pool.query(
        'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
        [req.user.id, product_id]
      );

      if (existing.rows.length > 0) {
        const newQty = existing.rows[0].quantity + parseInt(quantity, 10);
        await pool.query(
          'UPDATE cart_items SET quantity = $1 WHERE id = $2',
          [newQty, existing.rows[0].id]
        );
      } else {
        const id = uuidv4();
        await pool.query(
          'INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES ($1, $2, $3, $4)',
          [id, req.user.id, product_id, quantity]
        );
      }

      // Return updated cart
      const result = await pool.query(
        `SELECT ci.id, ci.quantity, ci.product_id,
                p.name, p.price, p.image, p.category
         FROM cart_items ci
         JOIN products p ON p.id = ci.product_id
         WHERE ci.user_id = $1
         ORDER BY ci.created_at ASC`,
        [req.user.id]
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('Add to cart error:', err);
      return res.status(500).json({ message: 'Failed to add item to cart.' });
    }
  }
);

// PUT /api/cart/:id - update quantity
router.put(
  '/:id',
  [body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')],
  validate,
  async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ message: 'Invalid cart item ID.' });
    }

    try {
      // Ensure the cart item belongs to this user
      const item = await pool.query(
        'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
      );
      if (item.rows.length === 0) {
        return res.status(404).json({ message: 'Cart item not found.' });
      }

      await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, id]);

      return res.json({ message: 'Cart updated.' });
    } catch (err) {
      console.error('Update cart error:', err);
      return res.status(500).json({ message: 'Failed to update cart.' });
    }
  }
);

// DELETE /api/cart/:id - remove item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ message: 'Invalid cart item ID.' });
  }

  try {
    const item = await pool.query(
      'SELECT id FROM cart_items WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (item.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    await pool.query('DELETE FROM cart_items WHERE id = $1', [id]);
    return res.json({ message: 'Item removed from cart.' });
  } catch (err) {
    console.error('Delete cart item error:', err);
    return res.status(500).json({ message: 'Failed to remove item.' });
  }
});

module.exports = router;
