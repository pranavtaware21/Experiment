const express = require('express');
const { Op } = require('sequelize');
const { User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/users/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) {
      const existing = await User.findOne({
        where: { email: email.toLowerCase(), id: { [Op.ne]: req.user.id } },
      });
      if (existing) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      updates.email = email;
    }

    await req.user.update(updates);
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
