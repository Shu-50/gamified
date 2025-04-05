const express = require('express');
const router = express.Router();
const { login, logout, checkAuth } = require('../controllers/authController');

// @route   POST /api/auth/login
// @desc    Login student to classroom
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/logout
// @desc    Logout student
// @access  Private
router.get('/logout', logout);

// @route   GET /api/auth/check
// @desc    Check if student is authenticated
// @access  Public
router.get('/check', checkAuth);

module.exports = router;