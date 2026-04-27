const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authMiddleware);

// GET /api/user - get current user profile
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, city, gender, profile_image, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ message: 'Failed to fetch profile.' });
  }
});

// PUT /api/user - update user profile
router.put(
  '/',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('city').optional().trim(),
    body('gender').optional().isIn(['male', 'female', 'other', '']).withMessage('Invalid gender'),
    body('newPassword')
      .optional()
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters'),
  ],
  validate,
  async (req, res) => {
    const { name, city, gender, currentPassword, newPassword } = req.body;

    try {
      const userResult = await pool.query(
        'SELECT id, password FROM users WHERE id = $1',
        [req.user.id]
      );
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const user = userResult.rows[0];

      // If changing password, verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ message: 'Current password required to set new password.' });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Current password incorrect.' });
        }
      }

      const newPasswordHash = newPassword ? await bcrypt.hash(newPassword, 12) : undefined;

      // Build dynamic update query safely
      const fields = [];
      const values = [];
      let idx = 1;

      if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
      if (city !== undefined) { fields.push(`city = $${idx++}`); values.push(city); }
      if (gender !== undefined) { fields.push(`gender = $${idx++}`); values.push(gender); }
      if (newPasswordHash) { fields.push(`password = $${idx++}`); values.push(newPasswordHash); }

      if (fields.length === 0) {
        return res.status(400).json({ message: 'No fields to update.' });
      }

      values.push(req.user.id);
      await pool.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`,
        values
      );

      const updated = await pool.query(
        'SELECT id, name, email, city, gender, profile_image, created_at FROM users WHERE id = $1',
        [req.user.id]
      );

      return res.json({ message: 'Profile updated.', user: updated.rows[0] });
    } catch (err) {
      console.error('Update user error:', err);
      return res.status(500).json({ message: 'Failed to update profile.' });
    }
  }
);

module.exports = router;
