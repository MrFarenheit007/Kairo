const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// POST /api/orders - create order from cart
router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get cart items with current product prices
    const cartResult = await client.query(
      `SELECT ci.id as cart_item_id, ci.product_id, ci.quantity,
              p.price, p.name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    const items = cartResult.rows;
    const totalAmount = items.reduce((sum, item) => {
      return sum + parseFloat(item.price) * item.quantity;
    }, 0);

    // Create order
    const orderId = uuidv4();
    await client.query(
      `INSERT INTO orders (id, user_id, total_amount, status)
       VALUES ($1, $2, $3, 'pending')`,
      [orderId, req.user.id, totalAmount.toFixed(2)]
    );

    // Create order items (snapshot prices)
    for (const item of items) {
      const orderItemId = uuidv4();
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderItemId, orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Order placed successfully.',
      orderId,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    return res.status(500).json({ message: 'Failed to place order.' });
  } finally {
    client.release();
  }
});

// GET /api/orders - get user's orders with items
router.get('/', async (req, res) => {
  try {
    const ordersResult = await pool.query(
      `SELECT id, total_amount, status, created_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    if (ordersResult.rows.length === 0) {
      return res.json([]);
    }

    // Fetch items for all orders
    const orderIds = ordersResult.rows.map((o) => o.id);
    const placeholders = orderIds.map((_, i) => `$${i + 1}`).join(', ');

    const itemsResult = await pool.query(
      `SELECT oi.order_id, oi.quantity, oi.price_at_purchase,
              p.name, p.image, p.category
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id IN (${placeholders})`,
      orderIds
    );

    // Map items to orders
    const itemsByOrder = {};
    for (const item of itemsResult.rows) {
      if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
      itemsByOrder[item.order_id].push(item);
    }

    const orders = ordersResult.rows.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    }));

    return res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    return res.status(500).json({ message: 'Failed to fetch orders.' });
  }
});

module.exports = router;
