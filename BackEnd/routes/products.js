const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// GET /api/products - list all, optional ?category=
router.get('/', async (req, res) => {
  const { category } = req.query;

  try {
    let query = 'SELECT * FROM products ORDER BY created_at DESC';
    let params = [];

    if (category && category !== 'all') {
      query = 'SELECT * FROM products WHERE category = $1 ORDER BY created_at DESC';
      params = [category];
    }

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    console.error('Get products error:', err);
    return res.status(500).json({ message: 'Failed to fetch products.' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  // Validate UUID format to prevent injection
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ message: 'Invalid product ID.' });
  }

  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Get product error:', err);
    return res.status(500).json({ message: 'Failed to fetch product.' });
  }
});

module.exports = router;
